'use client';

import { useEffect } from 'react';
import { useAnalysisStore } from '@/store';
import { DIMENSIONS } from '@/types';
import type { DimensionKey } from '@/types';
import { generateMockPersonas } from '@/lib/mock-data';
import { ArrowLeft, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const DIMENSION_KEYS = Object.keys(DIMENSIONS) as DimensionKey[];

export function PersonaScreen() {
  const { analysis, scores, personas, setPersonas, setStep, goBack } = useAnalysisStore();

  useEffect(() => {
    if (personas.length === 0 && analysis) {
      const generated = generateMockPersonas(analysis.id, scores);
      setPersonas(generated);
    }
  }, [analysis, scores, personas.length, setPersonas]);

  const handleContinue = () => {
    setStep('loading');
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h2 className="text-3xl font-bold text-white mb-2">
            Persona Panel
          </h2>
          <p className="text-gray-400">
            8 AI-generated stakeholders have independently scored{' '}
            <span className="text-white font-medium">{analysis?.company_name}</span>.
            See where they agree — and where they don&apos;t.
          </p>
        </div>

        {/* Persona Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {personas.map((persona, idx) => (
            <div
              key={persona.id}
              className="p-4 rounded-xl bg-ls-dark-card border border-ls-dark-border hover:border-white/10 transition-all animate-slide-up group"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              {/* Persona Header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{persona.emoji}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{persona.name}</p>
                  <p className="text-xs text-gray-500 truncate">{persona.role}</p>
                </div>
              </div>

              <p className="text-xs text-gray-400 mb-4 line-clamp-2">{persona.description}</p>

              {/* Dimension Scores */}
              <div className="space-y-2">
                {DIMENSION_KEYS.map((key) => {
                  const personaScore = persona.scores[key];
                  const userScore = scores[key] ?? 5;
                  const diff = personaScore - userScore;
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 truncate flex-1">
                        {DIMENSIONS[key].label}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-xs font-semibold tabular-nums w-5 text-right"
                          style={{
                            color: personaScore <= 3 ? '#F87171' : personaScore <= 6 ? '#F59E0B' : '#A3E635',
                          }}
                        >
                          {personaScore}
                        </span>
                        {diff > 0 ? (
                          <TrendingUp className="w-3 h-3 text-emerald-400" />
                        ) : diff < 0 ? (
                          <TrendingDown className="w-3 h-3 text-red-400" />
                        ) : (
                          <Minus className="w-3 h-3 text-gray-600" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Variance Summary */}
        <div className="p-5 rounded-xl bg-ls-dark-card border border-ls-dark-border mb-8">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Variance Highlights</h3>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {DIMENSION_KEYS.map((key) => {
              const personaScores = personas.map((p) => p.scores[key]);
              const avg = personaScores.length > 0
                ? personaScores.reduce((s, v) => s + v, 0) / personaScores.length
                : 0;
              const userScore = scores[key] ?? 5;
              const variance = Math.abs(avg - userScore);
              return (
                <div key={key} className="text-center">
                  <p className="text-xs text-gray-500 mb-1">{DIMENSIONS[key].label}</p>
                  <p className="text-sm font-semibold text-white">
                    You: {userScore} / Panel: {avg.toFixed(1)}
                  </p>
                  {variance > 1.5 && (
                    <p className="text-xs text-amber-400 mt-0.5">High variance</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Continue */}
        <button
          onClick={handleContinue}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-semibold bg-gradient-to-r from-ls-accent to-ls-teal text-ls-dark hover:shadow-lg hover:shadow-ls-accent/20 hover:scale-[1.01] transition-all"
        >
          Generate Ideas Across All Models
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
