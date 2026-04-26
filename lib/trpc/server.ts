import "server-only";
import { appRouter } from "@/server/routers/_app";
import { createContext } from "@/server/trpc";

/**
 * Server-side tRPC caller — invokes router procedures *in process*,
 * skipping the HTTP round-trip entirely. Use this in async Server
 * Components (and Server Actions) to prefetch data for the initial
 * render. The browser then hydrates with `initialData`, eliminating
 * the post-hydration loading spinner.
 *
 * Usage:
 *   const trpc = await createServerCaller();
 *   const loans = await trpc.loans.getAll();
 *   return <DashboardClient initialLoans={loans} />;
 */
export async function createServerCaller() {
  const ctx = await createContext();
  return appRouter.createCaller(ctx);
}
