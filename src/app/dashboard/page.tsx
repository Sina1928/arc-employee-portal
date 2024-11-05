import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
// import { ProjectsOverview } from '@/components/dashboard/ProjectsOverview';
// import { TimeTracker } from '@/components/dashboard/TimeTracker';
// import { Announcements } from '@/components/dashboard/Announcements';
import styles from "./dashboard.module.scss";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className={styles["dashboard"]}>
      <h1>Welcome back, {session.user?.name}</h1>

      <div className={styles["grid"]}>
        {/* <TimeTracker /> */}
        {/* <ProjectsOverview /> */}
        {/* <Announcements /> */}
      </div>
    </div>
  );
}
