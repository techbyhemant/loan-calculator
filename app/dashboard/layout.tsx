import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "./DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const userName = session.user?.name ?? "";
  const userEmail = session.user?.email ?? "";
  const userPlan = ((session.user as { plan?: string })?.plan ?? "free") as
    | "free"
    | "pro";

  return (
    <DashboardShell
      userName={userName}
      userEmail={userEmail}
      userPlan={userPlan}
    >
      {children}
    </DashboardShell>
  );
}
