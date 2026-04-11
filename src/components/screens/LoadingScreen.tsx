'use client';

import { useEffect, useState, useRef } from 'react';
import { useAnalysisStore } from '@/store';
import { MODELS } from '@/types';
import type { ModelSource, Idea } from '@/types';
import { Sparkles } from 'lucide-react';

const MODEL_KEYS: ModelSource[] = ['claude', 'chatgpt', 'gemini'];

const PROGRESS_STEPS = [
  'Sending context to AI models...',
  'Claude: Scanning cross-industry patterns...',
  'ChatGPT: Removing all constraints...',
  'Gemini: Mapping emotional moments...',
  'Models are thinking...',
  'Generating ideas across all tiers...',
  'Organising and calibrating results...',
  'Almost there...',
];

export function LoadingScreen() {
  const { analysis, scores, setIdeas, setStep, goBack } = useAnalysisStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [modelStatus, setModelStatus] = useState<Record<ModelSource, 'waiting' | 'active' | 'done'>>({
    claude: 'waiting',
    chatgpt: 'waiting',
    gemini: 'waiting',
  });
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fetchStarted = useRef(false);

  useEffect(() => {
    if (!analysis || fetchStarted.current) return;
    fetchStarted.current = true;

    // Animate progress steps
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= PROGRESS_STEPS.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 3000);

    // Animate model status (show active immediately since all 3 run in parallel)
    const timers = [
      setTimeout(() => setModelStatus((s) => ({ ...s, claude: 'active' })), 500),
      setTimeout(() => setModelStatus((s) => ({ ...s, chatgpt: 'active' })), 1000),
      setTimeout(() => setModelStatus((s) => ({ ...s, gemini: 'active' })), 1500),
    ];

    // Slow progress bar that fills to ~85% while waiting for API
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          clearInterval(progressInterval);
          return 85;
        }
        return prev + 1;
      });
    }, 400);

    // REAL API call
    fetch('/api/analyze', {
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
        if (!res.ok) throw new Error('API call failed');
        return res.json();
      })
      .then((data: { ideas: Idea[] }) => {
        // Mark all models done and fill progress
        setModelStatus({ claude: 'done', chatgpt: 'done', gemini: 'done' });
        setProgress(100);
        setCurrentStep(PROGRESS_STEPS.length - 1);

        // Brief pause to show completion state, then transition
        setTimeout(() => {
          setIdeas(data.ideas);
          setStep('results');
        }, 800);
      })
      .catch((err) => {
        console.error('Idea generation failed:', err);
        setError('AI generation failed. Please go back and try again.');
        clearInterval(progressInterval);
        clearInterval(stepInterval);
      });

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      timers.forEach(clearTimeout);
    };
  }, [analysis, scores, setIdeas, setStep]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {/* Ambient glows */}
      <div className="ambient-glow w-96 h-96 bg-ls-claude top-1/4 left-1/4 animate-pulse-slow" />
      <div className="ambient-glow w-80 h-80 bg-ls-chatgpt top-1/3 right-1/4 animate-pulse-slow" style={{ animationDelay: '1s' }} />
      <div className="ambient-glow w-72 h-72 bg-ls-gemini bottom-1/4 left-1/3 animate-pulse-slow" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 w-full max-w-lg text-center animate-fade-in">
        {/* Spinner */}
        <div className="relative mx-auto w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full border-2 border-ls-dark-border" />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-ls-accent animate-spin-slow"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-ls-accent animate-pulse" />
          </div>
        </div>

        {/* Status Text */}
        <h2 className="text-2xl font-bold text-white mb-2">
          {error ? 'Generation Failed' : 'Generating Ideas'}
        </h2>
        {error ? (
          <div className="mb-8">
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button
              onClick={goBack}
              className="px-6 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
            >
              Go Back &amp; Retry
            </button>
          </div>
        ) : (
        <p className="text-gray-400 mb-8 h-6 transition-all">
          {PROGRESS_STEPS[currentStep]}
        </p>
        )}

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-ls-dark-border rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-ls-accent to-ls-teal rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Model Status Cards */}
        <div className="grid grid-cols-3 gap-3">
          {MODEL_KEYS.map((key) => {
            const model = MODELS[key];
            const status = modelStatus[key];
            return (
              <div
                key={key}
                className={`p-3 rounded-xl border transition-all ${
                  status === 'done'
                    ? 'bg-ls-dark-card border-white/10'
                    : status === 'active'
                    ? 'bg-ls-dark-card border-ls-dark-border animate-pulse'
                    : 'bg-ls-dark border-ls-dark-border opacity-50'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      status === 'done' ? 'bg-emerald-400' : status === 'active' ? 'animate-pulse' : ''
                    }`}
                    style={{ backgroundColor: status !== 'done' ? model.color : undefined }}
                  />
                  <span className="text-xs font-medium text-gray-300">{model.name}</span>
                </div>
                <p className="text-xs text-gray-500">{model.lens}</p>
                <p className="text-xs mt-1 font-medium" style={{ color: model.color }}>
                  {status === 'done' ? 'Complete' : status === 'active' ? 'Generating...' : 'Queued'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
