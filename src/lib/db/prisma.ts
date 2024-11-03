import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export { prisma };
export default prisma;

// // src/lib/db/prisma.ts
// import { PrismaClient } from "@prisma/client";

// declare global {
//   var prisma: PrismaClient | undefined;
// }

// const prismaClientSingleton = () => {
//   return new PrismaClient({
//     log:
//       process.env.NODE_ENV === "development"
//         ? ["query", "error", "warn"]
//         : ["error"],
//   });
// };

// export const prisma = globalThis.prisma ?? prismaClientSingleton();

// if (process.env.NODE_ENV !== "production") {
//   globalThis.prisma = prisma;
// }

// export default prisma;
