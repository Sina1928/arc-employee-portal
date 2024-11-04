"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import styles from "./login.module.scss";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMicrosoftLogin = async () => {
    try {
      setIsLoading(true);
      setError("");
      const result = await signIn("azure-ad", {
        callbackUrl: "/dashboard",
        redirect: true,
      });

      if (result?.error) {
        setError("Failed to sign in. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles["loginContainer"]}>
      <div className={styles["loginCard"]}>
        <div className={styles["logoSection"]}>
          <Image
            src="/images/logo.png"
            alt="Company Logo"
            width={150}
            height={150}
            priority
          />
          <h1>Construction Portal</h1>
        </div>

        <div className={styles["loginSection"]}>
          {error && <div className={styles["error"]}>{error}</div>}

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
      </div>
    </div>
  );
}
