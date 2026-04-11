'use client';

import { useState } from 'react';
import { useAnalysisStore } from '@/store';
import { MODELS } from '@/types';
import type { InputMode } from '@/types';
import { Globe, FileText, ArrowRight, Sparkles } from 'lucide-react';

export function InputScreen() {
  const startAnalysis = useAnalysisStore((s) => s.startAnalysis);
  const [mode, setMode] = useState<InputMode>('scan');
  const [companyName, setCompanyName] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [description, setDescription] = useState('');

  const canProceed = companyName.trim() && (mode === 'describe' ? description.trim() : true);

  const handleSubmit = () => {
    if (!canProceed) return;
    startAnalysis(mode, companyName.trim(), companyUrl.trim(), description.trim());
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6">
      {/* Ambient glows */}
      <div className="ambient-glow w-96 h-96 bg-ls-accent top-20 -left-48" />
      <div className="ambient-glow w-80 h-80 bg-ls-teal bottom-20 -right-40" />
      <div className="ambient-glow w-64 h-64 bg-ls-gemini top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10 w-full max-w-2xl animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ls-accent to-ls-teal flex items-center justify-center animate-float">
              <Sparkles className="w-5 h-5 text-ls-dark" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              <span className="gradient-text">LangSync</span>
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            What does a <span className="gradient-text">10-star</span> version look like?
          </h1>
          <p className="text-gray-400 text-lg max-w-lg mx-auto">
            Three AI models. Three strategic lenses. Ideas from delightful to transformative.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-8 p-1 bg-ls-dark-card rounded-xl border border-ls-dark-border">
          <button
            onClick={() => setMode('scan')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
              mode === 'scan'
                ? 'bg-ls-dark-lighter text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Globe className="w-4 h-4" />
            Scan a Company
          </button>
          <button
            onClick={() => setMode('describe')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
              mode === 'describe'
                ? 'bg-ls-dark-lighter text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            Describe an Idea
          </button>
        </div>

        {/* Input Fields */}
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Stripe, Notion, Linear"
              className="w-full px-4 py-3 bg-ls-dark-card border border-ls-dark-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-ls-accent/30 focus:border-ls-accent/50 transition-all"
            />
          </div>

          {mode === 'scan' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Website URL <span className="text-gray-500">(optional)</span>
              </label>
              <input
                type="url"
                value={companyUrl}
                onChange={(e) => setCompanyUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 bg-ls-dark-card border border-ls-dark-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-ls-accent/30 focus:border-ls-accent/50 transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {mode === 'scan' ? 'Additional Context' : 'Describe Your Idea'}
              {mode === 'scan' && <span className="text-gray-500"> (optional)</span>}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                mode === 'scan'
                  ? 'Any specific areas you want the models to focus on...'
                  : 'Describe the product, service, or experience you want to reimagine...'
              }
              rows={4}
              className="w-full px-4 py-3 bg-ls-dark-card border border-ls-dark-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-ls-accent/30 focus:border-ls-accent/50 transition-all resize-none"
            />
          </div>
        </div>

        {/* Model Badges */}
        <div className="flex gap-3 mb-8">
          {Object.entries(MODELS).map(([key, model]) => (
            <div
              key={key}
              className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-ls-dark-card border border-ls-dark-border"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: model.color }}
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-300 truncate">{model.name}</p>
                <p className="text-xs text-gray-500 truncate">{model.lens}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canProceed}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-semibold transition-all ${
            canProceed
              ? 'bg-gradient-to-r from-ls-accent to-ls-teal text-ls-dark hover:shadow-lg hover:shadow-ls-accent/20 hover:scale-[1.01]'
              : 'bg-ls-dark-card text-gray-500 border border-ls-dark-border cursor-not-allowed'
          }`}
        >
          Begin Analysis
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
