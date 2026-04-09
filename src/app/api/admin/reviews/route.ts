import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getSessionUser();

    const submissions = await prisma.submission.findMany({
      where: {
        user: { companyId: user.companyId },
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
    const reviewer = await getSessionUser();

    const { submissionId, qualityScore, impactScore, reviewerFeedback } = await req.json();

    // Verify submission belongs to the reviewer's company
    const existing = await prisma.submission.findFirst({
      where: { id: submissionId, user: { companyId: reviewer.companyId } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

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
