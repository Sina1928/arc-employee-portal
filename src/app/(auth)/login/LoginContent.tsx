"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import styles from "./login.module.scss";

export function LoginContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get("error");

  async function handleMicrosoftLogin() {
    try {
      setIsLoading(true);
      setError("");
      await signIn("azure-ad", {
        callbackUrl: "/dashboard",
        redirect: true,
      });
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles["loginSection"]}>
      {(error || errorMessage) && (
        <div className={styles["error"]}>
          {error || "Authentication failed. Please try again."}
        </div>
      )}

      <button
        className={styles["microsoftButton"]}
        onClick={handleMicrosoftLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className={styles["spinner"]} />
        ) : (
          <>
            <Image
              src="/images/microsoft-logo.svg"
              alt="Microsoft"
              width={20}
              height={20}
            />
            <span>Sign in with Microsoft</span>
          </>
        )}
      </button>

      <p className={styles["info"]}>
        Use your company Microsoft account to sign in
      </p>
    </div>
  );
}
