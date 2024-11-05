import type { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client"; // Import Role from Prisma

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role?: Role;
      position?: string;
      department?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role?: Role;
    position?: string;
    department?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    position?: string;
    department?: string | null;
  }
}
