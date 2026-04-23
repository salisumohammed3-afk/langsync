import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      companyId: string;
      companyName: string;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    companyId: string;
    companyName: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    companyId: string;
    companyName: string;
  }
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AiFeedback {
  strengths: string[];
  improvements: string[];
  scorePreview: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}
