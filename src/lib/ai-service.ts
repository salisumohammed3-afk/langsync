import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuid } from 'uuid';
import type {
  Persona,
  Idea,
  IdeaDetail,
  DimensionKey,
  StarLevel,
  ModelSource,
} from '@/types';

// ── Clients ──

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function getGemini() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
}

// ── Shared context builder ──

function buildContext(
  companyName: string,
  description: string,
  scores: Partial<Record<DimensionKey, number>>
): string {
  const scoreLines = Object.entries(scores)
    .map(([k, v]) => `  ${k.replace('_', ' ')}: ${v}/10`)
    .join('\n');

  return `Product/Company: ${companyName}
Description: ${description}
Current self-assessment scores (1-10):
${scoreLines}`;
}

// ── Persona Generation (Claude) ──

export async function generatePersonas(
  analysisId: string,
  companyName: string,
  description: string,
  scores: Partial<Record<DimensionKey, number>>
): Promise<Persona[]> {
  const context = buildContext(companyName, description, scores);
  const anthropic = getAnthropic();

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `You are generating stakeholder personas for a 10-star experience analysis.

${context}

Generate exactly 8 diverse stakeholder personas who would evaluate this product from different angles. Each persona should be RELEVANT to this specific product/industry — not generic SaaS roles.

For each persona, provide scores for these 5 dimensions (1-10, with some variance from the user's self-assessment):
- customer_experience
- product
- sales_growth
- operations
- brand_trust

Return ONLY valid JSON — no markdown, no code fences, no explanation. Format:
[
  {
    "name": "Full Name",
    "emoji": "single emoji",
    "role": "Their Role/Title",
    "description": "One sentence about their perspective and what they care about.",
    "scores": {
      "customer_experience": 7,
      "product": 8,
      "sales_growth": 6,
      "operations": 5,
      "brand_trust": 7
    }
  }
]`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const parsed = JSON.parse(text) as Array<{
    name: string;
    emoji: string;
    role: string;
    description: string;
    scores: Record<DimensionKey, number>;
  }>;

  return parsed.map((p) => ({
    id: uuid(),
    analysis_id: analysisId,
    name: p.name,
    emoji: p.emoji,
    role: p.role,
    description: p.description,
    scores: p.scores,
  }));
}

// ── Idea Generation ──

const LENS_PROMPTS: Record<ModelSource, string> = {
  claude: `You are using the "Cross-Industry Analogies" lens. Hunt for winning patterns from completely unrelated sectors and adapt them to this product's context. Think about what hospitals, airlines, game studios, luxury hotels, or logistics companies do brilliantly that could be reimagined here.`,
  chatgpt: `You are using the "Unlimited Budget" lens. Imagine what the experience would look like if money, time, and technical constraints didn't exist. Dream big, then work backwards to find the insight.`,
  gemini: `You are using the "Emotional Moment Mapping" lens. Identify flat or negative emotional moments in the current user journey and reimagine them as peaks. Focus on how users FEEL, not just what they do.`,
};

function buildIdeaPrompt(
  modelSource: ModelSource,
  companyName: string,
  description: string,
  scores: Partial<Record<DimensionKey, number>>
): string {
  const context = buildContext(companyName, description, scores);
  const lensPrompt = LENS_PROMPTS[modelSource];

  return `You are part of a 10-star experience analysis for a product.

${context}

${lensPrompt}

Generate exactly 8 ideas — 2 for each star tier:
- 6-Star (Delightful): Small surprises that make people smile and tell a friend. Feasible today with focus.
- 7-Star (Remarkable): Moments so good they become stories people repeat. Requires meaningful investment.
- 8-Star (Extraordinary): Experiences that feel impossible. People wonder how you did it. Requires rethinking systems.
- 9-Star (Transformative): Category-redefining. Changes what people expect from everyone in your space.

For each idea, assign it to one of these dimensions: customer_experience, product, sales_growth, operations, brand_trust.
Also assign a confidence level: "feasible", "balanced", or "novel".

IMPORTANT: Every idea must be SPECIFIC to "${companyName}" and its described purpose. Do NOT generate generic SaaS ideas.

Return ONLY valid JSON — no markdown, no code fences, no explanation. Format:
[
  {
    "star_level": 6,
    "title": "Short Catchy Title",
    "description": "2-3 sentence description of the idea, specific to this product.",
    "dimension_key": "customer_experience",
    "confidence": "feasible"
  }
]`;
}

async function generateIdeasClaude(
  analysisId: string,
  companyName: string,
  description: string,
  scores: Partial<Record<DimensionKey, number>>
): Promise<Idea[]> {
  const anthropic = getAnthropic();
  const prompt = buildIdeaPrompt('claude', companyName, description, scores);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  return parseIdeas(text, analysisId, 'claude', 'Cross-Industry Analogies');
}

