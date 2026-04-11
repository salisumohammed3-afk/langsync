'use client';

import { useEffect, useState } from 'react';
import { useAnalysisStore } from '@/store';
import { DIMENSIONS } from '@/types';
import type { DimensionKey, Persona } from '@/types';
import { ArrowLeft, ArrowRight, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';

const DIMENSION_KEYS = Object.keys(DIMENSIONS) as DimensionKey[];

export function PersonaScreen() {
  const { analysis, scores, personas, setPersonas, setStep, goBack } = useAnalysisStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (personas.length === 0 && analysis && !loading) {
      setLoading(true);
      setError(null);
      fetch('/api/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis_id: analysis.id,
          company_name: analysis.company_name,
          description: analysis.description,
          scores,
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Persona generation failed');
          return res.json();
        })
        .then((data: { personas: Persona[] }) => {
          setPersonas(data.personas);
        })
        .catch((err) => {
          console.error(err);
          setError('Failed to generate personas. Please try again.');
        })
        .finally(() => setLoading(false));
    }
  }, [analysis, scores, personas.length, setPersonas, loading]);

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

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <Loader2 className="w-10 h-10 text-ls-accent animate-spin mb-4" />
            <p className="text-gray-400 text-sm">Generating stakeholder personas with AI...</p>
            <p className="text-gray-600 text-xs mt-1">This may take 10–15 seconds</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <p className="text-red-400 text-sm mb-3">{error}</p>
            <button
              onClick={() => { setError(null); setPersonas([]); }}
              className="px-4 py-2 rounded-lg bg-white/5 text-white text-sm hover:bg-white/10 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Persona Grid */}
        {!loading && !error && personas.length > 0 && (
        <>
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
        </>
        )}
      </div>
    </div>
  );
}
