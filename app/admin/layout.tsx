import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/utils/admin";
import { TRPCProvider } from "@/lib/trpc/provider";

// Admin section gate. Two layers of defence:
//  1. This layout checks isAdminEmail() server-side — non-admins get
//     redirected to /dashboard before any admin UI is rendered.
//  2. Every mutation behind the admin section uses adminProcedure on
//     the tRPC server, which independently re-checks isAdmin from the
//     session JWT. So even if someone bypasses the UI, the backend
//     refuses to act.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login?ref=admin");
  }

  if (!isAdminEmail(session.user.email)) {
    redirect("/dashboard");
  }

  return (
    <TRPCProvider>
      <div className="min-h-screen bg-background">
        {/* Top nav for the admin section. Kept dead-simple — no fancy sidebar. */}
        <header className="bg-card border-b border-border sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link
                href="/admin"
                className="text-sm font-semibold text-foreground"
              >
                LastEMI Admin
              </Link>
              <nav className="flex items-center gap-4 text-sm text-muted-foreground">
                <Link
                  href="/admin"
                  className="hover:text-foreground transition-colors"
                >
                  Overview
                </Link>
                <Link
                  href="/admin/users"
                  className="hover:text-foreground transition-colors"
                >
                  Users
                </Link>
                <Link
                  href="/admin/admins"
                  className="hover:text-foreground transition-colors"
                >
                  Admins
                </Link>
              </nav>
            </div>
            <div className="text-xs text-muted-foreground">
              {session.user.email}
              {" · "}
              <Link href="/dashboard" className="hover:text-foreground underline">
                Exit admin
              </Link>
            </div>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      </div>
    </TRPCProvider>
  );
}
