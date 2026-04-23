import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, companyId } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Use provided companyId or find the first company
    let targetCompanyId = companyId;
    if (!targetCompanyId) {
      const company = await prisma.company.findFirst();
      if (!company) {
        return NextResponse.json(
          { error: "No company exists. Please contact an administrator." },
          { status: 400 }
        );
      }
      targetCompanyId = company.id;
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "challenger",
        companyId: targetCompanyId,
      },
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
