import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();

    const { challengeId, content } = await req.json();

    if (!challengeId || !content) {
      return NextResponse.json(
        { error: "Challenge ID and content are required" },
        { status: 400 }
      );
    }

    // Check if already submitted
    const existing = await prisma.submission.findFirst({
      where: {
        userId: user.id,
        challengeId,
        status: { in: ["submitted", "reviewed"] },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Already submitted for this challenge" },
        { status: 400 }
      );
    }

    const submission = await prisma.submission.create({
      data: {
        content,
        status: "submitted",
        completionScore: 1,
        userId: user.id,
        challengeId,
      },
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json(
      { error: "Failed to create submission" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getSessionUser();

    const submissions = await prisma.submission.findMany({
      where: { userId: user.id },
      include: { challenge: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
