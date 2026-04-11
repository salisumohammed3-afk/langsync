// ── LangSync 10-Star Platform Types ──

export type InputMode = 'scan' | 'describe';

export type DimensionKey =
  | 'customer_experience'
  | 'product'
  | 'sales_growth'
  | 'operations'
  | 'brand_trust';

export const DIMENSIONS: Record<DimensionKey, { label: string; description: string }> = {
  customer_experience: {
    label: 'Customer Experience',
    description: 'How the end user feels at every touchpoint.',
  },
  product: {
    label: 'Product',
    description: 'The quality, depth, and differentiation of what you\'ve built.',
  },
  sales_growth: {
    label: 'Sales & Growth',
    description: 'How effectively you acquire and expand customers.',
  },
  operations: {
    label: 'Operations',
    description: 'The machinery behind the scenes. Reliability, speed, efficiency.',
  },
  brand_trust: {
    label: 'Brand & Trust',
    description: 'How people perceive you when you\'re not in the room.',
  },
};

export type StarLevel = 6 | 7 | 8 | 9;

export const STAR_TIERS: Record<StarLevel, { label: string; character: string; color: string; bgColor: string }> = {
  6: {
    label: 'Delightful',
    character: 'Small surprises that make people smile and tell a friend. Feasible today with focus.',
    color: '#2DD4BF',
    bgColor: 'bg-teal-400',
  },
  7: {
    label: 'Remarkable',
    character: 'Moments so good they become stories people repeat. Requires meaningful investment.',
    color: '#F59E0B',
    bgColor: 'bg-amber-400',
  },
  8: {
    label: 'Extraordinary',
    character: 'Experiences that feel impossible. People wonder how you did it. Requires rethinking systems.',
    color: '#F87171',
    bgColor: 'bg-red-400',
  },
  9: {
    label: 'Transformative',
    character: 'Category-redefining. Changes what people expect from everyone in your space.',
    color: '#A3E635',
    bgColor: 'bg-lime-400',
  },
};

export type ModelSource = 'claude' | 'chatgpt' | 'gemini';

export const MODELS: Record<ModelSource, { name: string; provider: string; lens: string; lensDescription: string; color: string }> = {
  claude: {
    name: 'Claude',
    provider: 'Anthropic',
    lens: 'Cross-Industry Analogies',
    lensDescription: 'Hunts for winning patterns from completely unrelated sectors and adapts them to your context.',
    color: '#D97706',
  },
  chatgpt: {
    name: 'ChatGPT',
    provider: 'OpenAI',
    lens: 'Unlimited Budget',
    lensDescription: 'Imagines what the experience would look like if money, time, and technical constraints didn\'t exist.',
    color: '#10B981',
  },
  gemini: {
    name: 'Gemini',
    provider: 'Google',
    lens: 'Emotional Moment Mapping',
    lensDescription: 'Identifies flat or negative emotional moments in the current journey and reimagines them as peaks.',
    color: '#6366F1',
  },
};

// ── Data Model ──

export interface Analysis {
  id: string;
  company_name: string;
  company_url?: string;
  description: string;
  input_mode: InputMode;
  created_at: string;
  company_research?: CompanyResearch;
}

export interface CompanyResearch {
  value_proposition: string;
  target_market: string;
  product_surfaces: string[];
  key_journeys: string[];
  summary: string;
}

export interface DimensionScore {
  id: string;
  analysis_id: string;
  dimension_key: DimensionKey;
  user_score: number;
}

export interface Persona {
  id: string;
  analysis_id: string;
  name: string;
  emoji: string;
  role: string;
  description: string;
  scores: Record<DimensionKey, number>;
}

export interface Idea {
  id: string;
  analysis_id: string;
  star_level: StarLevel;
  title: string;
  description: string;
  model_source: ModelSource;
  lens: string;
  dimension_key: DimensionKey;
  confidence: 'novel' | 'balanced' | 'feasible';
}

export interface IdeaDetail {
  id: string;
  idea_id: string;
  what_it_takes: string;
  regression_version: string;
}

export interface RoadmapItem {
  id: string;
  analysis_id: string;
  idea_id: string;
  idea: Idea;
  position: number;
}

// ── Flow State ──

export type FlowStep =
  | 'input'
  | 'scoring'
  | 'personas'
  | 'loading'
  | 'results';

export interface AnalysisSession {
  step: FlowStep;
  analysis?: Analysis;
  scores: Partial<Record<DimensionKey, number>>;
  personas: Persona[];
  ideas: Idea[];
  ideaDetails: Record<string, IdeaDetail>;
  roadmapItems: RoadmapItem[];
  activeTab: StarLevel;
  expandedIdeaId: string | null;
  roadmapOpen: boolean;
}
