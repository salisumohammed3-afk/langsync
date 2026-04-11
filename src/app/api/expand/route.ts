import { NextResponse } from 'next/server';
import { generateIdeaDetail } from '@/lib/ai-service';
import type { Idea } from '@/types';

export const maxDuration = 30;

export async function POST(request: Request) {
  const body = await request.json();
  const { idea, company_name, description } = body as {
    idea: Idea;
    company_name: string;
    description: string;
  };

  if (!idea || !company_name) {
    return NextResponse.json(
      { error: 'idea and company_name are required' },
      { status: 400 }
    );
  }

  try {
    const detail = await generateIdeaDetail(idea, company_name, description);
    return NextResponse.json(detail);
  } catch (error) {
    console.error('Idea expansion failed:', error);
    return NextResponse.json(
      { error: 'AI expansion failed. Please try again.' },
      { status: 500 }
    );
  }
}
