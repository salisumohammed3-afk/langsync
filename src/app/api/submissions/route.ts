import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { challengeId, content, status = "submitted" } = await req.json();

    if (!challengeId || !content) {
      return NextResponse.json(
        { error: "Challenge ID and content are required" },
        { status: 400 }
      );
    }

    // Check if already submitted
    const existing = await prisma.submission.findFirst({
      where: {
        userId: session.user.id,
        challengeId,
        status: "submitted",
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
        status,
        completionScore: status === "submitted" ? 1 : 0,
        userId: session.user.id,
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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const submissions = await prisma.submission.findMany({
      where: { userId: session.user.id },
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
