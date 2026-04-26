# Edge Migration — what changed and what to verify

The tRPC API route now runs on Vercel's Edge runtime. For Indian users this
cuts dashboard latency from multi-second to ~80–150ms because:

- **Edge functions run in Mumbai (bom1)** on the free tier — same region as
  the Supabase database, instead of Washington DC.
- **Edge cold start is ~5ms** vs ~1–3s for Node serverless on Hobby.
- **Supabase JS uses HTTP (PostgREST)**, which works on Edge — Drizzle's
  `postgres-js` driver couldn't.

## What changed in the codebase

- `auth.config.ts` (new): Edge-safe NextAuth config — no DB adapter.
- `lib/auth/edge.ts` (new): exports `authEdge()` for Edge contexts.
- `lib/auth.ts`: now extends `authConfig` and adds the Drizzle adapter for
  sign-in flows that need DB writes.
- `lib/supabase/admin.ts` (new): Supabase JS client using service role key.
  Works on both Node and Edge. Bypasses RLS — security comes from the
  manual `user_id = ctx.userId` filter in every router procedure, enforced
  by `protectedProcedure`.
- `server/routers/*.ts`: all 14 procedures rewritten from Drizzle to
  Supabase JS. Logic identical; column names converted snake_case in the
  serializers because PostgREST returns DB-native names.
- `server/trpc.ts`: imports `authEdge` instead of full `auth`.
- `app/api/trpc/[trpc]/route.ts`: `export const runtime = "edge"` and
  `preferredRegion = ["bom1", "sin1", "hnd1"]`.

Drizzle stays as the source of truth for **schema and migrations** — only
runtime queries moved to Supabase JS.

## What you need to verify in Vercel

The migration uses three env vars. Check Vercel → Settings → Environment
Variables (Production scope) has all of:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
```

Get them from **Supabase Dashboard → Settings → API**. The service role key
is sensitive — never commit, never expose to the browser.

If any are missing, add them and redeploy. The Edge function will throw
"Missing Supabase env vars" at first request otherwise.

## How to verify it worked

After the deploy:

1. Open `https://lastemi.com/dashboard` while signed in.
2. DevTools → Network → filter for `api/trpc` → click any request →
   Response headers should include `x-vercel-execution-region: bom1`
   (or `sin1` if Mumbai is unavailable).
3. Time the dashboard load. Should be sub-second.
4. Hit `https://lastemi.com/api/perf-check` (this still uses Node + Drizzle
   so its `pureNetworkMs` will still be high — that's expected, it's a
   different runtime than the migrated tRPC route).

## Rollback

If something breaks in production:

1. Revert this commit: `git revert <hash>`
2. Push. Vercel redeploys with the old Drizzle-on-Node setup.
3. The Drizzle code is untouched in `lib/db/`, so revert is clean.

## Future cleanup

- Remove `lib/db/index.ts` runtime usage from `lib/auth.ts` once we move
  the NextAuth adapter off Drizzle (low priority).
- Consider removing the `db` Drizzle client entirely after a few weeks of
  stable Edge production — but keep `drizzle-kit` and the schema for
  migrations.
- Strip the `[perf]` console.log lines from `server/routers/loans.ts` once
  we're confident in the Edge performance.
