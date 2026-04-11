import { NextResponse } from 'next/server';
import { generatePersonas } from '@/lib/ai-service';
import type { DimensionKey } from '@/types';

export const maxDuration = 30;

export async function POST(request: Request) {
  const body = await request.json();
  const { analysis_id, company_name, description, scores } = body as {
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
    const personas = await generatePersonas(
      analysis_id,
      company_name,
      description || `${company_name} — a product being evaluated.`,
      scores
    );
    return NextResponse.json({ personas });
  } catch (error) {
    console.error('Persona generation failed:', error);
    return NextResponse.json(
      { error: 'AI persona generation failed. Please try again.' },
      { status: 500 }
    );
  }
}
