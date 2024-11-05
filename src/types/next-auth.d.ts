import type { DefaultSession, DefaultUser } from "next-auth";

// Define Role enum
export enum Role {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  EMPLOYEE = "EMPLOYEE",
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role?: Role;
      position?: string;
      department?: string | null;
    };
  }

  interface User extends DefaultUser {
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
