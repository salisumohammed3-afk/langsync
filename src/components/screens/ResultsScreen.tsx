'use client';

import { useState, useMemo } from 'react';
import { useAnalysisStore } from '@/store';
import { STAR_TIERS, MODELS, DIMENSIONS } from '@/types';
import type { StarLevel, Idea, IdeaDetail, ModelSource, DimensionKey } from '@/types';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Plus,
  Check,
  Map,
  Star,
  Loader2,
  Filter,
  ArrowUpDown,
  Info,
  Download,
} from 'lucide-react';
import React from 'react';
import { Markdown } from '@/components/ui/Markdown';

const TIER_KEYS: StarLevel[] = [6, 7, 8, 9];
const MODEL_KEYS: ModelSource[] = ['claude', 'chatgpt', 'gemini'];
const DIMENSION_KEYS = Object.keys(DIMENSIONS) as DimensionKey[];

const TIER_REASONS: Record<StarLevel, string> = {
  6: 'Rated 6-star because it\'s achievable now with focused effort — a quick win that delights users and builds momentum.',
  7: 'Rated 7-star because it requires meaningful investment but creates stories users repeat. It\'s a step beyond good to memorable.',
  8: 'Rated 8-star because it demands system-level rethinking. Users will wonder "how did they do that?" — it feels impossible.',
  9: 'Rated 9-star because it redefines the category itself. This changes what customers expect from everyone in your space.',
};

