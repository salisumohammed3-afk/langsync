"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn, formatDate } from "@/lib/utils";

interface Challenge {
  id: string;
  title: string;
  brief: string;
  type: string;
  timeEstimate: string;
  unlockDate: string;
  practiceEnabled: boolean;
  weekNumber: number;
  submissions: { id: string; status: string }[];
}

interface Month {
  id: string;
  number: number;
  theme: string;
  description: string | null;
  challenges: Challenge[];
}

interface Programme {
  id: string;
  title: string;
  description: string | null;
  months: Month[];
}

export default function ChallengesPage() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/challenges")
      .then((res) => res.json())
      .then((data) => {
        setProgrammes(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (programmes.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-900">No challenges yet</h2>
        <p className="mt-2 text-gray-600">Your challenge programme hasn&apos;t been set up yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div>
      {programmes.map((programme) => (
        <div key={programme.id}>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{programme.title}</h1>
            {programme.description && (
              <p className="mt-1 text-gray-600">{programme.description}</p>
            )}
          </div>

          {programme.months.map((month) => (
            <div key={month.id} className="mb-10">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                  {month.number}
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Month {month.number}: {month.theme}
                  </h2>
                  {month.description && (
                    <p className="text-sm text-gray-500">{month.description}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {month.challenges.map((challenge) => {
                  const isUnlocked = new Date(challenge.unlockDate) <= new Date();
                  const hasSubmission = challenge.submissions.some(
                    (s) => s.status === "submitted" || s.status === "reviewed"
                  );

                  return (
                    <Link
                      key={challenge.id}
                      href={isUnlocked ? `/challenges/${challenge.id}` : "#"}
                      className={cn(
                        "card group relative transition-all",
                        isUnlocked
                          ? "hover:border-brand-200 hover:shadow-md cursor-pointer"
                          : "opacity-60 cursor-not-allowed"
                      )}
                    >
                      <div className="mb-3 flex items-center justify-between">
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
                        {hasSubmission ? (
                          <span className="badge bg-green-100 text-green-700">
                            Completed
                          </span>
                        ) : !isUnlocked ? (
                          <span className="badge bg-gray-100 text-gray-500">
                            Locked
                          </span>
                        ) : (
                          <span className="badge bg-yellow-100 text-yellow-700">
                            Open
                          </span>
                        )}
                      </div>
                      <h3 className="mb-1 font-semibold text-gray-900 group-hover:text-brand-700">
                        Week {challenge.weekNumber}: {challenge.title}
                      </h3>
                      <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                        {challenge.brief}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {challenge.timeEstimate}
                        </span>
                        <span>
                          {isUnlocked
                            ? `Unlocked ${formatDate(challenge.unlockDate)}`
                            : `Unlocks ${formatDate(challenge.unlockDate)}`}
                        </span>
                      </div>
                      {challenge.practiceEnabled && isUnlocked && (
                        <div className="mt-2">
                          <span className="text-xs text-brand-600 font-medium">Practice Centre Available</span>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
