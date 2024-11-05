import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";

const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };

// import NextAuth from "next-auth";
// import AzureADProvider from "next-auth/providers/azure-ad";
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import { prisma } from "@/lib/db/prisma";
// import { Role } from "@prisma/client";
// import type { Session, User, Account, AuthOptions } from "next-auth";
// // import type { JWT } from "next-auth/jwt";

// if (!process.env.AZURE_AD_CLIENT_ID)
//   throw new Error("Missing AZURE_AD_CLIENT_ID");
// if (!process.env.AZURE_AD_CLIENT_SECRET)
//   throw new Error("Missing AZURE_AD_CLIENT_SECRET");

// interface ExtendedUser extends User {
//   role?: Role;
//   position?: string;
//   department?: string | null;
// }

// interface ExtendedSession extends Session {
//   user: {
//     id: string;
//     email: string | null;
//     name?: string | null;
//     role?: Role;
//     position?: string;
//     department?: string | null;
//   };
// }

// const authConfig: AuthOptions = {
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     AzureADProvider({
//       clientId: process.env.AZURE_AD_CLIENT_ID,
//       clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
//       authorization: {
//         params: {
//           prompt: "select_account",
//         },
//       },
//     }),
//   ],
//   callbacks: {
//     async session({ session, user }): Promise<ExtendedSession> {
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
//           session.user.role = dbUser.role;
//           session.user.position = dbUser.position;
//           session.user.department = dbUser.department;
//         }
//       }
//       return session as ExtendedSession;
//     },
//     async signIn({
//       user,
//     }: // account
//     {
//       user: ExtendedUser;
//       account: Account | null;
//     }): Promise<boolean> {
//       if (!user?.email) return false;

//       try {
//         let dbUser = await prisma.user.findUnique({
//           where: { email: user.email },
//         });

//         if (!dbUser) {
//           const nameParts = user.name?.split(" ") || [];
//           const firstName = nameParts[0] || "";
//           const lastName = nameParts.slice(1).join(" ") || "";

//           dbUser = await prisma.user.create({
//             data: {
//               email: user.email,
//               firstName,
//               lastName,
//               microsoftId: user.id || null,
//               role: "EMPLOYEE" as Role,
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
//   session: {
//     strategy: "jwt" as const,
//   },
// };

// const handler = NextAuth(authConfig);

// export { handler as GET, handler as POST };
