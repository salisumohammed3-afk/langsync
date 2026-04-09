"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { cn, formatDate } from "@/lib/utils";

interface Submission {
  id: string;
  content: string;
  status: string;
  completionScore: number;
  qualityScore: number | null;
  impactScore: number | null;
  aiQualityScore: number | null;
  aiRationale: string | null;
  reviewerFeedback: string | null;
  submittedAt: string;
  user: { name: string; email: string; teamName: string | null };
  challenge: { title: string; brief: string; type: string; scoringCriteria: string | null };
}

export default function ReviewsPage() {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [qualityScore, setQualityScore] = useState<number>(2);
  const [impactScore, setImpactScore] = useState<number>(2);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "reviewed">("all");

  useEffect(() => {
    fetch("/api/admin/reviews")
      .then((res) => res.json())
      .then((data) => {
        setSubmissions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (!session || !["reviewer", "admin"].includes(session.user.role)) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
        <p className="mt-2 text-gray-600">Reviewer access required.</p>
      </div>
    );
  }

  const filtered = submissions.filter((s) => {
    if (filter === "pending") return s.status === "submitted";
    if (filter === "reviewed") return s.status === "reviewed";
    return true;
  });

  const selected = submissions.find((s) => s.id === selectedId);

  const handleSaveReview = async () => {
    if (!selectedId) return;
    setSaving(true);

    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: selectedId,
          qualityScore,
          impactScore,
          reviewerFeedback: feedback,
        }),
      });

      if (res.ok) {
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === selectedId
              ? { ...s, qualityScore, impactScore, reviewerFeedback: feedback, status: "reviewed" }
              : s
          )
        );
        setSelectedId(null);
        setFeedback("");
      }
    } catch {
      // ignore error
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Queue</h1>
          <p className="text-sm text-gray-500">
            {submissions.filter((s) => s.status === "submitted").length} pending reviews
          </p>
        </div>
        <div className="flex rounded-lg border border-gray-200 bg-white p-1">
          {(["all", "pending", "reviewed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                filter === f ? "bg-brand-600 text-white" : "text-gray-600 hover:text-gray-900"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Submission List */}
        <div className="space-y-3">
          {filtered.map((sub) => (
            <button
              key={sub.id}
              onClick={() => {
                setSelectedId(sub.id);
                setQualityScore(sub.qualityScore || 2);
                setImpactScore(sub.impactScore || 2);
                setFeedback(sub.reviewerFeedback || "");
              }}
              className={cn(
                "card w-full text-left transition-all",
                selectedId === sub.id && "border-brand-300 ring-1 ring-brand-200"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{sub.user.name}</span>
                <span
                  className={cn(
                    "badge text-xs",
                    sub.status === "reviewed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  )}
                >
                  {sub.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{sub.challenge.title}</p>
              <p className="line-clamp-2 text-xs text-gray-500">{sub.content}</p>
              <p className="mt-2 text-xs text-gray-400">{formatDate(sub.submittedAt)}</p>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="card text-center py-8 text-gray-500">
              No submissions to review.
            </div>
          )}
        </div>

        {/* Review Panel */}
        {selected ? (
          <div className="card sticky top-6">
            <h2 className="mb-1 text-lg font-semibold text-gray-900">
              {selected.challenge.title}
            </h2>
            <p className="mb-4 text-sm text-gray-500">
              by {selected.user.name} &middot; {formatDate(selected.submittedAt)}
            </p>

            <div className="mb-4 rounded-lg bg-gray-50 p-4">
              <h3 className="mb-1 text-xs font-semibold uppercase text-gray-500">Submission</h3>
              <div className="whitespace-pre-wrap text-sm text-gray-700">
                {selected.content}
              </div>
            </div>

            {selected.challenge.scoringCriteria && (
              <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3">
                <h3 className="text-xs font-semibold text-amber-700">Scoring Criteria</h3>
                <p className="text-xs text-amber-600">{selected.challenge.scoringCriteria}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Quality Score (1-3)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3].map((n) => (
                    <button
                      key={n}
                      onClick={() => setQualityScore(n)}
                      className={cn(
                        "flex-1 rounded-lg border py-2 text-sm font-medium transition-colors",
                        qualityScore === n
                          ? "border-brand-300 bg-brand-50 text-brand-700"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Impact Score (1-3)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3].map((n) => (
                    <button
                      key={n}
                      onClick={() => setImpactScore(n)}
                      className={cn(
                        "flex-1 rounded-lg border py-2 text-sm font-medium transition-colors",
                        impactScore === n
                          ? "border-brand-300 bg-brand-50 text-brand-700"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="input"
                  placeholder="Write feedback for the team member..."
                />
              </div>
              <button
                onClick={handleSaveReview}
                disabled={saving}
                className="btn-primary w-full"
              >
                {saving ? "Saving..." : "Save Review"}
              </button>
            </div>
          </div>
        ) : (
          <div className="card flex items-center justify-center py-20 text-gray-500">
            Select a submission to review
          </div>
        )}
      </div>
    </div>
  );
}
