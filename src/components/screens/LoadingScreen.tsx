'use client';

import { useEffect, useState } from 'react';
import { useAnalysisStore } from '@/store';
import { MODELS } from '@/types';
import type { ModelSource } from '@/types';
import { generateMockIdeas, generateMockResearch } from '@/lib/mock-data';
import { Sparkles } from 'lucide-react';

const MODEL_KEYS: ModelSource[] = ['claude', 'chatgpt', 'gemini'];

const PROGRESS_STEPS = [
  'Researching company context...',
  'Building stakeholder map...',
  'Claude: Scanning cross-industry patterns...',
  'ChatGPT: Removing all constraints...',
  'Gemini: Mapping emotional moments...',
  'Deduplicating and organising ideas...',
  'Calibrating tier assignments...',
  'Finalising results...',
];

export function LoadingScreen() {
  const { analysis, setIdeas, setStep } = useAnalysisStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [modelStatus, setModelStatus] = useState<Record<ModelSource, 'waiting' | 'active' | 'done'>>({
    claude: 'waiting',
    chatgpt: 'waiting',
    gemini: 'waiting',
  });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate progressive loading
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= PROGRESS_STEPS.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    // Simulate model status changes
    const timers = [
      setTimeout(() => setModelStatus((s) => ({ ...s, claude: 'active' })), 500),
      setTimeout(() => setModelStatus((s) => ({ ...s, chatgpt: 'active' })), 800),
      setTimeout(() => setModelStatus((s) => ({ ...s, gemini: 'active' })), 1100),
      setTimeout(() => setModelStatus((s) => ({ ...s, claude: 'done' })), 3000),
      setTimeout(() => setModelStatus((s) => ({ ...s, chatgpt: 'done' })), 3800),
      setTimeout(() => setModelStatus((s) => ({ ...s, gemini: 'done' })), 4500),
    ];

    // Progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    // Generate results and transition
    const completeTimer = setTimeout(() => {
      if (analysis) {
        generateMockResearch(analysis.company_name, analysis.company_url);
        const ideas = generateMockIdeas(analysis.id);
        setIdeas(ideas);
        setStep('results');
      }
    }, 5500);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      timers.forEach(clearTimeout);
      clearTimeout(completeTimer);
    };
  }, [analysis, setIdeas, setStep]);

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
          Generating Ideas
        </h2>
        <p className="text-gray-400 mb-8 h-6 transition-all">
          {PROGRESS_STEPS[currentStep]}
        </p>

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
