'use client';

import { useAnalysisStore } from '@/store';
import { STAR_TIERS, MODELS, DIMENSIONS } from '@/types';
import type { StarLevel, Idea } from '@/types';
import { generateMockIdeaDetail } from '@/lib/mock-data';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Plus,
  Check,
  Map,
  Star,
} from 'lucide-react';
import React from 'react';

const TIER_KEYS: StarLevel[] = [6, 7, 8, 9];

function renderMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function ModelDot({ model }: { model: string }) {
  const color =
    model === 'claude'
      ? 'bg-ls-claude'
      : model === 'chatgpt'
      ? 'bg-ls-chatgpt'
      : 'bg-ls-gemini';
  return <div className={`w-2 h-2 rounded-full ${color}`} />;
}

function ConfidenceBadge({ confidence }: { confidence: string }) {
  const styles =
    confidence === 'novel'
      ? 'bg-purple-500/10 text-purple-400 ring-purple-500/20'
      : confidence === 'feasible'
      ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20'
      : 'bg-amber-500/10 text-amber-400 ring-amber-500/20';
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ring-1 ${styles}`}>
      {confidence}
    </span>
  );
}

function IdeaCard({ idea }: { idea: Idea }) {
  const {
    expandedIdeaId,
    setExpandedIdea,
    ideaDetails,
    setIdeaDetail,
    addToRoadmap,
    removeFromRoadmap,
    roadmapItems,
  } = useAnalysisStore();

  const isExpanded = expandedIdeaId === idea.id;
  const detail = ideaDetails[idea.id];
  const isInRoadmap = roadmapItems.some((item) => item.idea_id === idea.id);
  const model = MODELS[idea.model_source];
  const dimension = DIMENSIONS[idea.dimension_key];
  const tier = STAR_TIERS[idea.star_level];

  const handleExpand = () => {
    if (isExpanded) {
      setExpandedIdea(null);
      return;
    }
    setExpandedIdea(idea.id);
    if (!detail) {
      const generated = generateMockIdeaDetail(idea);
      setIdeaDetail(idea.id, generated);
    }
  };

  const handleRoadmapToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInRoadmap) {
      removeFromRoadmap(idea.id);
    } else {
      addToRoadmap(idea);
    }
  };

  return (
    <div
      className={`rounded-xl border transition-all ${
        isExpanded
          ? 'bg-ls-dark-lighter border-white/10 shadow-lg'
          : 'bg-ls-dark-card border-ls-dark-border hover:border-white/10'
      }`}
    >
      {/* Card Header */}
      <div
        className="p-5 cursor-pointer"
        onClick={handleExpand}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="text-base font-semibold text-white flex-1">
            {idea.title}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleRoadmapToggle}
              className={`p-1.5 rounded-lg transition-all ${
                isInRoadmap
                  ? 'bg-ls-accent/20 text-ls-accent'
                  : 'bg-ls-dark-border/50 text-gray-500 hover:text-gray-300'
              }`}
              title={isInRoadmap ? 'Remove from roadmap' : 'Add to roadmap'}
            >
              {isInRoadmap ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-4 leading-relaxed">
          {idea.description}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Model attribution */}
          <div className="flex items-center gap-1.5">
            <ModelDot model={idea.model_source} />
            <span className="text-xs text-gray-500">
              {model.name} · {model.lens}
            </span>
          </div>

          {/* Dimension tag */}
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 ring-1 ring-white/5">
            {dimension.label}
          </span>

          {/* Confidence */}
          <ConfidenceBadge confidence={idea.confidence} />
        </div>
      </div>

      {/* Expanded Detail */}
      {isExpanded && detail && (
        <div className="border-t border-ls-dark-border animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:divide-x md:divide-ls-dark-border">
            {/* What It Takes */}
            <div className="p-5">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: tier.color }}
                />
                Flesh It Out
              </h4>
              <div className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">
                {renderMarkdown(detail.what_it_takes)}
              </div>
            </div>

            {/* Regression Version */}
            <div className="p-5 border-t border-ls-dark-border md:border-t-0">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                Regression Version
              </h4>
              <div className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">
                {renderMarkdown(detail.regression_version)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ResultsScreen() {
  const { analysis, ideas, activeTab, setActiveTab, roadmapItems, toggleRoadmap, goBack } =
    useAnalysisStore();

  const tierIdeas = ideas.filter((idea) => idea.star_level === activeTab);
  const tier = STAR_TIERS[activeTab];

  return (
    <div className="min-h-screen">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-ls-dark/90 backdrop-blur-lg border-b border-ls-dark-border">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-ls-dark-card transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-sm font-semibold text-white">{analysis?.company_name}</h1>
              <p className="text-xs text-gray-500">{ideas.length} ideas generated</p>
            </div>
          </div>

          <button
            onClick={toggleRoadmap}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-ls-dark-card border border-ls-dark-border text-sm text-gray-300 hover:text-white hover:border-white/10 transition-all"
          >
            <Map className="w-4 h-4" />
            Roadmap
            {roadmapItems.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold bg-ls-accent/20 text-ls-accent rounded-full">
                {roadmapItems.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Star Level Tabs */}
        <div className="flex gap-2 mb-8 p-1 bg-ls-dark-card rounded-xl border border-ls-dark-border">
          {TIER_KEYS.map((level) => {
            const t = STAR_TIERS[level];
            const count = ideas.filter((i) => i.star_level === level).length;
            const isActive = activeTab === level;
            return (
              <button
                key={level}
                onClick={() => setActiveTab(level)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-ls-dark-lighter text-white shadow-lg'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Star
                  className="w-4 h-4"
                  style={{ color: isActive ? t.color : undefined }}
                  fill={isActive ? t.color : 'none'}
                />
                <span>{level}-Star</span>
                <span className="text-xs text-gray-500">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Tier Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold" style={{ color: tier.color }}>
              {tier.label}
            </h2>
            <span className="text-sm text-gray-500">
              {activeTab}-Star Experience
            </span>
          </div>
          <p className="text-gray-400 text-sm">{tier.character}</p>
        </div>

        {/* Idea Cards */}
        <div className="space-y-4 animate-fade-in">
          {tierIdeas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>

        {tierIdeas.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            No ideas generated for this tier.
          </div>
        )}
      </div>
    </div>
  );
}
