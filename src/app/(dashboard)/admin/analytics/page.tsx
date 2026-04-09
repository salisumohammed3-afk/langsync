"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Analytics {
  totalUsers: number;
  totalSubmissions: number;
  totalChallenges: number;
  completionRate: number;
  avgQuality: number;
  totalCoachMessages: number;
  challengeStats: {
    id: string;
    title: string;
    type: string;
    submissions: number;
    completionRate: number;
    avgQuality: number;
  }[];
}

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !analytics) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  const chartData = analytics.challengeStats.map((ch) => ({
    name: ch.title.length > 20 ? ch.title.slice(0, 20) + "..." : ch.title,
    completionRate: ch.completionRate,
    avgQuality: ch.avgQuality,
    submissions: ch.submissions,
  }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Analytics</h1>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6 mb-8">
        <div className="card text-center">
          <p className="text-xs text-gray-500">Users</p>
          <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500">Challenges</p>
          <p className="text-2xl font-bold text-gray-900">{analytics.totalChallenges}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500">Submissions</p>
          <p className="text-2xl font-bold text-gray-900">{analytics.totalSubmissions}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500">Completion</p>
          <p className="text-2xl font-bold text-brand-600">{analytics.completionRate}%</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500">Avg Quality</p>
          <p className="text-2xl font-bold text-gray-900">{analytics.avgQuality}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500">Coach Msgs</p>
          <p className="text-2xl font-bold text-purple-600">{analytics.totalCoachMessages}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <div className="card">
          <h3 className="mb-4 font-semibold text-gray-900">Completion Rate by Challenge</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completionRate" fill="#4c6ef5" name="Completion %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h3 className="mb-4 font-semibold text-gray-900">Average Quality by Challenge</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 3]} />
                <Tooltip />
                <Bar dataKey="avgQuality" fill="#22c55e" name="Avg Quality" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="card overflow-hidden p-0">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Challenge Breakdown</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Challenge</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">Type</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">Submissions</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">Completion</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">Quality</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {analytics.challengeStats.map((ch) => (
              <tr key={ch.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{ch.title}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`badge text-xs ${ch.type === "SEO" ? "bg-blue-100 text-blue-700" : ch.type === "AEO" ? "bg-purple-100 text-purple-700" : "bg-amber-100 text-amber-700"}`}>
                    {ch.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-600">{ch.submissions}</td>
                <td className="px-4 py-3 text-center text-sm text-gray-600">{ch.completionRate}%</td>
                <td className="px-4 py-3 text-center text-sm text-gray-600">{ch.avgQuality}/3</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
