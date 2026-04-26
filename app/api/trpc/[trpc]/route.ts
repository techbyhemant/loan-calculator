import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { createContext } from "@/server/trpc";

// Edge runtime: cold-starts in ~5ms (vs 1-3s on Node serverless) and runs
// in the user's nearest region — including Mumbai (bom1) for Indian users
// on Vercel free tier. Combined with Supabase JS (HTTP-based, also runs
// on Edge), this brings dashboard API latency from multi-second to ~80ms
// for Indian users.
//
// Preferred Vercel regions for an Indian audience. The platform picks the
// best available; bom1 should win in normal operation.
export const runtime = "edge";
export const preferredRegion = ["bom1", "sin1", "hnd1"];

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
  });

export { handler as GET, handler as POST };
