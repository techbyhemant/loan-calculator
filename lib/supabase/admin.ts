import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client using the service role key. Bypasses
// Row-Level Security — every query in this codebase manually filters by
// `user_id = ctx.userId`, which the protectedProcedure middleware enforces.
//
// Works in BOTH Node and Edge runtimes because Supabase JS uses fetch
// (not Node TCP), so this is the driver we need to run the tRPC route on
// Vercel's Edge Runtime — Edge cold-starts in ~5ms and runs in Mumbai for
// Indian users (vs Node serverless locked to iad1 / Washington DC on Hobby).

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing Supabase env vars. Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
  );
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  // Aggressive cache headers off — every read is fresh.
  global: {
    fetch: (url, init) => fetch(url, { ...init, cache: "no-store" }),
  },
});
