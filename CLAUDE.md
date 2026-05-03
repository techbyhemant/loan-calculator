# CLAUDE.md — LastEMI

This file is read automatically by Claude Code at session start. It is the
single source of truth for *project-level rules*. Never contradict it.

For deep detail, three companion files live alongside this one:

- **ARCHITECTURE.md** — tRPC, Drizzle schema, validation, error handling, code standards
- **DESIGN_SYSTEM.md** — color tokens, component primitives, dark mode, spacing
- **BLOG_AUTOMATION.md** — autonomous blog pipeline (currently paused)

Read those before any architectural change.

---

## WHAT THIS PROJECT IS

**lastemi.com** — India's honest debt freedom platform. Users track all their
loans, see their exact debt-free date, and get math-backed guidance to become
debt-free faster.

**The gap:** No Indian app offers debt-payoff strategies (snowball/avalanche),
floating-rate recalculation tied to RBI repo rate, or honest consolidation
analysis without lead-gen funnels. We don't capture phone numbers. Ever.

**Acquisition funnel:** SEO calculator pages → free dashboard (sign in) →
optional Pro plan (₹299/month).

**Domain history:** lastemi.com was previously owned by a video/games site.
Google has ~300 ghost URLs indexed with old paths and `?video=...` params.
`middleware.ts` returns 410 Gone for them; `robots.ts` blocks them. Don't
remove that code.

---

## HOW CLAUDE CODE MUST BEHAVE

- **Read this file fully before writing any code.**
- **Read graphify-out/GRAPH_REPORT.md before architecture/codebase questions.**
  A knowledge graph of this project lives there. Bridge nodes, god nodes, and
  community structure are documented. Use the Grep/Glob hook prompt.
- **App Router only — no Pages Router, ever.**
- **tRPC for all client→server data.** No raw `fetch('/api/...')` from
  clients. Exceptions: NextAuth route, Razorpay webhook (when it exists).
- **No calculations inside React components.** All math goes in
  `/lib/calculations/`. Components consume pure functions.
- **No `any` in TypeScript.** Use types from `types/index.ts` or domain types
  from the relevant module.
- **Mobile first.** Every component must work at 375px width.
- **Design tokens only.** No raw `bg-gray-*`, `bg-white`, `text-gray-*`,
  `border-gray-*` — use semantic tokens (`bg-card`, `bg-muted`, `text-foreground`,
  `text-muted-foreground`, `border-border`, etc.). See DESIGN_SYSTEM.md.
- **Server-render text content for SEO landing pages.** No client-only
  rendering of body copy. Calculator interactivity is fine; copy is not.
- **Run `npx tsc --noEmit` before committing.** Build errors are not OK.
- **After modifying code, rebuild the graph:**
  ```bash
  python3 -c "from graphify.watch import _rebuild_code; from pathlib import Path; _rebuild_code(Path('.'))"
  ```
  A git post-commit hook does this automatically — don't disable it.

---

## TECH STACK — CURRENT VERSIONS

| Tool | Version | Notes |
|------|---------|-------|
| Next.js | 16 | App Router only |
| React | 19 | RSC + Server Actions |
| TypeScript | 5 | strict: true |
| Tailwind CSS | 4 | CSS-variable theme tokens |
| Database | Postgres (Supabase) | via Drizzle ORM |
| Drizzle ORM | 0.45 | Schema in `lib/db/schema.ts` |
| postgres-js | 3.4 | Connection in `lib/db/index.ts` |
| NextAuth.js | 5 (beta) | DrizzleAdapter + Google + Resend magic link |
| tRPC | 11 | Server in `server/`, client in `lib/trpc/` |
| TanStack Query | 5 | Used by tRPC react-query integration |
| Zod | 4 | All input validation |
| Charts | chart.js 4 + react-chartjs-2 | Loaded via dynamic import |
| Email | Resend | Magic link auth + transactional |
| AI (blog) | Gemini via REST | `gemini-flash-latest` (paused) |
| Replicate | for blog images | (paused with the blog pipeline) |

**Removed/migrated:** MongoDB (deps lingering, not used), Mongoose
(deprecated), Zustand (only used for client UI state, never for server data).

**Package manager:** npm. **Node:** 20+. **Deploy:** Vercel.

