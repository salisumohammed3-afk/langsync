import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["reviewer", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const submissions = await prisma.submission.findMany({
      where: {
        user: { companyId: session.user.companyId },
        status: { in: ["submitted", "reviewed"] },
      },
      include: {
        user: { select: { name: true, email: true, teamName: true } },
        challenge: { select: { title: true, brief: true, type: true, scoringCriteria: true } },
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["reviewer", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { submissionId, qualityScore, impactScore, reviewerFeedback } = await req.json();

    const submission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        qualityScore,
        impactScore,
        reviewerFeedback,
        status: "reviewed",
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}
