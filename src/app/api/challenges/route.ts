import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const programmes = await prisma.programme.findMany({
      where: { companyId: session.user.companyId },
      include: {
        months: {
          include: {
            challenges: {
              include: {
                submissions: {
                  where: { userId: session.user.id },
                },
              },
              orderBy: { weekNumber: "asc" },
            },
          },
          orderBy: { number: "asc" },
        },
      },
    });

    return NextResponse.json(programmes);
  } catch (error) {
    console.error("Error fetching challenges:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenges" },
      { status: 500 }
    );
  }
}
