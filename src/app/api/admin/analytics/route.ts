import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = session.user.companyId;

    const [users, submissions, challenges, conversations] = await Promise.all([
      prisma.user.count({ where: { companyId, role: "challenger" } }),
      prisma.submission.findMany({
        where: { user: { companyId } },
        include: { challenge: true, user: true },
      }),
      prisma.challenge.findMany({
        where: { month: { programme: { companyId } } },
      }),
      prisma.conversation.findMany({
        where: { user: { companyId } },
      }),
    ]);

    const totalSubmissions = submissions.filter(
      (s) => s.status === "submitted" || s.status === "reviewed"
    ).length;
    const totalChallenges = challenges.length;
    const completionRate =
      users > 0 && totalChallenges > 0
        ? Math.round((totalSubmissions / (users * totalChallenges)) * 100)
        : 0;

    const reviewedSubmissions = submissions.filter((s) => s.qualityScore);
    const avgQuality =
      reviewedSubmissions.length > 0
        ? Math.round(
            (reviewedSubmissions.reduce(
              (sum, s) => sum + (s.qualityScore || 0),
              0
            ) /
              reviewedSubmissions.length) *
              10
          ) / 10
        : 0;

    const totalCoachMessages = conversations.reduce((sum, c) => {
      try {
        const msgs = JSON.parse(c.messages);
        return sum + msgs.length;
      } catch {
        return sum;
      }
    }, 0);

    // Per-challenge stats
    const challengeStats = challenges.map((ch) => {
      const chSubs = submissions.filter((s) => s.challengeId === ch.id);
      const submitted = chSubs.filter(
        (s) => s.status === "submitted" || s.status === "reviewed"
      );
      return {
        id: ch.id,
        title: ch.title,
        type: ch.type,
        submissions: submitted.length,
        completionRate: users > 0 ? Math.round((submitted.length / users) * 100) : 0,
        avgQuality:
          submitted.filter((s) => s.qualityScore).length > 0
            ? Math.round(
                (submitted
                  .filter((s) => s.qualityScore)
                  .reduce((sum, s) => sum + (s.qualityScore || 0), 0) /
                  submitted.filter((s) => s.qualityScore).length) *
                  10
              ) / 10
            : 0,
      };
    });

    return NextResponse.json({
      totalUsers: users,
      totalSubmissions,
      totalChallenges,
      completionRate,
      avgQuality,
      totalCoachMessages,
      challengeStats,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
