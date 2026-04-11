'use client';

import { useState } from 'react';
import { useAnalysisStore } from '@/store';
import { MODELS } from '@/types';
import type { InputMode } from '@/types';
import {
  Globe,
  FileText,
  ArrowRight,
  Sparkles,
  Loader2,
  Clock,
  Trash2,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';

export function InputScreen() {
  const startAnalysis = useAnalysisStore((s) => s.startAnalysis);
  const savedSessions = useAnalysisStore((s) => s.savedSessions);
  const loadSession = useAnalysisStore((s) => s.loadSession);
  const deleteSession = useAnalysisStore((s) => s.deleteSession);

  const [mode, setMode] = useState<InputMode>('scan');
  const [companyName, setCompanyName] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [description, setDescription] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    industry?: string;
    description?: string;
    key_products?: string[];
    target_audience?: string;
  } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canProceed = companyName.trim() && (mode === 'describe' ? description.trim() : true);

  const handleScan = async () => {
    if (!companyUrl.trim()) return;
    setScanning(true);
    setScanError(null);
    setScanResult(null);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: companyUrl.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Scan failed');
      }
      const data = await res.json();
      setScanResult(data);
      if (data.company_name && !companyName.trim()) {
        setCompanyName(data.company_name);
      }
      if (data.description && !description.trim()) {
        setDescription(data.description);
      }
    } catch (err) {
      setScanError(err instanceof Error ? err.message : 'Failed to scan URL');
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = () => {
    if (!canProceed || submitting) return;
    setSubmitting(true);
    startAnalysis(mode, companyName.trim(), companyUrl.trim(), description.trim());
  };

  const descriptionLength = description.length;

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

        {/* Session History */}
        {savedSessions.length > 0 && (
          <div className="mb-8 p-4 rounded-xl bg-ls-dark-card border border-ls-dark-border">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-300">Recent Analyses</h3>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {savedSessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-ls-dark/50 border border-ls-dark-border hover:border-white/10 transition-all group"
                >
                  <button
                    onClick={() => loadSession(session.id)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">
                        {session.analysis.company_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.ideas.length} ideas · {new Date(session.savedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 flex-shrink-0" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    className="ml-2 p-1 rounded text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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
                Website URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={companyUrl}
                  onChange={(e) => {
                    setCompanyUrl(e.target.value);
                    setScanResult(null);
                    setScanError(null);
                  }}
                  placeholder="https://example.com"
                  className="flex-1 px-4 py-3 bg-ls-dark-card border border-ls-dark-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-ls-accent/30 focus:border-ls-accent/50 transition-all"
                />
                <button
                  onClick={handleScan}
                  disabled={!companyUrl.trim() || scanning}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    companyUrl.trim() && !scanning
                      ? 'bg-ls-accent/20 text-ls-accent hover:bg-ls-accent/30'
                      : 'bg-ls-dark-card text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {scanning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Globe className="w-4 h-4" />
                  )}
                  {scanning ? 'Scanning...' : 'Scan'}
                </button>
              </div>

              {/* Scan Result */}
              {scanResult && (
                <div className="mt-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 animate-slide-up">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-medium text-emerald-400">
                      Scan Complete
                    </span>
                    {scanResult.industry && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 ring-1 ring-white/5">
                        {scanResult.industry}
                      </span>
                    )}
                  </div>
                  {scanResult.key_products && scanResult.key_products.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {scanResult.key_products.map((p, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-500">
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                  {scanResult.target_audience && (
                    <p className="text-xs text-gray-500 mt-1.5">
                      Target: {scanResult.target_audience}
                    </p>
                  )}
                </div>
              )}

              {/* Scan Error */}
              {scanError && (
                <div className="mt-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20 flex items-center gap-2 animate-slide-up">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-xs text-red-400">{scanError}</span>
                </div>
              )}
            </div>
          )}

          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">
                {mode === 'scan' ? 'Additional Context' : 'Describe Your Idea'}
                {mode === 'scan' && <span className="text-gray-500"> (optional)</span>}
              </label>
              {mode === 'describe' && (
                <span className={`text-xs ${descriptionLength > 500 ? 'text-amber-400' : 'text-gray-600'}`}>
                  {descriptionLength}/1000
                </span>
              )}
            </div>
            <textarea
              value={description}
              onChange={(e) => {
                if (e.target.value.length <= 1000) setDescription(e.target.value);
              }}
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
          disabled={!canProceed || submitting}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-semibold transition-all ${
            canProceed && !submitting
              ? 'bg-gradient-to-r from-ls-accent to-ls-teal text-ls-dark hover:shadow-lg hover:shadow-ls-accent/20 hover:scale-[1.01]'
              : 'bg-ls-dark-card text-gray-500 border border-ls-dark-border cursor-not-allowed'
          }`}
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Starting Analysis...
            </>
          ) : (
            <>
              Begin Analysis
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
