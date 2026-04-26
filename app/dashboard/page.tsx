import { createServerCaller } from "@/lib/trpc/server";
import DashboardClient from "./DashboardClient";

// Server component — prefetches loans in-process (no HTTP hop) and hands
// them to the client as initialData. Eliminates the post-hydration network
// round-trip on dashboard load. Combined with the persistent Postgres
// client and the new indexes, this is the biggest single perf win for
// users on Vercel Hobby (US East) hitting Supabase (Mumbai).
export default async function DashboardPage() {
  const trpc = await createServerCaller();
  const initialLoans = await trpc.loans.getAll();
  return <DashboardClient initialLoans={initialLoans} />;
}
