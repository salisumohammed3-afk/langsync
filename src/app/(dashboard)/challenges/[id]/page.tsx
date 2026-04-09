"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn, formatDate } from "@/lib/utils";
import Link from "next/link";

interface Challenge {
  id: string;
  title: string;
  brief: string;
  type: string;
  timeEstimate: string;
  greatExample: string | null;
  competitorExamples: string | null;
  unlockDate: string;
  practiceEnabled: boolean;
  scoringCriteria: string | null;
  weekNumber: number;
  month: {
    number: number;
    theme: string;
    programme: {
      title: string;
      company: { name: string; websiteUrl: string | null };
    };
  };
  submissions: {
    id: string;
    content: string;
    status: string;
    completionScore: number;
    qualityScore: number | null;
    impactScore: number | null;
    reviewerFeedback: string | null;
    submittedAt: string;
  }[];
  conversations: { id: string; messages: string }[];
}

interface CoachMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface PracticeFeedback {
  strengths: string[];
  improvements: string[];
  scorePreview: number;
}

type ActiveTab = "brief" | "examples" | "coach" | "practice" | "submit";

export default function ChallengeDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("brief");

  // Submission state
  const [submissionContent, setSubmissionContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Coach state
  const [coachMessages, setCoachMessages] = useState<CoachMessage[]>([]);
  const [coachInput, setCoachInput] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);

  // Practice state
  const [practiceContent, setPracticeContent] = useState("");
  const [practiceFeedback, setPracticeFeedback] = useState<PracticeFeedback | null>(null);
  const [practiceLoading, setPracticeLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/challenges/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setChallenge(data);
        if (data.conversations?.[0]?.messages) {
          try {
            setCoachMessages(JSON.parse(data.conversations[0].messages));
          } catch {
            // ignore parse error
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleSubmit = async () => {
    if (!submissionContent.trim()) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: params.id,
          content: submissionContent,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setSubmitError(data.error || "Submission failed");
      } else {
        setSubmitSuccess(true);
        // Refresh challenge data
        const updated = await fetch(`/api/challenges/${params.id}`).then((r) => r.json());
        setChallenge(updated);
      }
    } catch {
      setSubmitError("Something went wrong");
    }
    setSubmitting(false);
  };

  const handleCoachSend = async () => {
    if (!coachInput.trim()) return;
    setCoachLoading(true);

    const userMsg: CoachMessage = {
      role: "user",
      content: coachInput,
      timestamp: new Date().toISOString(),
    };
    setCoachMessages((prev) => [...prev, userMsg]);
    setCoachInput("");

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: params.id,
          message: userMsg.content,
        }),
      });
      const data = await res.json();
      const assistantMsg: CoachMessage = {
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
      };
      setCoachMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setCoachMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble right now. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
    setCoachLoading(false);
  };

  const handlePracticeSubmit = async () => {
    if (!practiceContent.trim()) return;
    setPracticeLoading(true);

    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: params.id,
          content: practiceContent,
        }),
      });
      const data = await res.json();
      setPracticeFeedback(data.feedback);
    } catch {
      // ignore error
    }
    setPracticeLoading(false);
  };

  if (loading || !challenge) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  const hasSubmission = challenge.submissions.some(
    (s) => s.status === "submitted" || s.status === "reviewed"
  );
  const latestSubmission = challenge.submissions[0];
  const competitorExamples = challenge.competitorExamples
    ? JSON.parse(challenge.competitorExamples)
    : [];

  const tabs: { id: ActiveTab; label: string; show: boolean }[] = [
    { id: "brief", label: "Brief", show: true },
    { id: "examples", label: "Examples", show: true },
    { id: "coach", label: "AI Coach", show: true },
    { id: "practice", label: "Practice Centre", show: challenge.practiceEnabled },
    { id: "submit", label: hasSubmission ? "Submission" : "Submit", show: true },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/challenges" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Challenges
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span
                className={cn(
                  "badge",
                  challenge.type === "SEO"
                    ? "bg-blue-100 text-blue-700"
                    : challenge.type === "AEO"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-amber-100 text-amber-700"
                )}
              >
                {challenge.type}
              </span>
              <span className="text-sm text-gray-500">
                Week {challenge.weekNumber} &middot; {challenge.timeEstimate}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{challenge.title}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {challenge.month.programme.title} &middot; Month{" "}
              {challenge.month.number}: {challenge.month.theme}
            </p>
          </div>
          {hasSubmission && (
            <div className="card bg-green-50 border-green-200 text-center">
              <p className="text-sm font-medium text-green-800">Submitted</p>
              <p className="text-2xl font-bold text-green-700">
                {(latestSubmission?.completionScore || 0) +
                  (latestSubmission?.qualityScore || 0) +
                  (latestSubmission?.impactScore || 0)}
                <span className="text-sm font-normal">/7 pts</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-6">
          {tabs
            .filter((t) => t.show)
            .map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "border-b-2 pb-3 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "border-brand-600 text-brand-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                )}
              >
                {tab.label}
              </button>
            ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "brief" && (
        <div className="card prose max-w-none">
          <h2 className="text-lg font-semibold text-gray-900">Challenge Brief</h2>
          <div className="mt-4 whitespace-pre-wrap text-gray-700">{challenge.brief}</div>
          {challenge.scoringCriteria && (
            <div className="mt-6 rounded-lg bg-amber-50 border border-amber-200 p-4">
              <h3 className="text-sm font-semibold text-amber-800">Scoring Criteria</h3>
              <p className="mt-1 text-sm text-amber-700">{challenge.scoringCriteria}</p>
            </div>
          )}
          <div className="mt-6 rounded-lg bg-gray-50 border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700">How scoring works</h3>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">1 pt</p>
                <p className="text-xs text-gray-500">Completion (automatic)</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">1-3 pts</p>
                <p className="text-xs text-gray-500">Quality (AI + Reviewer)</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">1-3 pts</p>
                <p className="text-xs text-gray-500">Impact (Reviewer)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "examples" && (
        <div className="space-y-6">
          {challenge.greatExample && (
            <div className="card">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-3.5 w-3.5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </span>
                <h2 className="text-lg font-semibold text-gray-900">Great Example</h2>
              </div>
              <div className="whitespace-pre-wrap text-gray-700">{challenge.greatExample}</div>
            </div>
          )}

          {competitorExamples.length > 0 ? (
            competitorExamples.map((example: string, i: number) => (
              <div key={i} className="card">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100">
                    <svg className="h-3.5 w-3.5 text-orange-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Competitor Example {i + 1}
                  </h2>
                </div>
                <div className="whitespace-pre-wrap text-gray-700">{example}</div>
              </div>
            ))
          ) : (
            <div className="card text-center text-gray-500">
              <p>No competitor examples have been added for this challenge yet.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "coach" && (
        <div className="card flex flex-col" style={{ height: "500px" }}>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
              <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">AI Coach</h2>
              <p className="text-xs text-gray-500">
                Ask questions about this challenge. I&apos;ll guide you without doing the work for you.
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {coachMessages.length === 0 && (
              <div className="flex h-full items-center justify-center text-center">
                <div>
                  <p className="text-gray-500">No messages yet. Ask me anything about this challenge!</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {["What should I focus on?", "Can you explain the brief?", "How is this scored?"].map((q) => (
                      <button
                        key={q}
                        onClick={() => { setCoachInput(q); }}
                        className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {coachMessages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[80%] rounded-xl px-4 py-3",
                  msg.role === "user"
                    ? "ml-auto bg-brand-600 text-white"
                    : "bg-gray-100 text-gray-800"
                )}
              >
                <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
              </div>
            ))}
            {coachLoading && (
              <div className="max-w-[80%] rounded-xl bg-gray-100 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={coachInput}
              onChange={(e) => setCoachInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !coachLoading && handleCoachSend()}
              placeholder="Ask the AI Coach a question..."
              className="input flex-1"
            />
            <button
              onClick={handleCoachSend}
              disabled={coachLoading || !coachInput.trim()}
              className="btn-primary"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {activeTab === "practice" && challenge.practiceEnabled && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Practice Centre</h2>
            <p className="mb-4 text-sm text-gray-600">
              Submit a draft and get instant AI feedback. Iterate as many times as you want before making your final submission.
            </p>
            <textarea
              value={practiceContent}
              onChange={(e) => setPracticeContent(e.target.value)}
              rows={8}
              className="input mb-4"
              placeholder="Write your practice draft here..."
            />
            <button
              onClick={handlePracticeSubmit}
              disabled={practiceLoading || !practiceContent.trim()}
              className="btn-primary"
            >
              {practiceLoading ? "Getting feedback..." : "Get AI Feedback"}
            </button>
          </div>

          {practiceFeedback && (
            <div className="space-y-4">
              <div className="card border-green-200 bg-green-50">
                <h3 className="mb-2 font-semibold text-green-800">What Works</h3>
                <ul className="space-y-1">
                  {practiceFeedback.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card border-amber-200 bg-amber-50">
                <h3 className="mb-2 font-semibold text-amber-800">What to Improve</h3>
                <ul className="space-y-1">
                  {practiceFeedback.improvements.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                      </svg>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card text-center">
                <p className="text-sm text-gray-600">Score Preview</p>
                <p className="text-3xl font-bold text-brand-600">
                  {practiceFeedback.scorePreview}
                  <span className="text-sm font-normal text-gray-500">/3</span>
                </p>
                <p className="text-xs text-gray-500">Quality score estimate</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "submit" && (
        <div className="card">
          {hasSubmission ? (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Your Submission</h2>
              <div className="rounded-lg bg-gray-50 p-4 mb-4">
                <div className="whitespace-pre-wrap text-sm text-gray-700">
                  {latestSubmission?.content}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3 mb-4">
                <div className="rounded-lg border border-gray-200 p-3 text-center">
                  <p className="text-xs text-gray-500">Completion</p>
                  <p className="text-xl font-bold text-gray-900">{latestSubmission?.completionScore}/1</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3 text-center">
                  <p className="text-xs text-gray-500">Quality</p>
                  <p className="text-xl font-bold text-gray-900">
                    {latestSubmission?.qualityScore ?? "Pending"}{latestSubmission?.qualityScore ? "/3" : ""}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3 text-center">
                  <p className="text-xs text-gray-500">Impact</p>
                  <p className="text-xl font-bold text-gray-900">
                    {latestSubmission?.impactScore ?? "Pending"}{latestSubmission?.impactScore ? "/3" : ""}
                  </p>
                </div>
              </div>
              {latestSubmission?.reviewerFeedback && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <h3 className="mb-1 text-sm font-semibold text-blue-800">Reviewer Feedback</h3>
                  <p className="text-sm text-blue-700">{latestSubmission.reviewerFeedback}</p>
                </div>
              )}
              <p className="mt-3 text-xs text-gray-500">
                Submitted {formatDate(latestSubmission?.submittedAt || "")}
              </p>
            </div>
          ) : submitSuccess ? (
            <div className="text-center py-8">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Submitted!</h2>
              <p className="text-sm text-gray-600">Your challenge submission has been received. Check the leaderboard for your points.</p>
            </div>
          ) : (
            <div>
              <h2 className="mb-2 text-lg font-semibold text-gray-900">Submit Your Work</h2>
              <p className="mb-4 text-sm text-gray-600">
                Write your response below. You earn 1 point for completion, plus up to 3 for quality and 3 for impact.
              </p>
              {submitError && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {submitError}
                </div>
              )}
              <textarea
                value={submissionContent}
                onChange={(e) => setSubmissionContent(e.target.value)}
                rows={10}
                className="input mb-4"
                placeholder="Write your submission here..."
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {submissionContent.split(/\s+/).filter(Boolean).length} words
                </p>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !submissionContent.trim()}
                  className="btn-primary"
                >
                  {submitting ? "Submitting..." : "Submit Challenge"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
