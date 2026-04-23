"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Submission {
  id: string;
  content: string;
  status: string;
  completionScore: number;
  qualityScore: number | null;
  impactScore: number | null;
  submittedAt: string;
  challenge: { title: string; type: string };
}

interface BadgeInfo {
  name: string;
  description: string;
  earned: boolean;
  icon: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/submissions")
      .then((res) => res.json())
      .then((data) => {
        setSubmissions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const userName = (session?.user as unknown as { name?: string })?.name || "Guest User";

  const totalPoints = submissions.reduce(
    (sum, s) => sum + s.completionScore + (s.qualityScore || 0) + (s.impactScore || 0),
    0
  );
  const completedCount = submissions.filter(
    (s) => s.status === "submitted" || s.status === "reviewed"
  ).length;
  const avgQuality =
    completedCount > 0
      ? Math.round(
          (submissions.reduce((s, sub) => s + (sub.qualityScore || 0), 0) /
            completedCount) *
            10
        ) / 10
      : 0;

  // Calculate streak
  let streak = 0;
  const sorted = [...submissions]
    .filter((s) => s.status === "submitted" || s.status === "reviewed")
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  if (sorted.length > 0) {
    streak = 1;
    for (let i = 1; i < sorted.length; i++) {
      const diff =
        (new Date(sorted[i - 1].submittedAt).getTime() -
          new Date(sorted[i].submittedAt).getTime()) /
        (1000 * 60 * 60 * 24);
      if (diff <= 10) streak++;
      else break;
    }
  }

  // Badges
  const perfectScores = submissions.filter(
    (s) =>
      s.completionScore + (s.qualityScore || 0) + (s.impactScore || 0) === 7
  );
  const badges: BadgeInfo[] = [
    {
      name: "4-Week Streak",
      description: "Complete challenges for 4 consecutive weeks",
      earned: streak >= 4,
      icon: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z",
    },
    {
      name: "8-Week Streak",
      description: "Complete challenges for 8 consecutive weeks",
      earned: streak >= 8,
      icon: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z",
    },
    {
      name: "First 7",
      description: "Score a perfect 7/7 on any challenge",
      earned: perfectScores.length >= 1,
      icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
    },
    {
      name: "Hat Trick",
      description: "Score three perfect 7/7s in a row",
      earned: perfectScores.length >= 3,
      icon: "M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172",
    },
    {
      name: "Consistent",
      description: "Maintain average quality score above 2.5",
      earned: avgQuality >= 2.5 && completedCount >= 3,
      icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z",
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Your Profile</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="card text-center">
          <p className="text-sm text-gray-500">Total Points</p>
          <p className="text-3xl font-bold text-brand-600">{totalPoints}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Challenges Completed</p>
          <p className="text-3xl font-bold text-gray-900">{completedCount}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Avg Quality</p>
          <p className="text-3xl font-bold text-gray-900">{avgQuality}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Current Streak</p>
          <p className="text-3xl font-bold text-gray-900">{streak}w</p>
        </div>
      </div>

      {/* Badges */}
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Achievements</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {badges.map((badge) => (
          <div
            key={badge.name}
            className={cn(
              "card flex items-center gap-3",
              !badge.earned && "opacity-40"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
                badge.earned ? "bg-brand-100" : "bg-gray-100"
              )}
            >
              <svg
                className={cn("h-5 w-5", badge.earned ? "text-brand-600" : "text-gray-400")}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={badge.icon} />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">{badge.name}</p>
              <p className="text-xs text-gray-500">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Submissions */}
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Submissions</h2>
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
        </div>
      ) : submissions.length > 0 ? (
        <div className="space-y-3">
          {submissions.slice(0, 10).map((sub) => (
            <div key={sub.id} className="card flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{sub.challenge.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={cn(
                      "badge text-xs",
                      sub.challenge.type === "SEO"
                        ? "bg-blue-100 text-blue-700"
                        : sub.challenge.type === "AEO"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-amber-100 text-amber-700"
                    )}
                  >
                    {sub.challenge.type}
                  </span>
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
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-brand-600">
                  {sub.completionScore + (sub.qualityScore || 0) + (sub.impactScore || 0)}
                  <span className="text-sm font-normal text-gray-500">/7</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-8 text-gray-500">
          No submissions yet. Start a challenge to track your progress!
        </div>
      )}
    </div>
  );
}
