import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const maxDuration = 30;

async function fetchPageContent(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LangSync/1.0)',
        Accept: 'text/html',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3000);
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: Request) {
  const { url } = (await request.json()) as { url: string };

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    const pageContent = await fetchPageContent(normalizedUrl);

    if (!pageContent || pageContent.length < 50) {
      return NextResponse.json(
        { error: 'Could not extract meaningful content from the URL.' },
        { status: 422 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `Analyze this company's website content and extract a structured summary.

Website content:
${pageContent}

Return ONLY valid JSON (no markdown fences):
{
  "company_name": "detected company name",
  "industry": "detected industry (e.g. 'Developer Tools', 'FinTech', 'EdTech', 'Healthcare')",
  "description": "2-3 sentence description of what the company does, their target market, and value proposition",
  "key_products": ["product 1", "product 2", "product 3"],
  "target_audience": "who they serve"
}`,
        },
      ],
      max_tokens: 512,
    });

    const text = response.choices[0]?.message?.content ?? '';
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('URL scan failed:', error);
    return NextResponse.json(
      { error: 'Failed to scan URL. Please check the URL and try again.' },
      { status: 500 }
    );
  }
}
