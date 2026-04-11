'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

// ── Saved session (for history) ──

export interface SavedSession {
  id: string;
  analysis: Analysis;
  scores: Partial<Record<DimensionKey, number>>;
  personas: Persona[];
  ideas: Idea[];
  ideaDetails: Record<string, IdeaDetail>;
  roadmapItems: RoadmapItem[];
  savedAt: string;
}

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
  reorderRoadmap: (fromIndex: number, toIndex: number) => void;

  // Session history
  savedSessions: SavedSession[];
  saveCurrentSession: () => void;
  loadSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;

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

export const useAnalysisStore = create<AnalysisStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      savedSessions: [],

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

      setIdeas: (ideas) => {
        set({ ideas });
        // Auto-save when ideas are generated (meaningful checkpoint)
        setTimeout(() => get().saveCurrentSession(), 100);
      },

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

      reorderRoadmap: (fromIndex, toIndex) => {
        set((state) => {
          const items = [...state.roadmapItems];
          const [moved] = items.splice(fromIndex, 1);
          items.splice(toIndex, 0, moved);
          return { roadmapItems: items.map((item, i) => ({ ...item, position: i })) };
        });
      },

      // ── Session History ──

      saveCurrentSession: () => {
        const state = get();
        if (!state.analysis || state.ideas.length === 0) return;

        const session: SavedSession = {
          id: state.analysis.id,
          analysis: state.analysis,
          scores: state.scores,
          personas: state.personas,
          ideas: state.ideas,
          ideaDetails: state.ideaDetails,
          roadmapItems: state.roadmapItems,
          savedAt: new Date().toISOString(),
        };

        set((s) => {
          const existing = s.savedSessions.filter((ss) => ss.id !== session.id);
          return { savedSessions: [session, ...existing].slice(0, 20) };
        });
      },

      loadSession: (sessionId) => {
        const session = get().savedSessions.find((s) => s.id === sessionId);
        if (!session) return;
        set({
          step: 'results',
          analysis: session.analysis,
          scores: session.scores,
          personas: session.personas,
          ideas: session.ideas,
          ideaDetails: session.ideaDetails,
          roadmapItems: session.roadmapItems,
          activeTab: 6,
          expandedIdeaId: null,
          roadmapOpen: false,
        });
      },

      deleteSession: (sessionId) => {
        set((state) => ({
          savedSessions: state.savedSessions.filter((s) => s.id !== sessionId),
        }));
      },

      reset: () => set({ ...initialState }),
    }),
    {
      name: 'langsync-analysis',
      partialize: (state) => ({
        step: state.step,
        analysis: state.analysis,
        scores: state.scores,
        personas: state.personas,
        ideas: state.ideas,
        ideaDetails: state.ideaDetails,
        roadmapItems: state.roadmapItems,
        activeTab: state.activeTab,
        savedSessions: state.savedSessions,
      }),
    }
  )
);
