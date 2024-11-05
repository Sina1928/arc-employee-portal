"use client";

import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

// "use client";

// type AuthProviderProps = {
//   children: React.ReactNode;
// };

// export function AuthProvider({ children }: AuthProviderProps) {
//   return <>{children}</>;
// }
