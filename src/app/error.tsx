"use client";

import styles from "./error.module.scss";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={styles["container"]}>
      <h2 className={styles["heading"]}>Something went wrong!</h2>
      <p className={styles["message"]}>
        {error.message || "An unexpected error occurred"}
      </p>
      <button onClick={reset} className={styles["button"]}>
        Try again
      </button>
    </div>
  );
}
