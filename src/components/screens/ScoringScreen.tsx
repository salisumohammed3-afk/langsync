'use client';

import { useAnalysisStore } from '@/store';
import { DIMENSIONS } from '@/types';
import type { DimensionKey } from '@/types';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const DIMENSION_KEYS = Object.keys(DIMENSIONS) as DimensionKey[];

export function ScoringScreen() {
  const { scores, analysis, setScore, setStep, goBack } = useAnalysisStore();

  const allScored = DIMENSION_KEYS.every((key) => scores[key] !== undefined);

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
            Score each dimension 1–10. This establishes your 5-star baseline — the starting point for everything above.
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
            return (
              <div key={key} className="animate-slide-up">
                <div className="flex items-baseline justify-between mb-2">
                  <div>
                    <h3 className="text-base font-semibold text-white">{dim.label}</h3>
                    <p className="text-sm text-gray-500">{dim.description}</p>
                  </div>
                  <span
                    className="text-2xl font-bold tabular-nums"
                    style={{ color: score <= 3 ? '#F87171' : score <= 6 ? '#F59E0B' : '#A3E635' }}
                  >
                    {score}
                  </span>
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

        {/* Average Score Display */}
        {allScored && (
          <div className="mb-8 p-4 rounded-xl bg-ls-dark-card border border-ls-dark-border animate-slide-up">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Overall Average</span>
              <span className="text-xl font-bold gradient-text">
                {(DIMENSION_KEYS.reduce((sum, k) => sum + (scores[k] ?? 5), 0) / DIMENSION_KEYS.length).toFixed(1)}
              </span>
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
