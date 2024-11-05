import { PrismaAdapter } from "@auth/prisma-adapter";
import AzureADProvider from "next-auth/providers/azure-ad";
import { prisma } from "@/lib/db/prisma";
import type { NextAuthConfig } from "next-auth";
import { Role } from "@prisma/client"; // Use Role from Prisma instead

if (!process.env["AZURE_AD_CLIENT_ID"])
  throw new Error("Missing AZURE_AD_CLIENT_ID");
if (!process.env["AZURE_AD_CLIENT_SECRET"])
  throw new Error("Missing AZURE_AD_CLIENT_SECRET");
if (!process.env["AZURE_AD_TENANT_ID"])
  throw new Error("Missing AZURE_AD_TENANT_ID");

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    AzureADProvider({
      clientId: process.env["AZURE_AD_CLIENT_ID"],
      clientSecret: process.env["AZURE_AD_CLIENT_SECRET"],
      tenantId: process.env["AZURE_AD_TENANT_ID"],
      authorization: {
        params: { prompt: "select_account" },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email || "" },
          select: {
            role: true,
            position: true,
            department: true,
          },
        });
        if (dbUser) {
          session.user.role = dbUser.role;
          session.user.position = dbUser.position;
          session.user.department = dbUser.department;
        }
      }
      return session;
    },
    async signIn({ user }) {
      if (!user?.email) return false;

      try {
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!dbUser) {
          const nameParts = user.name?.split(" ") || [];
          await prisma.user.create({
            data: {
              email: user.email,
              firstName: nameParts[0] || "",
              lastName: nameParts.slice(1).join(" ") || "",
              microsoftId: user.id ?? null,
              role: Role.EMPLOYEE,
              position: "New Employee",
              hireDate: new Date(),
              department: "Unassigned",
              isActive: true,
            },
          });
        }
        return true;
      } catch (error) {
        console.error("Sign in error:", error);
        return false;
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
    signOut: "/login",
  },
  session: { strategy: "jwt" },
};

// import { PrismaAdapter } from "@auth/prisma-adapter";
// import AzureADProvider from "next-auth/providers/azure-ad";
// import { prisma } from "@/lib/db/prisma";
// import type { NextAuthConfig } from "next-auth";
// import { Role } from "@/types/next-auth";

// // Validate environment variables
// const requiredEnvVars = {
//   clientId: process.env["AZURE_AD_CLIENT_ID"],
//   clientSecret: process.env["AZURE_AD_CLIENT_SECRET"],
//   tenantId: process.env["AZURE_AD_TENANT_ID"],
// } as const;

// // Check all required environment variables are present
// Object.entries(requiredEnvVars).forEach(([key, value]) => {
//   if (!value) throw new Error(`Missing ${key.toUpperCase()}`);
// });

// // Assert environment variables are defined after checking
// const clientId = requiredEnvVars.clientId!;
// const clientSecret = requiredEnvVars.clientSecret!;
// const tenantId = requiredEnvVars.tenantId!;

// export const authConfig: NextAuthConfig = {
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     AzureADProvider({
//       clientId,
//       clientSecret,
//       tenantId,
//       authorization: {
//         params: { prompt: "select_account" },
//       },
//     }),
//   ],
//   callbacks: {
//     async session({ session, user }) {
//       if (session.user) {
//         session.user.id = user.id;
//         const dbUser = await prisma.user.findUnique({
//           where: { email: session.user.email || "" },
//           select: {
//             role: true,
//             position: true,
//             department: true,
//           },
//         });
//         if (dbUser) {
//           session.user.role = dbUser.role as Role;
//           session.user.position = dbUser.position;
//           session.user.department = dbUser.department;
//         }
//       }
//       return session;
//     },
//     async signIn({ user }) {
//       if (!user?.email) return false;

//       try {
//         let dbUser = await prisma.user.findUnique({
//           where: { email: user.email },
//         });

//         if (!dbUser) {
//           const nameParts = user.name?.split(" ") || [];
//           await prisma.user.create({
//             data: {
//               email: user.email,
//               firstName: nameParts[0] || "",
//               lastName: nameParts.slice(1).join(" ") || "",
//               microsoftId: user.id ?? null, // Convert undefined to null for Prisma
//               role: Role.EMPLOYEE,
//               position: "New Employee",
//               hireDate: new Date(),
//               department: "Unassigned",
//               isActive: true,
//             },
//           });
//         }
//         return true;
//       } catch (error) {
//         console.error("Sign in error:", error);
//         return false;
//       }
//     },
//   },
//   pages: {
//     signIn: "/login",
//     error: "/login",
//     signOut: "/login",
//   },
//   session: { strategy: "jwt" },
// };
