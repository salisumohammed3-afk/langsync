import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const currentUser = await getSessionUser();

    const users = await prisma.user.findMany({
      where: {
        companyId: currentUser.companyId,
        role: "challenger",
      },
      include: {
        submissions: {
          where: { status: "submitted" },
          orderBy: { submittedAt: "desc" },
        },
      },
    });

    const leaderboard = users
      .map((user) => {
        const totalPoints = user.submissions.reduce((sum, s) => {
          return (
            sum +
            s.completionScore +
            (s.qualityScore || 0) +
            (s.impactScore || 0)
          );
        }, 0);

        const completedChallenges = user.submissions.length;
        const avgQuality =
          completedChallenges > 0
            ? user.submissions.reduce(
                (sum, s) => sum + (s.qualityScore || 0),
                0
              ) / completedChallenges
            : 0;

        // Calculate streak
        let streak = 0;
        if (user.submissions.length > 0) {
          streak = 1;
          for (let i = 1; i < user.submissions.length; i++) {
            const curr = new Date(user.submissions[i - 1].submittedAt);
            const prev = new Date(user.submissions[i].submittedAt);
            const diffDays =
              (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
            if (diffDays <= 10) {
              streak++;
            } else {
              break;
            }
          }
        }

        // Recent scores for sparkline
        const recentScores = user.submissions.slice(0, 8).map((s) => ({
          score:
            s.completionScore + (s.qualityScore || 0) + (s.impactScore || 0),
          date: s.submittedAt,
        }));

        return {
          id: user.id,
          name: user.name,
          teamName: user.teamName,
          totalPoints,
          completedChallenges,
          avgQuality: Math.round(avgQuality * 10) / 10,
          streak,
          recentScores: recentScores.reverse(),
        };
      })
      .sort((a, b) => b.totalPoints - a.totalPoints);

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
