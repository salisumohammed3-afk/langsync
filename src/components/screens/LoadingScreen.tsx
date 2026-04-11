'use client';

import { useEffect, useState, useRef } from 'react';
import { useAnalysisStore } from '@/store';
import { MODELS } from '@/types';
import type { ModelSource, Idea } from '@/types';
import { Sparkles, AlertCircle } from 'lucide-react';

const MODEL_KEYS: ModelSource[] = ['claude', 'chatgpt', 'gemini'];

type ModelState = 'waiting' | 'active' | 'done' | 'error';

interface ModelInfo {
  status: ModelState;
  ideaCount: number;
  error?: string;
}

export function LoadingScreen() {
  const { analysis, scores, setIdeas, setStep, goBack } = useAnalysisStore();
  const [statusText, setStatusText] = useState('Connecting to AI models...');
  const [modelInfo, setModelInfo] = useState<Record<ModelSource, ModelInfo>>({
    claude: { status: 'waiting', ideaCount: 0 },
    chatgpt: { status: 'waiting', ideaCount: 0 },
    gemini: { status: 'waiting', ideaCount: 0 },
  });
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [allIdeas, setAllIdeas] = useState<Idea[]>([]);
  const fetchStarted = useRef(false);

  useEffect(() => {
    if (!analysis || fetchStarted.current) return;
    fetchStarted.current = true;

    const collectedIdeas: Idea[] = [];
    let completedModels = 0;

    fetch('/api/analyze-stream', {
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
        if (!res.ok) throw new Error('Stream connection failed');
        const reader = res.body?.getReader();
        if (!reader) throw new Error('No reader available');

        const decoder = new TextDecoder();
        let buffer = '';

        const processStream = async () => {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              try {
                const data = JSON.parse(line.slice(6));

                switch (data.type) {
                  case 'start':
                    setStatusText('AI models are thinking...');
                    setProgress(5);
                    break;

                  case 'model_start':
                    setModelInfo((prev) => ({
                      ...prev,
                      [data.model]: { status: 'active', ideaCount: 0 },
                    }));
                    setStatusText(`${MODELS[data.model as ModelSource].name}: ${MODELS[data.model as ModelSource].lens}...`);
                    break;

                  case 'model_complete':
                    completedModels++;
                    collectedIdeas.push(...(data.ideas as Idea[]));
                    setAllIdeas([...collectedIdeas]);
                    setModelInfo((prev) => ({
                      ...prev,
                      [data.model]: { status: 'done', ideaCount: data.count },
                    }));
                    setProgress(Math.round((completedModels / 3) * 90) + 5);
                    setStatusText(
                      completedModels === 3
                        ? 'All models complete!'
                        : `${data.count} ideas from ${MODELS[data.model as ModelSource].name}...`
                    );
                    break;

                  case 'model_error':
                    completedModels++;
                    setModelInfo((prev) => ({
                      ...prev,
                      [data.model]: {
                        status: 'error',
                        ideaCount: 0,
                        error: data.error,
                      },
                    }));
                    setProgress(Math.round((completedModels / 3) * 90) + 5);
                    break;

                  case 'complete':
                    setProgress(100);
                    setStatusText(`${data.totalIdeas} ideas generated!`);
                    setTimeout(() => {
                      if (collectedIdeas.length > 0) {
                        setIdeas(collectedIdeas);
                        setStep('results');
                      } else {
                        setError('All AI models failed. Please go back and try again.');
                      }
                    }, 800);
                    break;
                }
              } catch {
                // Skip malformed SSE lines
              }
            }
          }
        };

        return processStream();
      })
      .catch((err) => {
        console.error('Stream failed:', err);
        setError('Connection to AI models failed. Please go back and try again.');
      });
  }, [analysis, scores, setIdeas, setStep]);

  const totalIdeasSoFar = allIdeas.length;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white">
      <div className="w-full max-w-lg text-center animate-fade-in">
        {/* Spinner */}
        <div className="relative mx-auto w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full border-2 border-ls-border" />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-ls-red animate-spin-slow"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            {progress === 100 ? (
              <span className="text-2xl font-bold gradient-text">{totalIdeasSoFar}</span>
            ) : (
              <Sparkles className="w-8 h-8 text-ls-red animate-pulse" />
            )}
          </div>
        </div>

        {/* Status Text */}
        <h2 className="text-2xl font-bold text-ls-text mb-2">
          {error ? 'Generation Failed' : progress === 100 ? 'Ideas Ready!' : 'Generating Ideas'}
        </h2>
        {error ? (
          <div className="mb-8">
            <p className="text-ls-red text-sm mb-4">{error}</p>
            <button
              onClick={goBack}
              className="px-6 py-2 rounded-full bg-ls-bg-secondary text-ls-text text-sm hover:bg-ls-bg-hover border border-ls-border transition-colors"
            >
              Go Back &amp; Retry
            </button>
          </div>
        ) : (
          <p className="text-ls-text-secondary mb-8 h-6 transition-all">
            {statusText}
          </p>
        )}

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-ls-border rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-ls-red to-ls-red-dark rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Idea counter */}
        {totalIdeasSoFar > 0 && !error && (
          <p className="text-xs text-ls-text-secondary mb-4">
            {totalIdeasSoFar} idea{totalIdeasSoFar !== 1 ? 's' : ''} collected so far
          </p>
        )}

        {/* Model Status Cards */}
        <div className="grid grid-cols-3 gap-3">
          {MODEL_KEYS.map((key) => {
            const model = MODELS[key];
            const info = modelInfo[key];
            return (
              <div
                key={key}
                className={`p-3 rounded-2xl border transition-all ${
                  info.status === 'done'
                    ? 'bg-ls-teal-light border-ls-teal/20'
                    : info.status === 'error'
                    ? 'bg-ls-red-light border-ls-red/20'
                    : info.status === 'active'
                    ? 'bg-white border-ls-border animate-pulse'
                    : 'bg-ls-bg-secondary border-ls-border opacity-50'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      info.status === 'done'
                        ? 'bg-ls-teal'
                        : info.status === 'error'
                        ? 'bg-ls-red'
                        : info.status === 'active'
                        ? 'animate-pulse'
                        : ''
                    }`}
                    style={{
                      backgroundColor:
                        info.status === 'done'
                          ? undefined
                          : info.status === 'error'
                          ? undefined
                          : model.color,
                    }}
                  />
                  <span className="text-xs font-medium text-ls-text">{model.name}</span>
                </div>
                <p className="text-xs text-ls-text-secondary">{model.lens}</p>
                {info.status === 'done' ? (
                  <p className="text-xs mt-1 font-medium text-ls-teal">
                    {info.ideaCount} ideas
                  </p>
                ) : info.status === 'error' ? (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 text-ls-red" />
                    <p className="text-xs font-medium text-ls-red truncate" title={info.error}>
                      Failed
                    </p>
                  </div>
                ) : (
                  <p className="text-xs mt-1 font-medium" style={{ color: model.color }}>
                    {info.status === 'active' ? 'Generating...' : 'Queued'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
