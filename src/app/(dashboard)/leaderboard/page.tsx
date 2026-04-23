"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

interface LeaderboardEntry {
  id: string;
  name: string;
  teamName: string | null;
  totalPoints: number;
  completedChallenges: number;
  avgQuality: number;
  streak: number;
  recentScores: { score: number; date: string }[];
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"individual" | "team">("individual");

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        setLeaderboard(data);
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

  // Group by team if team view
  const teamData = view === "team"
    ? Object.values(
        leaderboard.reduce(
          (acc, entry) => {
            const team = entry.teamName || "Unassigned";
            if (!acc[team]) {
              acc[team] = {
                name: team,
                totalPoints: 0,
                members: 0,
                avgQuality: 0,
                completedChallenges: 0,
              };
            }
            acc[team].totalPoints += entry.totalPoints;
            acc[team].completedChallenges += entry.completedChallenges;
            acc[team].avgQuality += entry.avgQuality;
            acc[team].members += 1;
            return acc;
          },
          {} as Record<string, { name: string; totalPoints: number; members: number; avgQuality: number; completedChallenges: number }>
        )
      )
        .map((t) => ({
          ...t,
          avgQuality: t.members > 0 ? Math.round((t.avgQuality / t.members) * 10) / 10 : 0,
        }))
        .sort((a, b) => b.totalPoints - a.totalPoints)
    : [];

  const getStreakBadge = (streak: number) => {
    if (streak >= 12) return { label: "12-Week Streak", color: "bg-yellow-100 text-yellow-700" };
    if (streak >= 8) return { label: "8-Week Streak", color: "bg-purple-100 text-purple-700" };
    if (streak >= 4) return { label: "4-Week Streak", color: "bg-blue-100 text-blue-700" };
    return null;
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-sm text-gray-500">See how you stack up against your team</p>
        </div>
        <div className="flex rounded-lg border border-gray-200 bg-white p-1">
          <button
            onClick={() => setView("individual")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              view === "individual" ? "bg-brand-600 text-white" : "text-gray-600 hover:text-gray-900"
            )}
          >
            Individual
          </button>
          <button
            onClick={() => setView("team")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              view === "team" ? "bg-brand-600 text-white" : "text-gray-600 hover:text-gray-900"
            )}
          >
            Team
          </button>
        </div>
      </div>

      {view === "individual" ? (
        <div className="space-y-3">
          {leaderboard.map((entry, index) => {
            const isCurrentUser = entry.id === session?.user?.id;
            const badge = getStreakBadge(entry.streak);
            const showRank = index < 5;

            return (
              <div
                key={entry.id}
                className={cn(
                  "card flex items-center gap-4 transition-all",
                  isCurrentUser && "border-brand-200 bg-brand-50 ring-1 ring-brand-100",
                  index === 0 && "border-yellow-200 bg-gradient-to-r from-yellow-50 to-white"
                )}
              >
                {/* Rank */}
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center">
                  {index === 0 ? (
                    <span className="text-2xl">&#x1F947;</span>
                  ) : index === 1 ? (
                    <span className="text-2xl">&#x1F948;</span>
                  ) : index === 2 ? (
                    <span className="text-2xl">&#x1F949;</span>
                  ) : showRank ? (
                    <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                  ) : (
                    <span className="text-sm text-gray-400">#{index + 1}</span>
                  )}
                </div>

                {/* Avatar + Name */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                    {entry.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">
                      {entry.name}
                      {isCurrentUser && <span className="ml-2 text-xs text-brand-600">(You)</span>}
                    </p>
                    <div className="flex items-center gap-2">
                      {entry.teamName && (
                        <span className="text-xs text-gray-500">{entry.teamName}</span>
                      )}
                      {badge && (
                        <span className={cn("badge text-xs", badge.color)}>
                          {badge.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Challenges</p>
                    <p className="font-semibold text-gray-900">{entry.completedChallenges}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Avg Quality</p>
                    <p className="font-semibold text-gray-900">{entry.avgQuality}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Streak</p>
                    <p className="font-semibold text-gray-900">{entry.streak}w</p>
                  </div>
                  {entry.recentScores.length > 1 && (
                    <div className="w-20 h-8">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={entry.recentScores}>
                          <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#4c6ef5"
                            strokeWidth={1.5}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Points */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-2xl font-bold text-brand-600">{entry.totalPoints}</p>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </div>
            );
          })}
          {leaderboard.length === 0 && (
            <div className="card text-center py-12">
              <p className="text-gray-500">No scores yet. Complete a challenge to appear on the leaderboard!</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {teamData.map((team, index) => (
            <div key={team.name} className={cn("card flex items-center gap-4", index === 0 && "border-yellow-200 bg-gradient-to-r from-yellow-50 to-white")}>
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center">
                <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{team.name}</p>
                <p className="text-xs text-gray-500">{team.members} members</p>
              </div>
              <div className="hidden sm:flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Challenges</p>
                  <p className="font-semibold text-gray-900">{team.completedChallenges}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Avg Quality</p>
                  <p className="font-semibold text-gray-900">{team.avgQuality}</p>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-2xl font-bold text-brand-600">{team.totalPoints}</p>
                <p className="text-xs text-gray-500">points</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
