# Fixing the Vercel ↔ Supabase Region Mismatch

**The problem:** Your Vercel functions run in `iad1` (Washington DC, USA),
your Supabase Postgres runs in `ap-south-1` (Mumbai, India). Every dashboard
query crosses the Pacific twice — that's ~250–400ms of *network alone*
before the query even runs.

**The audit:** `aws-1-ap-south-1.pooler.supabase.com` is the Mumbai pooler.
Vercel Hobby plan locks all Node serverless functions to `iad1` (US East)
and does not allow region pinning.

**Goal:** put functions and database in the same region.

---

## Option A — move Supabase to a US region (recommended, free)

The smallest blast radius. Both Vercel and Supabase are in US East →
single-region setup → ~10ms function-to-DB latency. No code changes.

**Best when:** you're early stage, your DB is small, and most users are not
strictly Indian (LastEMI is targeted to India, but US-hosted DB still serves
Indian users with one extra hop on the network — ~150ms — which is offset
by zero application-tier latency).

### Steps

1. **Pick a target region.** US East 1 (`us-east-1`) matches Vercel's `iad1`.

2. **Create the new project.**
   - Go to https://supabase.com/dashboard
   - "New project" → name it `lastemi-prod-us` (or similar)
   - Region: **us-east-1**
   - Set a strong DB password (save it!)
   - Wait ~2 minutes for provisioning.

3. **Get the new connection strings.** In the new project:
   - Project Settings → Database
   - Copy "Connection string" for both:
     - **Transaction pooler** (port 6543) → this becomes the new `DATABASE_URL`
     - **Direct connection** (port 5432) → this becomes the new `DIRECT_URL`
   - Both will look like `postgresql://postgres.<project-ref>:<password>@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

4. **Export from the old (Mumbai) project.**
   ```bash
   # Install pg utilities if you don't have them
   brew install postgresql

   # Use your OLD DIRECT_URL (port 5432, not the pooler)
   pg_dump \
     --host=db.<OLD-PROJECT-REF>.supabase.co \
     --port=5432 \
     --username=postgres \
     --no-owner \
     --no-privileges \
     --schema=public \
     --schema=auth \
     --file=lastemi-backup.sql \
     postgres
   # It'll prompt for the password.
   ```

5. **Import into the new (US) project.**
   ```bash
   psql \
     --host=db.<NEW-PROJECT-REF>.supabase.co \
     --port=5432 \
     --username=postgres \
     --file=lastemi-backup.sql \
     postgres
   ```
   Some warnings about existing roles are normal — only errors that say
   "ERROR" mean a real problem.

6. **Apply the new performance indexes.** In the new project's SQL editor,
   paste and run `drizzle/migrations/2026-04-26-add-indexes.sql`.

7. **Update Vercel env vars.**
   - Vercel dashboard → your project → Settings → Environment Variables
   - Edit `DATABASE_URL` and `DIRECT_URL` with the new US strings
   - Apply to: Production, Preview, Development
   - Redeploy (Deployments tab → "Redeploy" on the latest)

8. **Update your local `.env.local`** with the same new strings.

9. **Verify.** Open the dashboard. The first load should now be <500ms total.
   Compare with the old timing in DevTools → Network → `api/trpc/...`.

10. **Once verified, delete the old Mumbai project** to avoid surprise bills.

### Rollback
- Keep the old project paused (don't delete it for 7 days).
- If anything breaks, switch the env vars back and redeploy.

---

## Option B — move Vercel to Mumbai (requires Pro plan, $20/mo)

If your Indian-user latency must be <200ms total, this is the gold standard.

### Steps

1. Upgrade to **Vercel Pro** at https://vercel.com/pricing.
2. Add `vercel.json` to repo root:
   ```json
   { "regions": ["bom1"] }
   ```
3. Push. Vercel will redeploy with all functions in Mumbai (`bom1`).
4. No DB changes needed.
5. **Result:** function ↔ DB latency drops to ~5–10ms.

### Trade-off
- $20/mo cost.
- Indian users see <100ms total dashboard load.
- US users see ~250ms (still acceptable).

---

## Option C — Edge Runtime (free, complex, future)

Migrate `app/api/trpc/[trpc]/route.ts` to Edge runtime. Edge functions run
on Vercel's globally-distributed network → nearest to user. **But:**
Drizzle's `postgres-js` driver requires Node TCP and won't run on Edge.

You'd need either:
- **Supabase JS client** (REST/PostgREST) — works on Edge but means
  rewriting every Drizzle query
- **Neon's HTTP serverless driver** with Supabase — only works for
  Postgres-over-HTTP, requires a connection-string adapter

This is the "right" answer long-term but the wrong answer for this week.
**Skip unless you're prepared for a multi-day refactor.**

---

## Recommendation for LastEMI (Indian audience)

LastEMI's users are in India. That changes the math: every API call has
two latencies — user-to-Vercel and Vercel-to-DB. We have to optimize both.

| Setup | Indian user round-trip | Cost |
|---|---|---|
| Mumbai Vercel + Mumbai DB | ~70ms ✅ | $20/mo (Pro) |
| US-East Vercel + US-East DB | ~520ms | Free |
| **Current** (US-East Vercel + Mumbai DB) | ~750ms+ | Free |
| Edge runtime + Mumbai DB | ~80ms ✅ | Free, but refactor |

**Don't do Option A blindly.** US-East-only is worse for Indian users than
fixing the database round-trips with the in-code optimizations alone,
because users still cross the Pacific. It only wins when application logic
makes many DB calls (which the dashboard does).

**Pragmatic path:**

1. **Ship the in-code fixes (already done)** + run the indexes SQL. See if
   real-user dashboard load is acceptable. Likely ~700ms — functional, not
   delightful.
2. **When revenue justifies $20/mo, do Option B.** This is the right
   architecture for the long term: both function and DB in Mumbai, sub-100ms
   user-perceived latency.
3. **If you must stay free and the latency hurts conversions,** invest a
   couple days in Option C (Edge runtime + Supabase JS client). It's the
   only free way to get sub-100ms for Indian users.

---

## Already shipped (in the same commit as this guide)

These don't need region pinning to work; they help regardless:

- ✅ Persistent Postgres client across warm Vercel invocations (saves
  100–200ms TLS handshake per request)
- ✅ Composite indexes on `loans(user_id, is_active, created_at)` plus
  user/loan indexes on `part_payments`, `credit_cards`, auth tables
- ✅ Server-side prefetch on `/dashboard` and `/dashboard/loans` — the page
  HTML ships with data already populated, no client waterfall
