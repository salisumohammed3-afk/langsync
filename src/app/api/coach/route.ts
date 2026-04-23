import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();

    const { challengeId, message } = await req.json();

    // Get or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: { userId: user.id, challengeId },
    });

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        month: {
          include: {
            programme: { include: { company: true } },
          },
        },
      },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    let messages: { role: string; content: string; timestamp: string }[] = [];
    if (conversation) {
      try {
        messages = JSON.parse(conversation.messages);
      } catch {
        messages = [];
      }
    }

    // Add user message
    messages.push({
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    });

    // Generate AI coach response (simulated - in production, use Claude API)
    const coachResponse = generateCoachResponse(message, challenge);

    messages.push({
      role: "assistant",
      content: coachResponse,
      timestamp: new Date().toISOString(),
    });

    if (conversation) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { messages: JSON.stringify(messages) },
      });
    } else {
      conversation = await prisma.conversation.create({
        data: {
          userId: user.id,
          challengeId,
          messages: JSON.stringify(messages),
        },
      });
    }

    return NextResponse.json({
      response: coachResponse,
      conversationId: conversation.id,
    });
  } catch (error) {
    console.error("Error with AI Coach:", error);
    return NextResponse.json({ error: "Coach unavailable" }, { status: 500 });
  }
}

function generateCoachResponse(
  userMessage: string,
  challenge: { title: string; brief: string; type: string; scoringCriteria: string | null; month: { programme: { company: { name: string; websiteUrl: string | null; industry: string | null } } } }
): string {
  const msg = userMessage.toLowerCase();
  const company = challenge.month.programme.company;

  // Check if user is asking the AI to do the work
  const doWorkPatterns = [
    "write it for me",
    "do it for me",
    "give me the answer",
    "write the",
    "create the",
    "generate the",
    "make the",
    "produce the",
  ];

  if (doWorkPatterns.some((p) => msg.includes(p))) {
    return `I can walk you through the approach, but the challenge is yours to complete. What part are you stuck on? I'm happy to explain concepts, give examples from other sites, or help you think through your strategy for "${challenge.title}".`;
  }

  // Context-aware responses
  if (msg.includes("what") && (msg.includes("schema") || msg.includes("structured data"))) {
    return `Great question! Schema markup (structured data) is code you add to your website to help search engines understand your content better. For ${company.name || "your company"} in the ${company.industry || "retail"} industry, the most relevant schema types would be Product, FAQ, HowTo, and BreadcrumbList.\n\nFor this challenge "${challenge.title}", focus on understanding:\n1. What schema types are most relevant\n2. How to validate existing schema\n3. What gaps exist compared to competitors\n\nWould you like me to explain any of these areas in more detail?`;
  }

  if (msg.includes("title tag") || msg.includes("meta title")) {
    return `Title tags are one of the most important on-page SEO elements. A great title tag for ${company.industry || "ecommerce"} should:\n\n1. **Be under 60 characters** to avoid truncation in search results\n2. **Include the primary keyword** near the beginning\n3. **Be compelling** to drive clicks\n4. **Include the brand name** where appropriate\n\nFor "${challenge.title}", think about what would make a searcher choose your result over a competitor's. What aspect of title tags would you like to explore further?`;
  }

  if (msg.includes("help") || msg.includes("stuck") || msg.includes("don't understand")) {
    return `No worries, let me help break this down! The challenge "${challenge.title}" is about:\n\n${challenge.brief}\n\nHere's how I'd suggest approaching it:\n1. Start by reading through the brief carefully\n2. Look at the Great Example to understand what good looks like\n3. Study the Competitor Examples to see real-world applications\n4. Then draft your response, keeping the scoring criteria in mind${challenge.scoringCriteria ? `:\n\n**Scoring criteria:** ${challenge.scoringCriteria}` : ""}\n\nWhat specific part would you like me to explain further?`;
  }

  if (msg.includes("competitor") || msg.includes("example")) {
    return `Looking at competitor examples is a great way to understand best practices in action. When analysing competitors for ${company.name || "your company"}, pay attention to:\n\n1. **What they do well** - What specific elements stand out?\n2. **Where they fall short** - Are there gaps you can exploit?\n3. **How it applies to you** - How can ${company.name || "your company"} adapt these learnings?\n\nRemember, the goal isn't to copy competitors but to learn from them and create something even better. What specific aspect of the competitor examples would you like to discuss?`;
  }

  // Default helpful response
  return `That's a great question about "${challenge.title}"! This ${challenge.type} challenge is designed to help you build practical skills.\n\nHere are some things to consider:\n- Review the brief carefully for specific requirements\n- Look at the scoring criteria to understand what earns the highest marks\n- Use the examples provided as inspiration, not as templates to copy\n\n${challenge.scoringCriteria ? `**Scoring focus:** ${challenge.scoringCriteria}\n\n` : ""}What specific aspect would you like to explore? I'm here to help you understand the concepts and develop your approach.`;
}
