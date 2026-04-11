'use client';

import { useState } from 'react';
import { useAnalysisStore } from '@/store';
import { DIMENSIONS, STAR_TIERS } from '@/types';
import type { DimensionKey, StarLevel } from '@/types';
import { ArrowLeft, ArrowRight, Info, Star } from 'lucide-react';

const DIMENSION_KEYS = Object.keys(DIMENSIONS) as DimensionKey[];

const BENCHMARKS: Record<DimensionKey, Record<number, string>> = {
  customer_experience: {
    1: 'Customers actively warn others away',
    3: 'Basic functionality exists but causes friction',
    5: 'Meets expectations — nothing memorable',
    7: 'Customers recommend you unprompted',
    9: 'People share their experience on social media because it delighted them',
    10: 'Industry benchmark — others study your CX playbook',
  },
  product: {
    1: 'Barely functional, frequent bugs',
    3: 'Works but lacks depth, feels like a template',
    5: 'Solid core features, nothing differentiated',
    7: 'Clear moat — users would struggle to switch',
    9: 'Users say "I didn\'t know I needed this until I had it"',
    10: 'Defines a new category — competitors copy you',
  },
  sales_growth: {
    1: 'No repeatable acquisition channel',
    3: 'Paid ads with poor unit economics',
    5: 'Steady growth, standard playbook',
    7: 'Strong word-of-mouth, organic flywheel emerging',
    9: 'Viral loops — users actively recruit other users',
    10: 'Self-sustaining growth engine, negative churn',
  },
  operations: {
    1: 'Constant firefighting, manual processes',
    3: 'Runs but brittle — breaks when you scale',
    5: 'Reliable day-to-day, some automation',
    7: 'Highly automated, team focuses on improvements not fixes',
    9: 'Operations are a competitive advantage — faster and cheaper than rivals',
    10: 'Self-healing systems, zero-downtime deployments, predictive scaling',
  },
  brand_trust: {
    1: 'Unknown or actively distrusted',
    3: 'Known in niche but no strong opinion',
    5: 'Respected but interchangeable',
    7: 'Strong brand — people trust your new products sight unseen',
    9: 'Cultural icon — your brand represents values people identify with',
    10: 'Generational brand — synonym for the category',
  },
};

function getBenchmarkForScore(dim: DimensionKey, score: number): string {
  const benchmarks = BENCHMARKS[dim];
  const keys = Object.keys(benchmarks).map(Number).sort((a, b) => a - b);
  let closest = keys[0];
  for (const k of keys) {
    if (k <= score) closest = k;
  }
  return benchmarks[closest];
}

function getScoreToTierMapping(avgScore: number): { tier: StarLevel; emphasis: string } {
  if (avgScore <= 3) return { tier: 6, emphasis: 'Focus heavily on 6-star ideas to build your foundation' };
  if (avgScore <= 5) return { tier: 7, emphasis: 'Strong focus on 6-7 star ideas with stretch goals at 8' };
  if (avgScore <= 7) return { tier: 8, emphasis: 'You\'re ready for 7-8 star ideas, with moonshots at 9' };
  return { tier: 9, emphasis: 'Push for transformative 8-9 star ideas — you have the foundation' };
}

export function ScoringScreen() {
  const { scores, analysis, setScore, setStep, goBack } = useAnalysisStore();
  const [hoveredDim, setHoveredDim] = useState<DimensionKey | null>(null);

  const allScored = DIMENSION_KEYS.every((key) => scores[key] !== undefined);
  const avgScore = allScored
    ? DIMENSION_KEYS.reduce((sum, k) => sum + (scores[k] ?? 5), 0) / DIMENSION_KEYS.length
    : 0;
  const tierMapping = allScored ? getScoreToTierMapping(avgScore) : null;

  const handleContinue = () => {
    if (!allScored) return;
    setStep('personas');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl animate-fade-in">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h2 className="text-3xl font-bold text-white mb-2">
            Rate <span className="gradient-text">{analysis?.company_name || 'your product'}</span> today
          </h2>
          <p className="text-gray-400">
            Score each dimension 1–10. This establishes your baseline — the starting point for everything above.
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-10">
          {DIMENSION_KEYS.map((key) => (
            <div
              key={key}
              className={`flex-1 h-1 rounded-full transition-all ${
                scores[key] !== undefined ? 'bg-ls-accent' : 'bg-ls-dark-border'
              }`}
            />
          ))}
        </div>

        {/* Dimension Sliders */}
        <div className="space-y-8 mb-10">
          {DIMENSION_KEYS.map((key) => {
            const dim = DIMENSIONS[key];
            const score = scores[key] ?? 5;
            const benchmark = getBenchmarkForScore(key, score);
            const isHovered = hoveredDim === key;
            return (
              <div
                key={key}
                className="animate-slide-up"
                onMouseEnter={() => setHoveredDim(key)}
                onMouseLeave={() => setHoveredDim(null)}
              >
                <div className="flex items-baseline justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-white">{dim.label}</h3>
                    <div className="relative group">
                      <Info className="w-3.5 h-3.5 text-gray-600 cursor-help" />
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 rounded-lg bg-ls-dark-lighter border border-ls-dark-border text-xs text-gray-400 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 shadow-xl">
                        <p className="font-medium text-gray-300 mb-1">{dim.label}</p>
                        <p>{dim.description}</p>
                      </div>
                    </div>
                  </div>
                  <span
                    className="text-2xl font-bold tabular-nums"
                    style={{ color: score <= 3 ? '#F87171' : score <= 6 ? '#F59E0B' : '#A3E635' }}
                  >
                    {score}
                  </span>
                </div>

                {/* Benchmark hint */}
                <div className={`text-xs text-gray-500 mb-2 h-5 transition-all ${isHovered || scores[key] !== undefined ? 'opacity-100' : 'opacity-0'}`}>
                  {benchmark}
                </div>

                <div className="relative">
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={score}
                    onChange={(e) => setScore(key, Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-600">1</span>
                    <span className="text-xs text-gray-600">10</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Score-to-Tier Mapping */}
        {allScored && tierMapping && (
          <div className="mb-8 p-5 rounded-xl bg-ls-dark-card border border-ls-dark-border animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Overall Average</span>
              <span className="text-xl font-bold gradient-text">
                {avgScore.toFixed(1)}
              </span>
            </div>

            {/* Star tier recommendation */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-1">
                {([6, 7, 8, 9] as StarLevel[]).map((level) => {
                  const tier = STAR_TIERS[level];
                  const isRecommended = level === tierMapping.tier;
                  return (
                    <Star
                      key={level}
                      className={`w-4 h-4 transition-all ${isRecommended ? 'scale-125' : 'opacity-30'}`}
                      style={{ color: tier.color }}
                      fill={isRecommended ? tier.color : 'none'}
                    />
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 flex-1">{tierMapping.emphasis}</p>
            </div>
          </div>
        )}

        {/* Continue */}
        <button
          onClick={handleContinue}
          disabled={!allScored}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-semibold transition-all ${
            allScored
              ? 'bg-gradient-to-r from-ls-accent to-ls-teal text-ls-dark hover:shadow-lg hover:shadow-ls-accent/20 hover:scale-[1.01]'
              : 'bg-ls-dark-card text-gray-500 border border-ls-dark-border cursor-not-allowed'
          }`}
        >
          Continue to Persona Panel
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
