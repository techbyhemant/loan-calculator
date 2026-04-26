import { createServerCaller } from "@/lib/trpc/server";
import DashboardClient from "./DashboardClient";

// Server component — prefetches loans in-process (no HTTP hop) and hands
// them to the client as initialData. Eliminates the post-hydration network
// round-trip on dashboard load. Combined with the persistent Postgres
// client and the new indexes, this is the biggest single perf win for
// users on Vercel Hobby (US East) hitting Supabase (Mumbai).
export default async function DashboardPage() {
  // TEMPORARY perf instrumentation — remove once latency is dialed in.
  // Look in Vercel → Functions → /dashboard logs to see where time goes.
  const t0 = Date.now();
  const trpc = await createServerCaller();
  const t1 = Date.now();
  const initialLoans = await trpc.loans.getAll();
  const t2 = Date.now();
  console.log(
    `[perf /dashboard] ctx=${t1 - t0}ms loans.getAll=${t2 - t1}ms total=${
      t2 - t0
    }ms loans=${initialLoans.length}`,
  );
  return <DashboardClient initialLoans={initialLoans} />;
}
