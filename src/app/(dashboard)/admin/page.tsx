"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

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

export default function AdminPage() {
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

  if (session?.user?.role !== "admin") {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
        <p className="mt-2 text-gray-600">You need admin access to view this page.</p>
      </div>
    );
  }

  if (loading || !analytics) {
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
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">{session.user.companyName} overview</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/reviews" className="btn-secondary">
            Review Queue
          </Link>
          <Link href="/admin/analytics" className="btn-primary">
            Full Analytics
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="card">
          <p className="text-sm text-gray-500">Team Members</p>
          <p className="text-3xl font-bold text-gray-900">{analytics.totalUsers}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Submissions</p>
          <p className="text-3xl font-bold text-gray-900">{analytics.totalSubmissions}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Completion Rate</p>
          <p className="text-3xl font-bold text-brand-600">{analytics.completionRate}%</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Avg Quality</p>
          <p className="text-3xl font-bold text-gray-900">{analytics.avgQuality}/3</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        <div className="card">
          <h3 className="mb-1 text-sm font-semibold text-gray-700">AI Coach Usage</h3>
          <p className="text-2xl font-bold text-purple-600">{analytics.totalCoachMessages}</p>
          <p className="text-xs text-gray-500">total messages across all conversations</p>
        </div>
        <div className="card">
          <h3 className="mb-1 text-sm font-semibold text-gray-700">Challenges Active</h3>
          <p className="text-2xl font-bold text-gray-900">{analytics.totalChallenges}</p>
          <p className="text-xs text-gray-500">in the current programme</p>
        </div>
      </div>

      {/* Challenge Performance */}
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Challenge Performance</h2>
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Challenge
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                Type
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                Submissions
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                Completion
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                Avg Quality
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {analytics.challengeStats.map((ch) => (
              <tr key={ch.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {ch.title}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`badge text-xs ${
                      ch.type === "SEO"
                        ? "bg-blue-100 text-blue-700"
                        : ch.type === "AEO"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {ch.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-600">
                  {ch.submissions}
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-600">
                  {ch.completionRate}%
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-600">
                  {ch.avgQuality}/3
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
