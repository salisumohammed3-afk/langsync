import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function isUnlocked(unlockDate: Date | string): boolean {
  return new Date(unlockDate) <= new Date();
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function calculateStreak(submissions: { submittedAt: Date }[]): number {
  if (submissions.length === 0) return 0;

  const sorted = [...submissions].sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const curr = new Date(sorted[i - 1].submittedAt);
    const prev = new Date(sorted[i].submittedAt);
    const diffDays =
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays <= 10) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