---

## ENVIRONMENT VARIABLES

```env
# Database
DATABASE_URL=                    # Supabase pooler URL
DIRECT_URL=                      # Direct Postgres URL for drizzle-kit migrations

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
RESEND_API_KEY=

# Razorpay (when monetisation goes live)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_PLAN_ID=
RAZORPAY_WEBHOOK_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=

# Affiliate URLs
BANKBAZAAR_HOME_LOAN_URL=
BANKBAZAAR_PERSONAL_LOAN_URL=
PAISABAZAAR_URL=

# Blog automation (workflow paused)
GEMINI_API_KEY=
REPLICATE_API_TOKEN=

# Analytics
NEXT_PUBLIC_GA_ID=               # GA4 (G-XXXXXXXXXX)
```

Never expose secret keys to the browser. Only `NEXT_PUBLIC_*` is safe
client-side.

---

## REPOSITORY STRUCTURE

```
loan-calculator/
├── app/                              ← Next.js App Router
│   ├── layout.tsx                    Root layout, schema, Clarity
│   ├── page.tsx                      Homepage (the EMI calculator)
│   ├── sitemap.ts                    Static + dynamic blog URLs
│   ├── robots.ts                     Blocks ghost video params, allows AI bots
│   ├── home-loan-emi-calculator/    Programmatic amount-based landing pages
│   │   ├── page.tsx                  Hub page
│   │   └── [amount]/page.tsx         8 statically-generated pages
│   ├── calculators/                  Domain-specific calculator pages
│   ├── blog/                         Blog index + post pages
│   ├── dashboard/                    Authed user dashboard
│   ├── login/                        Auth (server layout = noindex)
│   └── api/
│       ├── trpc/[trpc]/route.ts      tRPC HTTP adapter
│       └── auth/[...nextauth]/       NextAuth route
│
├── server/                           ← tRPC server (NOT app/api/)
│   ├── trpc.ts                       Instance, context, auth middleware
│   └── routers/
│       ├── _app.ts                   Root router
│       ├── loans.ts                  CRUD for loans + refreshFromStatement
│       ├── loanRateHistory.ts        Rate revision CRUD (floating-rate lifecycle)
│       ├── partPayments.ts           Log/list/delete part payments
│       ├── creditCards.ts            Card management
│       └── user.ts                   User plan, profile
│
├── features/loan-calculator/         ← Homepage calculator (heavy)
│   ├── LoanCalculator.tsx            Entry; lazy-loads sections
│   ├── context/                      LoanCalculatorContext (URL sync)
│   ├── components/                   Form, summary, amortization, etc.
│   └── charts/                       chart.js wrappers (dynamic ssr:false)
│
├── components/
│   ├── calculators/                  Per-calculator-page components
│   ├── dashboard/                    Sidebar, cards, forms, tables
│   ├── blog/                         BlogCard, MdxRenderer, ShareButton, InlineShareRow
│   ├── seo/JsonLd.tsx                FAQSchema, BreadcrumbSchema, etc.
│   └── ui/                           Buttons, inputs, modals (shadcn-ish)
│
├── lib/
│   ├── auth.ts                       NextAuth + DrizzleAdapter
│   ├── db/
│   │   ├── index.ts                  postgres-js client
│   │   └── schema.ts                 Drizzle schema (loans, partPayments, users, etc.)
│   ├── trpc/                         Client-side tRPC plumbing
│   ├── calculations/                 Pure math (loanCalcs, payoffStrategies, taxCalcs, …)
│   ├── seo/
│   │   ├── metadata.ts               buildMetadata factory
│   │   └── schema.ts                 JSON-LD generators
│   ├── blog/                         MDX loaders, types, internal linker
│   └── utils/                        formatters, planGating, helpers
│
├── content/blog/                     ← MDX blog posts (committed)
├── data/blog-queue.json              ← Pending blog topics for autonomous gen
├── scripts/blog/                     ← Blog automation pipeline (paused)
├── graphify-out/                     ← Knowledge graph (gitignored)
├── ARCHITECTURE.md                   ← tRPC + Drizzle code standards
├── DESIGN_SYSTEM.md                  ← Tokens, primitives, dark mode
├── BLOG_AUTOMATION.md                ← Pipeline architecture
└── middleware.ts                     ← 410 for ghost params, www→non-www
```

