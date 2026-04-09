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

    const { challengeId, content } = await req.json();

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    if (!challenge.practiceEnabled) {
      return NextResponse.json(
        { error: "Practice centre not enabled for this challenge" },
        { status: 400 }
      );
    }

    // Count existing drafts
    const draftCount = await prisma.practiceDraft.count({
      where: { userId: session.user.id, challengeId },
    });

    // Generate AI feedback
    const feedback = generatePracticeFeedback(content, challenge);

    const draft = await prisma.practiceDraft.create({
      data: {
        content,
        aiFeedback: JSON.stringify(feedback),
        draftNumber: draftCount + 1,
        userId: session.user.id,
        challengeId,
      },
    });

    return NextResponse.json({ draft, feedback });
  } catch (error) {
    console.error("Error with practice:", error);
    return NextResponse.json({ error: "Practice failed" }, { status: 500 });
  }
}

function generatePracticeFeedback(
  content: string,
  challenge: { title: string; brief: string; scoringCriteria: string | null }
): { strengths: string[]; improvements: string[]; scorePreview: number } {
  const wordCount = content.split(/\s+/).length;
  const hasStructure =
    content.includes("\n") || content.includes("-") || content.includes("1.");
  const isDetailed = wordCount > 50;
  const isComprehensive = wordCount > 150;

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (isDetailed) {
    strengths.push(
      "Good level of detail in your response. You've gone beyond the minimum requirements."
    );
  }
  if (hasStructure) {
    strengths.push(
      "Well-structured response with clear organisation. This makes it easy to follow your reasoning."
    );
  }
  if (content.toLowerCase().includes("competitor") || content.toLowerCase().includes("example")) {
    strengths.push(
      "Good use of competitor analysis or examples to support your points."
    );
  }
  if (strengths.length === 0) {
    strengths.push(
      "You've made a start on the challenge. This is a solid foundation to build on."
    );
  }

  if (!isDetailed) {
    improvements.push(
      `Your response is ${wordCount} words. Try expanding to at least 50-100 words with more specific details and reasoning to score higher on quality.`
    );
  }
  if (!hasStructure) {
    improvements.push(
      "Consider structuring your response with bullet points or numbered steps. This shows systematic thinking and makes your work easier to review."
    );
  }
  if (!isComprehensive) {
    improvements.push(
      "Think about adding specific recommendations or actionable insights. The impact score rewards work that could produce real improvements."
    );
  }
  if (improvements.length === 0) {
    improvements.push(
      "Consider adding specific metrics or data points to strengthen your analysis further."
    );
  }

  let scorePreview = 1;
  if (isDetailed && hasStructure) scorePreview = 2;
  if (isComprehensive && hasStructure) scorePreview = 3;

  return { strengths, improvements, scorePreview };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const challengeId = url.searchParams.get("challengeId");

    if (!challengeId) {
      return NextResponse.json(
        { error: "challengeId required" },
        { status: 400 }
      );
    }

    const drafts = await prisma.practiceDraft.findMany({
      where: { userId: session.user.id, challengeId },
      orderBy: { draftNumber: "asc" },
    });

    return NextResponse.json(drafts);
  } catch (error) {
    console.error("Error fetching drafts:", error);
    return NextResponse.json({ error: "Failed to fetch drafts" }, { status: 500 });
  }
}