async function generateIdeasChatGPT(
  analysisId: string,
  companyName: string,
  description: string,
  scores: Partial<Record<DimensionKey, number>>
): Promise<Idea[]> {
  const openai = getOpenAI();
  const prompt = buildIdeaPrompt('chatgpt', companyName, description, scores);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2048,
  });

  const text = response.choices[0]?.message?.content ?? '';
  return parseIdeas(text, analysisId, 'chatgpt', 'Unlimited Budget');
}

async function generateIdeasGemini(
  analysisId: string,
  companyName: string,
  description: string,
  scores: Partial<Record<DimensionKey, number>>
): Promise<Idea[]> {
  const model = getGemini();
  const prompt = buildIdeaPrompt('gemini', companyName, description, scores);

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseIdeas(text, analysisId, 'gemini', 'Emotional Moment Mapping');
}

function parseIdeas(
  text: string,
  analysisId: string,
  modelSource: ModelSource,
  lens: string
): Idea[] {
  // Strip markdown code fences if present
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed = JSON.parse(cleaned) as Array<{
    star_level: StarLevel;
    title: string;
    description: string;
    dimension_key: DimensionKey;
    confidence: 'novel' | 'balanced' | 'feasible';
  }>;

  return parsed.map((item) => ({
    id: uuid(),
    analysis_id: analysisId,
    star_level: item.star_level,
    title: item.title,
    description: item.description,
    model_source: modelSource,
    lens,
    dimension_key: item.dimension_key,
    confidence: item.confidence,
  }));
}

// ── Retry helper ──

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  delayMs = 3000
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const isRateLimit =
        err instanceof Error &&
        (err.message.includes('429') ||
          err.message.includes('Too Many Requests') ||
          err.message.includes('RESOURCE_EXHAUSTED'));
      const status = (err as { status?: number }).status;
      if ((isRateLimit || status === 429) && attempt < retries) {
        console.warn(`Rate limited, retrying in ${delayMs}ms (attempt ${attempt + 1}/${retries})...`);
        await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw new Error('withRetry: should not reach here');
}

// ── Generate all ideas in parallel (resilient) ──

export async function generateAllIdeas(
  analysisId: string,
  companyName: string,
  description: string,
  scores: Partial<Record<DimensionKey, number>>
): Promise<Idea[]> {
  const results = await Promise.allSettled([
    withRetry(() => generateIdeasClaude(analysisId, companyName, description, scores)),
    withRetry(() => generateIdeasChatGPT(analysisId, companyName, description, scores)),
    withRetry(() => generateIdeasGemini(analysisId, companyName, description, scores), 3, 5000),
  ]);

  const allIdeas: Idea[] = [];
  const modelNames = ['Claude', 'ChatGPT', 'Gemini'];
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === 'fulfilled') {
      allIdeas.push(...result.value);
    } else {
      console.error(`${modelNames[i]} idea generation failed:`, result.reason);
    }
  }

  if (allIdeas.length === 0) {
    throw new Error('All AI models failed to generate ideas.');
  }

  return allIdeas;
}

// ── Idea Detail Expansion ──

export async function generateIdeaDetail(
  idea: Idea,
  companyName: string,
  description: string
): Promise<IdeaDetail> {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: `You are expanding on a specific idea from a 10-star experience analysis.

Product: ${companyName}
Description: ${description}

The idea to expand:
Title: ${idea.title}
Description: ${idea.description}
Star Level: ${idea.star_level}-Star
Dimension: ${idea.dimension_key}
Generated by: ${idea.model_source} using ${idea.lens} lens

Generate TWO sections:

1. **"Flesh It Out"** — A practical implementation plan. Include:
   - **Complexity:** (Low/Moderate/High/Very High)
   - **Timeline:** (specific estimate)
   - **Team:** (specific roles and headcount)
   - **Key Requirements:** (3-5 bullet points specific to THIS idea and THIS product)
   - **Dependencies:** (2-3 items)
   - **Risks:** (2-3 items)

2. **"Regression Version"** (The 80/20 Version) — A pragmatic first step that captures most of the value:
   - **What to build:** (simplified version specific to THIS idea)
   - **Timeline:** and **Cost:** relative to full build
   - **How it works:** (3-4 numbered steps)
   - **What you sacrifice:** (3 bullet points)
   - **What you keep:** (3 bullet points)

IMPORTANT: Every detail must be SPECIFIC to "${companyName}" and "${idea.title}". Do NOT use generic boilerplate.

Use **bold** markdown for headers within the text. Return ONLY valid JSON:
{
  "what_it_takes": "full text with **bold** markdown headers and line breaks",
  "regression_version": "full text with **bold** markdown headers and line breaks"
}`,
      },
    ],
    max_tokens: 2048,
  });

  const text = response.choices[0]?.message?.content ?? '';
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed = JSON.parse(cleaned) as {
    what_it_takes: string;
    regression_version: string;
  };

  return {
    id: uuid(),
    idea_id: idea.id,
    what_it_takes: parsed.what_it_takes,
    regression_version: parsed.regression_version,
  };
}
