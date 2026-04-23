import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getSessionUser();

    const programmes = await prisma.programme.findMany({
      where: { companyId: user.companyId },
      include: {
        months: {
          include: {
            challenges: {
              include: {
                submissions: {
                  where: { userId: user.id },
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
