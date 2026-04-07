import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import {
  generateMockResearch,
  generateMockPersonas,
  generateMockIdeas,
} from '@/lib/mock-data';
import type { DimensionKey } from '@/types';

export async function POST(request: Request) {
  const body = await request.json();
  const {
    company_name,
    company_url,
    description,
    input_mode,
    scores,
  } = body as {
    company_name: string;
    company_url?: string;
    description?: string;
    input_mode: 'scan' | 'describe';
    scores: Partial<Record<DimensionKey, number>>;
  };

  if (!company_name) {
    return NextResponse.json(
      { error: 'company_name is required' },
      { status: 400 }
    );
  }

  const analysisId = uuid();

  // Generate mock data (simulating AI processing)
  const research = generateMockResearch(company_name, company_url);
  const personas = generateMockPersonas(analysisId, scores);
  const ideas = generateMockIdeas(analysisId);

  return NextResponse.json({
    analysis: {
      id: analysisId,
      company_name,
      company_url,
      description,
      input_mode,
      created_at: new Date().toISOString(),
      company_research: research,
    },
    personas,
    ideas,
  });
}