---

## SEO ARCHITECTURE

The site has three categories of indexable URLs. Each follows a different
pattern. **Don't mix them up.**

1. **Programmatic landing pages** — `/home-loan-emi-calculator/[amount]/`
   - 8 static params (15L, 20L, 25L, 50L, 60L, 75L, 90L, 1Cr)
   - Server-rendered EMI matrix using `lib/calculations/loanCalcs.ts`
   - Each has its own metadata, FAQ schema, breadcrumb schema, WebApplication schema
   - CTA links to homepage with prefilled query params (`?amount=…&type=home`)

2. **Topic calculator pages** — `/calculators/[topic]/`
   - One-off, hand-written content + a domain-specific calc component
   - SIP-vs-prepayment, gold-loan-emi, tax-benefit, etc.

3. **Blog posts** — `/blog/[slug]/`
   - MDX in `content/blog/`, dynamically routed
   - `InlineShareRow` at footer (visible 5-platform share)

All metadata MUST go through `buildMetadata()` from `lib/seo/metadata.ts`.
Don't write `export const metadata = {…}` inline — you'll lose canonical,
OG, Twitter, robots, etc.

Schema components live in `components/seo/JsonLd.tsx`. Pages emit JSON-LD
either via these components or via `<script type="application/ld+json">` with
generators from `lib/seo/schema.ts`.

---

## DASHBOARD ARCHITECTURE

Located under `app/dashboard/`. Auth-guarded by the layout.

- **Data flow:** tRPC `loans.list` / `loans.create` / `partPayments.log`
  via `useQuery` / `useMutation` hooks. Never `fetch`.
- **State:** server state lives in TanStack Query cache. Local UI state
  (modals, drawers) uses `useState`. Zustand is only for cross-page client
  state, never for fetched data.
- **Free plan limits** enforced server-side in tRPC procedures: max 2
  loans, max 5 part-payment logs.
- **Pro features** wrapped client-side with `<ProGate feature="…">`.

### Floating-rate loan lifecycle (added May 2026)

Three interconnected features for keeping dashboard loans honest:

1. **EMI Verifier** (`components/dashboard/EmiVerifier.tsx`) — on the
   new-loan form, compares the user's actual bank EMI against the
   mathematically computed EMI. Uses `calculateEffectiveRate()` (bisection
   solver in `lib/calculations/loanCalcs.ts`) to back-solve the hidden
   spread banks bake in via day-count conventions. Offers to adopt the
   effective rate.

2. **Refresh from Statement** (`components/dashboard/RefreshFromStatementModal.tsx`)
   — modal on loan detail page. User enters the three numbers from their
   latest bank statement (outstanding, EMI, date). Single tRPC mutation
   `loans.refreshFromStatement` updates the loan and stamps
   `outstanding_as_of` as the anchor date for forward projections.

3. **Rate History Timeline** (`components/dashboard/RateHistoryTimeline.tsx`)
   — visualizes every interest-rate revision on a loan. Backed by
   `loan_rate_history` table and `loanRateHistory` tRPC router. Critical
   for floating-rate loans that change every time RBI moves the repo rate.

**DB migration:** `drizzle/migrations/2026-05-03-rate-history-and-anchors.sql`
adds the `loan_rate_history` table and `outstanding_as_of` column to `loans`.
Run it on Supabase before these features go live.

---

## SMART INSIGHT CALLOUT PATTERN

`features/loan-calculator/components/LoanSummary.tsx` renders a gradient
callout when `result.totalInterest > 500000` and the user has not yet
simulated. This is the single highest-conversion element on the homepage.
Don't remove it. Don't downgrade it to a muted strip. If you change copy,
keep the savings numbers (`₹12L+` / `2+ years`) bold and the "Simulate it"
CTA as a button, not a text link.

---

## BLOG AUTOMATION (CURRENTLY PAUSED)

The autonomous pipeline (Gemini topic discovery → article generation →
quality gate → image gen → internal-linker → distributor) is intact but
paused. See `BLOG_AUTOMATION.md` and `.github/workflows/blog-daily.yml`
(schedule commented out, `workflow_dispatch` retained).

