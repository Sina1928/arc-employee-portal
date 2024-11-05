import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import styles from "./dashboard.module.scss";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className={styles["dashboard"]}>
      <h1>Welcome back, {session.user?.name}</h1>

      <div className={styles["grid"]}>{/* Components will go here */}</div>
    </div>
  );
}
