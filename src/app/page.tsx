"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/challenges");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100">
      <nav className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
            <span className="text-lg font-bold text-white">L</span>
          </div>
          <span className="text-xl font-bold text-gray-900">LangSync</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-secondary">
            Sign In
          </Link>
          <Link href="/register" className="btn-primary">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-8 py-20 text-center">
        <div className="mb-6 inline-flex items-center rounded-full bg-brand-100 px-4 py-1.5 text-sm font-medium text-brand-700">
          SEO & AEO Training Platform
        </div>
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          Turn Training Into
          <span className="block bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
            Competitive Challenges
          </span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600">
          The LangSync Challenge Platform transforms passive SEO and AEO
          training into hands-on, measurable team challenges. Learn by doing,
          compete with colleagues, and track your progress.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/register" className="btn-primary px-8 py-3 text-base">
            Start Your Challenge
          </Link>
          <Link href="/login" className="btn-secondary px-8 py-3 text-base">
            Sign In
          </Link>
        </div>

        <div className="mt-20 grid gap-8 sm:grid-cols-3">
          <div className="card text-left">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h3 className="mb-1 font-semibold text-gray-900">Weekly Challenges</h3>
            <p className="text-sm text-gray-600">
              Practical 30-minute tasks with real-world examples, AI coaching,
              and structured feedback.
            </p>
          </div>
          <div className="card text-left">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
              </svg>
            </div>
            <h3 className="mb-1 font-semibold text-gray-900">Live Leaderboard</h3>
            <p className="text-sm text-gray-600">
              Track points, streaks, and achievements. Compete with your team in
              a motivating environment.
            </p>
          </div>
          <div className="card text-left">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <h3 className="mb-1 font-semibold text-gray-900">AI-Powered Coaching</h3>
            <p className="text-sm text-gray-600">
              Get contextual guidance from an AI coach that teaches without doing
              the work for you.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