Re-enable: uncomment the cron line in the workflow.
Manual run: GitHub Actions → "LastEMI Daily Blog Engine" → Run workflow.

The queue at `data/blog-queue.json` has 23 topics. The Gemini client at
`scripts/blog/lib/llm.ts` retries on 5xx/429 with exponential backoff and
throws `TransientLLMError` on exhaustion; the scheduler soft-fails on
transient errors so CI doesn't go red on Gemini outages.

---

## GRAPHIFY KNOWLEDGE GRAPH

A persistent code graph lives at `graphify-out/` (gitignored).

- **Before architecture or codebase questions:** read `GRAPH_REPORT.md` for
  god nodes and community structure.
- **Before wide searches:** check the graph; the Grep/Glob hook will remind
  you.
- **After significant code changes:** the post-commit hook auto-rebuilds
  the AST portion. For doc/MDX changes, run `/graphify --update`.

The graph captured 621 nodes and 523 edges across 208 communities. Top
communities: Core Loan Calculations, Blog Automation Pipeline, SEO Schema
Generators, tRPC Migration & Architecture, Dashboard Pages.

---

## WHAT NEVER TO DO

1. **No `pages/` directory.** App Router only.
2. **No raw fetch from client to `/api/*`.** tRPC only (exceptions: NextAuth, Razorpay webhook).
3. **No password auth.** Google OAuth + Resend magic link only.
4. **No phone-number capture.** Ever. This is the brand promise.
5. **No DSA/lead-gen funnels.** Zero affiliate links outside of triggered
   conditions in `lib/affiliates/config.ts`.
6. **No calculations inside React components.** Pure functions in `/lib/calculations/`.
7. **No skipping auth in tRPC procedures.** Use the `protectedProcedure`
   pattern in `server/trpc.ts`.
8. **No `any`, no `as Type` on tRPC outputs.** Types are inferred end-to-end.
9. **No `prepaymentPenalty > 0` when `rateType === 'floating'`.** RBI-mandated
   zero-penalty rule. Enforced in schema validation.
10. **No raw color classes.** Use design tokens (`bg-card`, `text-foreground`, etc.).
11. **No bypassing the build.** `npx tsc --noEmit` must be clean before commit.
12. **No removing the smart-insight callout.** It's the conversion engine.
13. **No editing autonomous blog scripts mid-run.** They write to disk; race conditions are real.

---

## BUSINESS RULES — ENFORCE IN CODE

### Free plan limits (enforced in tRPC procedures)
- Max 2 active loans
- Max 5 part-payment logs

### Pro features (gated by `ProGate` component + server check)
- Payoff Planner, Consolidation Analyzer, Tax Dashboard, PDF Export,
  Email Alerts, Unlimited loans, Unlimited part payments

### RBI rules
- Floating-rate loans always have `prepaymentPenalty = 0`. Validated in
  Zod schema and Drizzle schema defaults.

### Affiliate rules — only show when:
- Balance transfer: net saving > ₹50,000 after all fees
- Credit card debt: outstanding > ₹50,000
- Consolidation: verdict === 'BENEFICIAL' && netSaving > ₹25,000
- New home loan: rate-comparison CTA only (no phone capture)

### Consolidation verdict thresholds
```ts
netSaving > 10_000  → 'BENEFICIAL'
netSaving > 0       → 'MARGINAL'
otherwise           → 'NOT_RECOMMENDED'
```
Show affiliate only if `verdict === 'BENEFICIAL' && netSaving > 25_000`.

---

## CURRENT FOCUS

Phases 1–4 are complete. The site is live, indexed, has 22+ blog posts,
11 new programmatic SEO landing pages (April 2026), and is generating
traffic. Active priorities:

- **Floating-rate lifecycle** — EMI verifier, rate history, statement
  refresh are built but need the DB migration run on Supabase and
  end-to-end testing in the live dashboard
- **Dashboard polish** — UI refinement, empty states, error states
- **Conversion** — the funnel from calculator to dashboard sign-up
- **Authority building** — backlinks, brand mentions, social presence
  (off-site work, not code)
- **Audit cleanup** — keyword density, W3C HTML validation, perf

The autonomous blog generator is **paused** by design until the audit
score and on-page work are settled.
