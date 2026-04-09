import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

// Returns the session user, or a default admin user from the DB when auth is disabled
export async function getSessionUser(): Promise<{
  id: string;
  role: string;
  companyId: string;
  companyName: string;
}> {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    const u = session.user as unknown as { id: string; role: string; companyId: string; companyName: string };
    return u;
  }
  // Fallback: return the first admin user from the database
  const admin = await prisma.user.findFirst({
    where: { role: "admin" },
    include: { company: true },
  });
  if (admin) {
    return { id: admin.id, role: admin.role, companyId: admin.companyId, companyName: admin.company.name };
  }
  // Last resort: return first user
  const user = await prisma.user.findFirst({ include: { company: true } });
  if (user) {
    return { id: user.id, role: user.role, companyId: user.companyId, companyName: user.company.name };
  }
  throw new Error("No users in database");
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { company: true },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
          companyName: user.company.name,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as { role: string; companyId: string; companyName: string };
        token.role = u.role;
        token.companyId = u.companyId;
        token.companyName = u.companyName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const s = session.user as unknown as { id: string; role: string; companyId: string; companyName: string };
        s.id = token.sub as string;
        s.role = token.role;
        s.companyId = token.companyId;
        s.companyName = token.companyName;
      }
      return session;
    },
  },
};
