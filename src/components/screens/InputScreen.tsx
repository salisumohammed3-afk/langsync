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
    <div className="min-h-screen flex items-center justify-center p-6 bg-white">
      <div className="w-full max-w-2xl animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-ls-red flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              <span className="gradient-text">LangSync</span>
            </span>
          </div>
          <h1 className="text-4xl font-bold text-ls-text mb-3">
            What does a <span className="gradient-text">10-star</span> version look like?
          </h1>
          <p className="text-ls-text-secondary text-lg max-w-lg mx-auto">
            Three AI models. Three strategic lenses. Ideas from delightful to transformative.
          </p>
        </div>

        {/* Session History */}
        {savedSessions.length > 0 && (
          <div className="mb-8 p-4 rounded-2xl bg-ls-bg-secondary border border-ls-border">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-ls-text-secondary" />
              <h3 className="text-sm font-semibold text-ls-text">Recent Analyses</h3>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {savedSessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-ls-border hover:shadow-md transition-all group"
                >
                  <button
                    onClick={() => loadSession(session.id)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ls-text truncate">
                        {session.analysis.company_name}
                      </p>
                      <p className="text-xs text-ls-text-secondary">
                        {session.ideas.length} ideas · {new Date(session.savedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-ls-text-muted group-hover:text-ls-text-secondary flex-shrink-0" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    className="ml-2 p-1 rounded text-ls-text-muted hover:text-ls-red opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mode Toggle — Airbnb pill style */}
        <div className="flex gap-2 mb-8 p-1.5 bg-ls-bg-secondary rounded-full border border-ls-border">
          <button
            onClick={() => setMode('scan')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-medium transition-all ${
              mode === 'scan'
                ? 'bg-white text-ls-text shadow-md'
                : 'text-ls-text-secondary hover:text-ls-text'
            }`}
          >
            <Globe className="w-4 h-4" />
            Scan a Company
          </button>
          <button
            onClick={() => setMode('describe')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-medium transition-all ${
              mode === 'describe'
                ? 'bg-white text-ls-text shadow-md'
                : 'text-ls-text-secondary hover:text-ls-text'
            }`}
          >
            <FileText className="w-4 h-4" />
            Describe an Idea
          </button>
        </div>

        {/* Input Fields */}
        <div className="space-y-5 mb-8">
          <div>
            <label className="block text-sm font-medium text-ls-text mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Stripe, Notion, Linear"
              className="w-full px-4 py-3.5 bg-white border border-ls-border-dark rounded-xl text-ls-text placeholder-ls-text-muted focus:outline-none focus:ring-2 focus:ring-ls-red/20 focus:border-ls-red transition-all"
            />
          </div>

          {mode === 'scan' && (
            <div>
              <label className="block text-sm font-medium text-ls-text mb-2">
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
                  className="flex-1 px-4 py-3.5 bg-white border border-ls-border-dark rounded-xl text-ls-text placeholder-ls-text-muted focus:outline-none focus:ring-2 focus:ring-ls-red/20 focus:border-ls-red transition-all"
                />
                <button
                  onClick={handleScan}
                  disabled={!companyUrl.trim() || scanning}
                  className={`px-5 py-3.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    companyUrl.trim() && !scanning
                      ? 'bg-ls-bg-secondary text-ls-text border border-ls-border-dark hover:bg-ls-bg-hover'
                      : 'bg-ls-bg-secondary text-ls-text-muted border border-ls-border cursor-not-allowed'
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
                <div className="mt-3 p-3.5 rounded-xl bg-ls-teal-light border border-ls-teal/20 animate-slide-up">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-ls-teal" />
                    <span className="text-xs font-medium text-ls-teal">
                      Scan Complete
                    </span>
                    {scanResult.industry && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white text-ls-text-secondary border border-ls-border">
                        {scanResult.industry}
                      </span>
                    )}
                  </div>
                  {scanResult.key_products && scanResult.key_products.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {scanResult.key_products.map((p, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-white text-ls-text-secondary border border-ls-border">
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                  {scanResult.target_audience && (
                    <p className="text-xs text-ls-text-secondary mt-1.5">
                      Target: {scanResult.target_audience}
                    </p>
                  )}
                </div>
              )}

              {/* Scan Error */}
              {scanError && (
                <div className="mt-3 p-3.5 rounded-xl bg-ls-red-light border border-ls-red/20 flex items-center gap-2 animate-slide-up">
                  <AlertCircle className="w-4 h-4 text-ls-red flex-shrink-0" />
                  <span className="text-xs text-ls-red">{scanError}</span>
                </div>
              )}
            </div>
          )}

          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label className="text-sm font-medium text-ls-text">
                {mode === 'scan' ? 'Additional Context' : 'Describe Your Idea'}
                {mode === 'scan' && <span className="text-ls-text-muted"> (optional)</span>}
              </label>
              {mode === 'describe' && (
                <span className={`text-xs ${descriptionLength > 500 ? 'text-ls-gold' : 'text-ls-text-muted'}`}>
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
              className="w-full px-4 py-3.5 bg-white border border-ls-border-dark rounded-xl text-ls-text placeholder-ls-text-muted focus:outline-none focus:ring-2 focus:ring-ls-red/20 focus:border-ls-red transition-all resize-none"
            />
          </div>
        </div>

        {/* Model Badges */}
        <div className="flex gap-3 mb-8">
          {Object.entries(MODELS).map(([key, model]) => (
            <div
              key={key}
              className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-ls-bg-secondary border border-ls-border"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: model.color }}
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-ls-text truncate">{model.name}</p>
                <p className="text-xs text-ls-text-secondary truncate">{model.lens}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Submit — Airbnb coral red button */}
        <button
          onClick={handleSubmit}
          disabled={!canProceed || submitting}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-semibold transition-all ${
            canProceed && !submitting
              ? 'bg-gradient-to-r from-ls-red to-ls-red-dark text-white hover:shadow-lg hover:shadow-ls-red/20 hover:scale-[1.01]'
              : 'bg-ls-bg-secondary text-ls-text-muted border border-ls-border cursor-not-allowed'
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
