'use client';

import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type {
  AnalysisSession,
  FlowStep,
  DimensionKey,
  StarLevel,
  Persona,
  Idea,
  IdeaDetail,
  RoadmapItem,
  InputMode,
  Analysis,
} from '@/types';

interface AnalysisStore extends AnalysisSession {
  // Navigation
  setStep: (step: FlowStep) => void;
  goBack: () => void;

  // Input
  startAnalysis: (mode: InputMode, companyName: string, companyUrl: string, description: string) => void;

  // Scoring
  setScore: (dimension: DimensionKey, score: number) => void;

  // Personas
  setPersonas: (personas: Persona[]) => void;

  // Ideas
  setIdeas: (ideas: Idea[]) => void;
  setIdeaDetail: (ideaId: string, detail: IdeaDetail) => void;

  // Results UI
  setActiveTab: (tab: StarLevel) => void;
  setExpandedIdea: (id: string | null) => void;

  // Roadmap
  toggleRoadmap: () => void;
  addToRoadmap: (idea: Idea) => void;
  removeFromRoadmap: (ideaId: string) => void;

  // Reset
  reset: () => void;
}

const STEP_ORDER: FlowStep[] = ['input', 'scoring', 'personas', 'loading', 'results'];

const initialState: AnalysisSession = {
  step: 'input',
  analysis: undefined,
  scores: {},
  personas: [],
  ideas: [],
  ideaDetails: {},
  roadmapItems: [],
  activeTab: 6,
  expandedIdeaId: null,
  roadmapOpen: false,
};

export const useAnalysisStore = create<AnalysisStore>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  goBack: () => {
    const currentIndex = STEP_ORDER.indexOf(get().step);
    if (currentIndex > 0) {
      set({ step: STEP_ORDER[currentIndex - 1] });
    }
  },

  startAnalysis: (mode, companyName, companyUrl, description) => {
    const analysis: Analysis = {
      id: uuid(),
      company_name: companyName,
      company_url: companyUrl || undefined,
      description,
      input_mode: mode,
      created_at: new Date().toISOString(),
    };
    set({ analysis, step: 'scoring' });
  },

  setScore: (dimension, score) => {
    set((state) => ({
      scores: { ...state.scores, [dimension]: score },
    }));
  },

  setPersonas: (personas) => set({ personas }),

  setIdeas: (ideas) => set({ ideas }),

  setIdeaDetail: (ideaId, detail) => {
    set((state) => ({
      ideaDetails: { ...state.ideaDetails, [ideaId]: detail },
    }));
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  setExpandedIdea: (id) => set({ expandedIdeaId: id }),

  toggleRoadmap: () => set((state) => ({ roadmapOpen: !state.roadmapOpen })),

  addToRoadmap: (idea) => {
    const state = get();
    if (state.roadmapItems.some((item) => item.idea_id === idea.id)) return;
    const item: RoadmapItem = {
      id: uuid(),
      analysis_id: idea.analysis_id,
      idea_id: idea.id,
      idea,
      position: state.roadmapItems.length,
    };
    set({ roadmapItems: [...state.roadmapItems, item] });
  },

  removeFromRoadmap: (ideaId) => {
    set((state) => ({
      roadmapItems: state.roadmapItems
        .filter((item) => item.idea_id !== ideaId)
        .map((item, i) => ({ ...item, position: i })),
    }));
  },

  reset: () => set(initialState),
}));
