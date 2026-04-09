import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: params.id },
      include: {
        month: {
          include: {
            programme: {
              include: { company: true },
            },
          },
        },
        submissions: {
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
        },
        conversations: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(challenge);
  } catch (error) {
    console.error("Error fetching challenge:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenge" },
      { status: 500 }
    );
  }
}
