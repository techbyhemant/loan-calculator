import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "./DashboardShell";
import { isAdminEmail } from "@/lib/utils/admin";

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
  const isAdmin = isAdminEmail(userEmail);

  return (
    <DashboardShell
      userName={userName}
      userEmail={userEmail}
      userPlan={userPlan}
      isAdmin={isAdmin}
    >
      {children}
    </DashboardShell>
  );
}
