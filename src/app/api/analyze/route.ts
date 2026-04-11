import { NextResponse } from 'next/server';
import { generateAllIdeas } from '@/lib/ai-service';
import type { DimensionKey } from '@/types';

export const maxDuration = 60;

export async function POST(request: Request) {
  const body = await request.json();
  const {
    analysis_id,
    company_name,
    description,
    scores,
  } = body as {
    analysis_id: string;
    company_name: string;
    description: string;
    scores: Partial<Record<DimensionKey, number>>;
  };

  if (!analysis_id || !company_name) {
    return NextResponse.json(
      { error: 'analysis_id and company_name are required' },
      { status: 400 }
    );
  }

  try {
    const ideas = await generateAllIdeas(analysis_id, company_name, description, scores);
    return NextResponse.json({ ideas });
  } catch (error) {
    console.error('Idea generation failed:', error);
    return NextResponse.json(
      { error: 'AI idea generation failed. Please check API keys and try again.' },
      { status: 500 }
    );
  }
}
