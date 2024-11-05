import { DashboardNav } from "@/components/dashboard/DashboardNav";
// import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import styles from "./dashboard.module.scss";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles["layout"]}>
      <DashboardNav />
      <div className={styles["container"]}>
        {/* <DashboardSidebar /> */}
        <main className={styles["main"]}>{children}</main>
      </div>
    </div>
  );
}