type SortMode = 'default' | 'dimension_relevance' | 'confidence';

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
    analysis,
    expandedIdeaId,
    setExpandedIdea,
    ideaDetails,
    setIdeaDetail,
    addToRoadmap,
    removeFromRoadmap,
    roadmapItems,
  } = useAnalysisStore();

  const [loadingDetail, setLoadingDetail] = useState(false);
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
    if (!detail && !loadingDetail) {
      setLoadingDetail(true);
      fetch('/api/expand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea,
          company_name: analysis?.company_name ?? '',
          description: analysis?.description ?? '',
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Expansion failed');
          return res.json();
        })
        .then((data: IdeaDetail) => {
          setIdeaDetail(idea.id, data);
        })
        .catch((err) => {
          console.error('Idea expansion failed:', err);
        })
        .finally(() => setLoadingDetail(false));
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

  const handleExportIdea = (e: React.MouseEvent) => {
    e.stopPropagation();
    let content = `# ${idea.title}\n\n`;
    content += `**Star Level:** ${idea.star_level}-Star (${tier.label})\n`;
    content += `**Model:** ${model.name} — ${model.lens}\n`;
    content += `**Dimension:** ${dimension.label}\n`;
    content += `**Confidence:** ${idea.confidence}\n\n`;
    content += `## Description\n\n${idea.description}\n`;
    if (detail) {
      content += `\n## Flesh It Out\n\n${detail.what_it_takes}\n`;
      content += `\n## Regression Version\n\n${detail.regression_version}\n`;
    }
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${idea.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
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
              onClick={handleExportIdea}
              className="p-1.5 rounded-lg bg-ls-dark-border/50 text-gray-500 hover:text-gray-300 transition-all"
              title="Export as Markdown"
            >
              <Download className="w-4 h-4" />
            </button>
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

          {/* Why this tier tooltip */}
          <div className="relative group">
            <div className="flex items-center gap-1 cursor-help">
              <Info className="w-3 h-3 text-gray-600" />
              <span className="text-xs text-gray-600">Why {idea.star_level}-star?</span>
            </div>
            <div className="absolute left-0 bottom-full mb-2 w-72 p-3 rounded-lg bg-ls-dark-lighter border border-ls-dark-border text-xs text-gray-400 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-30 shadow-xl">
              {TIER_REASONS[idea.star_level]}
            </div>
          </div>
        </div>
      </div>

      {/* Loading Detail */}
      {isExpanded && loadingDetail && !detail && (
        <div className="border-t border-ls-dark-border p-8 flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 text-ls-accent animate-spin" />
          <span className="text-sm text-gray-400">Generating detailed analysis with AI...</span>
        </div>
      )}

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
              <Markdown text={detail.what_it_takes} />
            </div>

            {/* Regression Version */}
            <div className="p-5 border-t border-ls-dark-border md:border-t-0">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                Regression Version
              </h4>
              <Markdown text={detail.regression_version} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ResultsScreen() {
  const { analysis, ideas, scores, activeTab, setActiveTab, roadmapItems, toggleRoadmap, goBack } =
    useAnalysisStore();

  const [modelFilter, setModelFilter] = useState<ModelSource | 'all'>('all');
  const [dimensionFilter, setDimensionFilter] = useState<DimensionKey | 'all'>('all');
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [showFilters, setShowFilters] = useState(false);

  const tier = STAR_TIERS[activeTab];

  const filteredIdeas = useMemo(() => {
    let filtered = ideas.filter((idea) => idea.star_level === activeTab);

    if (modelFilter !== 'all') {
      filtered = filtered.filter((i) => i.model_source === modelFilter);
    }
    if (dimensionFilter !== 'all') {
      filtered = filtered.filter((i) => i.dimension_key === dimensionFilter);
    }

    if (sortMode === 'dimension_relevance') {
      filtered.sort((a, b) => {
        const aScore = scores[a.dimension_key] ?? 5;
        const bScore = scores[b.dimension_key] ?? 5;
        return aScore - bScore; // Lower-scored dimensions first
      });
    } else if (sortMode === 'confidence') {
      const order = { feasible: 0, balanced: 1, novel: 2 };
      filtered.sort((a, b) => order[a.confidence] - order[b.confidence]);
    }

    return filtered;
  }, [ideas, activeTab, modelFilter, dimensionFilter, sortMode, scores]);

  const activeFilterCount =
    (modelFilter !== 'all' ? 1 : 0) +
    (dimensionFilter !== 'all' ? 1 : 0) +
    (sortMode !== 'default' ? 1 : 0);

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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-all ${
                showFilters || activeFilterCount > 0
                  ? 'bg-ls-accent/10 border-ls-accent/20 text-ls-accent'
                  : 'bg-ls-dark-card border-ls-dark-border text-gray-300 hover:text-white hover:border-white/10'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filter
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.5 text-xs font-semibold bg-ls-accent/20 text-ls-accent rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
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

        {/* Filter Bar */}
        {showFilters && (
          <div className="max-w-5xl mx-auto px-6 pb-3 animate-slide-up">
            <div className="flex flex-wrap gap-3 p-3 rounded-lg bg-ls-dark-card border border-ls-dark-border">
              {/* Model Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Model:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setModelFilter('all')}
                    className={`px-2 py-1 rounded text-xs transition-all ${
                      modelFilter === 'all' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    All
                  </button>
                  {MODEL_KEYS.map((key) => (
                    <button
                      key={key}
                      onClick={() => setModelFilter(modelFilter === key ? 'all' : key)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all ${
                        modelFilter === key ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: MODELS[key].color }} />
                      {MODELS[key].name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dimension Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Dimension:</span>
                <select
                  value={dimensionFilter}
                  onChange={(e) => setDimensionFilter(e.target.value as DimensionKey | 'all')}
                  className="px-2 py-1 rounded text-xs bg-ls-dark border border-ls-dark-border text-gray-300 focus:outline-none"
                >
                  <option value="all">All</option>
                  {DIMENSION_KEYS.map((key) => (
                    <option key={key} value={key}>{DIMENSIONS[key].label}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3 h-3 text-gray-500" />
                <select
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as SortMode)}
                  className="px-2 py-1 rounded text-xs bg-ls-dark border border-ls-dark-border text-gray-300 focus:outline-none"
                >
                  <option value="default">Default order</option>
                  <option value="dimension_relevance">Weakest dimensions first</option>
                  <option value="confidence">Most feasible first</option>
                </select>
              </div>

              {/* Clear filters */}
              {activeFilterCount > 0 && (
                <button
                  onClick={() => { setModelFilter('all'); setDimensionFilter('all'); setSortMode('default'); }}
                  className="text-xs text-gray-500 hover:text-white px-2 py-1 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}
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

        {/* Model comparison summary */}
        <div className="flex gap-2 mb-6">
          {MODEL_KEYS.map((key) => {
            const count = ideas.filter((i) => i.star_level === activeTab && i.model_source === key).length;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setModelFilter(modelFilter === key ? 'all' : key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                  modelFilter === key
                    ? 'bg-white/10 text-white ring-1 ring-white/10'
                    : 'bg-ls-dark-card border border-ls-dark-border text-gray-400 hover:text-white'
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: MODELS[key].color }} />
                {MODELS[key].name}: {count}
              </button>
            );
          })}
        </div>

        {/* Idea Cards */}
        <div className="space-y-4 animate-fade-in">
          {filteredIdeas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>

        {filteredIdeas.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-2">
              {ideas.filter((i) => i.star_level === activeTab).length > 0
                ? 'No ideas match the current filters.'
                : 'No ideas generated for this tier.'}
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={() => { setModelFilter('all'); setDimensionFilter('all'); setSortMode('default'); }}
                className="text-sm text-ls-accent hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
