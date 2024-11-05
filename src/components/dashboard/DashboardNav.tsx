"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import styles from "./DashboardNav.module.scss";

export function DashboardNav() {
  return (
    <nav className={styles["nav"]}>
      <div className={styles["logo"]}>Construction Portal</div>

      <div className={styles["links"]}>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/dashboard/projects">Projects</Link>
        <Link href="/dashboard/timesheet">Timesheet</Link>
        <Link href="/dashboard/documents">Documents</Link>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className={styles["signOut"]}
      >
        Sign Out
      </button>
    </nav>
  );
}
