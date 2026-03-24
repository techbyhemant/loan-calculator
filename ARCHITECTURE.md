# ARCHITECTURE.md — EMIPartPay Code Standards
# Place at root of project alongside CLAUDE.md
# Claude Code reads both files automatically.
# This file defines architecture rules that override anything more generic.

---

## 1. API LAYER — tRPC ONLY

**We use tRPC v11 for ALL client-server communication.**
**Raw `fetch('/api/...')` calls from client components are FORBIDDEN.**
**Raw Next.js API routes for data fetching are FORBIDDEN.**

The only exceptions where raw API routes are allowed:
- `app/api/auth/[...nextauth]/route.ts` — NextAuth requires this
- `app/api/payments/webhook/route.ts` — Razorpay webhook requires raw HTTP

Everything else goes through tRPC.

### Why tRPC
- Types are automatically shared between server and client — zero manual type duplication
- No `as SomeType` casting on API responses
- Autocomplete works on all API calls in the IDE
- Input validation with Zod is built in
- If you rename a procedure, TypeScript catches every broken call site immediately

---

## 2. tRPC SETUP — EXACT FILES AND PATTERNS

### Package requirements
```bash
npm install @trpc/server @trpc/client @trpc/react-query @trpc/next \
  @tanstack/react-query zod superjson
```

### File structure for tRPC
```
server/
├── trpc.ts               ← tRPC instance, context, middleware
├── routers/
│   ├── _app.ts           ← Root router — imports all sub-routers
│   ├── loans.ts          ← Loan CRUD procedures
│   ├── partPayments.ts   ← Part payment procedures
│   ├── user.ts           ← User profile procedures
│   └── payments.ts       ← Razorpay subscription procedures

app/
├── api/
│   └── trpc/
│       └── [trpc]/
│           └── route.ts  ← tRPC HTTP adapter

lib/
└── trpc/
    ├── client.ts         ← tRPC client (for RSC and server actions)
    ├── provider.tsx      ← QueryClientProvider + tRPC provider
    └── hooks.ts          ← Re-export of trpc react hooks
```

### `server/trpc.ts` — tRPC instance
```typescript
import { initTRPC, TRPCError } from '@trpc/server'
import { auth } from '@/lib/auth'
import superjson from 'superjson'
import { ZodError } from 'zod'

// Context shape
export interface Context {
  userId: string | null
  userPlan: 'free' | 'pro'
}

// Create context for each request
export async function createContext(): Promise<Context> {
  const session = await auth()
  return {
    userId: session?.user?.id ?? null,
    userPlan: ((session?.user as { plan?: string })?.plan ?? 'free') as 'free' | 'pro',
  }
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
    },
  }),
})

// Base router and procedure
export const router = t.router
export const publicProcedure = t.procedure

// Protected procedure — throws if not logged in
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } })
})

// Pro procedure — throws if not on Pro plan
export const proProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  if (ctx.userPlan !== 'pro') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'This feature requires a Pro plan. Upgrade at /pricing.',
    })
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } })
})
```

### `server/routers/_app.ts` — root router
```typescript
import { router } from '@/server/trpc'
import { loansRouter } from './loans'
import { partPaymentsRouter } from './partPayments'
import { userRouter } from './user'
import { paymentsRouter } from './payments'

export const appRouter = router({
  loans: loansRouter,
  partPayments: partPaymentsRouter,
  user: userRouter,
  payments: paymentsRouter,
})

// Export type — this is what the client uses for autocomplete
export type AppRouter = typeof appRouter
```

### `server/routers/loans.ts` — example router
```typescript
import { z } from 'zod'
import { router, protectedProcedure } from '@/server/trpc'
import { TRPCError } from '@trpc/server'
import dbConnect from '@/lib/mongodb'
import { LoanModel } from '@/lib/models/Loan'
import { FREE_LIMITS } from '@/lib/utils/planGating'
import { calculatePartPaymentImpact } from '@/lib/calculations/loanCalcs'
import { LoanInputSchema } from '@/lib/validators/loanSchema'

export const loansRouter = router({
  // GET all loans for current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    await dbConnect()
    const loans = await LoanModel
      .find({ userId: ctx.userId, isActive: true })
      .sort({ createdAt: -1 })
      .lean()
    return loans
  }),

  // GET single loan by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      await dbConnect()
      const loan = await LoanModel.findOne({
        _id: input.id,
        userId: ctx.userId,
      }).lean()
      if (!loan) throw new TRPCError({ code: 'NOT_FOUND' })
      return loan
    }),

  // CREATE new loan
  create: protectedProcedure
    .input(LoanInputSchema)
    .mutation(async ({ ctx, input }) => {
      await dbConnect()

      // Free plan limit
      if (ctx.userPlan === 'free') {
        const count = await LoanModel.countDocuments({
          userId: ctx.userId,
          isActive: true,
        })
        if (count >= FREE_LIMITS.maxLoans) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: `Free plan allows max ${FREE_LIMITS.maxLoans} loans. Upgrade to Pro.`,
          })
        }
      }

      // RBI rule: floating rate loans have 0 prepayment penalty
      const prepaymentPenalty = input.rateType === 'floating' ? 0 : input.prepaymentPenalty

      const loan = await LoanModel.create({
        ...input,
        prepaymentPenalty,
        userId: ctx.userId,
      })
      return loan
    }),

  // UPDATE loan
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: LoanInputSchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      await dbConnect()
      const loan = await LoanModel.findOneAndUpdate(
        { _id: input.id, userId: ctx.userId },
        { ...input.data, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).lean()
      if (!loan) throw new TRPCError({ code: 'NOT_FOUND' })
      return loan
    }),

  // DELETE loan (soft delete)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await dbConnect()
      await LoanModel.findOneAndUpdate(
        { _id: input.id, userId: ctx.userId },
        { isActive: false }
      )
      return { success: true }
    }),
})
```

### `app/api/trpc/[trpc]/route.ts` — HTTP adapter
```typescript
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/server/routers/_app'
import { createContext } from '@/server/trpc'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
  })

export { handler as GET, handler as POST }
```

### `lib/trpc/client.ts` — tRPC client
```typescript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import { type AppRouter } from '@/server/routers/_app'

export const trpc = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/trpc`,
    }),
  ],
})
```

### `lib/trpc/hooks.ts` — React hooks for client components
```typescript
import { createTRPCReact } from '@trpc/react-query'
import { type AppRouter } from '@/server/routers/_app'

export const trpcReact = createTRPCReact<AppRouter>()
```

### `lib/trpc/provider.tsx` — wrap dashboard layout with this
```typescript
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { useState } from 'react'
import superjson from 'superjson'
import { trpcReact } from './hooks'

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000 } },
  }))
  const [trpcClient] = useState(() =>
    trpcReact.createClient({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/trpc`,
        }),
      ],
    })
  )

  return (
    <trpcReact.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpcReact.Provider>
  )
}
```

### How to call tRPC from client components
```typescript
// In a 'use client' component
import { trpcReact } from '@/lib/trpc/hooks'

export function LoanList() {
  // Type-safe, auto-complete, no manual type casting
  const { data, isLoading, error } = trpcReact.loans.getAll.useQuery()

  const createLoan = trpcReact.loans.create.useMutation({
    onSuccess: () => {
      // invalidate and refetch
      utils.loans.getAll.invalidate()
    }
  })

  return (...)
}
```

### How to call tRPC from Server Components (RSC)
```typescript
// In a server component (no 'use client')
import { trpc } from '@/lib/trpc/client'

export default async function DashboardPage() {
  // Direct call, no hooks needed in RSC
  const loans = await trpc.loans.getAll.query()
  return (...)
}
```

### Zod validators — single source of truth for input validation
```typescript
// lib/validators/loanSchema.ts
import { z } from 'zod'

export const LoanInputSchema = z.object({
  name: z.string().min(1, 'Loan name is required').max(100),
  type: z.enum(['home', 'car', 'personal', 'gold', 'education', 'credit_card', 'other']),
  lender: z.string().max(100).default(''),
  originalAmount: z.number().positive('Amount must be positive'),
  currentOutstanding: z.number().min(0),
  interestRate: z.number().min(0).max(100),
  emiAmount: z.number().min(0),
  emiDate: z.number().int().min(1).max(28).default(1),
  startDate: z.string().datetime(),
  tenureMonths: z.number().int().positive(),
  rateType: z.enum(['fixed', 'floating']).default('floating'),
  prepaymentPenalty: z.number().min(0).max(10).default(0),
  notes: z.string().max(500).optional(),
})

export const PartPaymentInputSchema = z.object({
  loanId: z.string().min(1),
  amount: z.number().positive('Amount must be positive'),
  date: z.string().datetime(),
  reduceType: z.enum(['emi', 'tenure']),
  note: z.string().max(200).optional(),
})

// These types are DERIVED from Zod schemas — no manual duplication
export type LoanInput = z.infer<typeof LoanInputSchema>
export type PartPaymentInput = z.infer<typeof PartPaymentInputSchema>
```

**Important:** The `LoanInput` and `PartPaymentInput` types in `types/index.ts`
should be replaced with re-exports from the validator schemas:
```typescript
// types/index.ts — only import, never re-declare
export type { LoanInput, PartPaymentInput } from '@/lib/validators/loanSchema'
```

---

## 3. REMOVE ZUSTAND — USE TRPC REACT QUERY INSTEAD

**Zustand is no longer needed for server state.**
tRPC + React Query handles server state with caching, invalidation, and loading states built in.

**Zustand use cases that remain valid:**
- Pure UI state (e.g. sidebar open/closed, modal visibility)
- Multi-step form state that doesn't touch the server

**Delete `lib/store/dashboardStore.ts`.**
Replace all `useDashboardStore()` calls with `trpcReact.loans.getAll.useQuery()` etc.

```typescript
// BEFORE (Zustand) — DELETE THIS PATTERN
const { loans, fetchLoans } = useDashboardStore()
useEffect(() => { fetchLoans() }, [])

// AFTER (tRPC React Query) — USE THIS PATTERN
const { data: loans, isLoading } = trpcReact.loans.getAll.useQuery()
```

---

## 4. DRY PRINCIPLES — EXACT RULES

### Rule 1: One type, one place
- All shared types → `types/index.ts`
- All Zod input schemas → `lib/validators/`
- Types derived from Zod schemas are re-exported, never redeclared
- Never define the same interface in two files

### Rule 2: One component, many uses
Before creating a new component, search existing ones:
```
components/ui/       ← Generic primitives (Button, Input, Select, Modal, Badge)
components/calculators/ ← Calculator-specific UI
components/dashboard/   ← Dashboard-specific UI
```
If a similar component exists, extend it with props rather than creating a new one.

**Specific reuse rules:**
- Need a button? Use `components/ui/Button.tsx` — add a `variant` prop if needed
- Need an input? Use `components/ui/Input.tsx`
- Need to show a ₹ amount? Use `formatINR()` or `formatLakhs()` — never `.toLocaleString()` directly
- Need a loading state? Use the same skeleton pattern used elsewhere — don't create a new one
- Need to gate a Pro feature? Use `<ProGate feature="...">` — never write inline plan checks in UI

### Rule 3: One calculation, one place
All financial math → `lib/calculations/` as pure functions.
If you need the same calculation in two components, it means it belongs in `lib/calculations/`, not in either component.

### Rule 4: One API call, one router procedure
Never call the same data from two different tRPC procedures.
If two components need the same data, they both call the same procedure — React Query deduplicates the network request automatically.

### Rule 5: No magic numbers
```typescript
// WRONG
if (loans.length >= 2) { ... }
if (partPayments.length >= 5) { ... }

// RIGHT — import from the single source of truth
import { FREE_LIMITS } from '@/lib/utils/planGating'
if (loans.length >= FREE_LIMITS.maxLoans) { ... }
```

### Rule 6: No hardcoded strings for loan types, plan names, etc.
```typescript
// WRONG
if (loan.type === 'home') { ... }
if (user.plan === 'pro') { ... }

// RIGHT — use the types
import { LoanType, UserPlan } from '@/types'
const HOME_LOAN_TYPES: LoanType[] = ['home']
const isPro = (plan: UserPlan) => plan === 'pro'
```

---

## 5. COMPONENT ARCHITECTURE — EXACT HIERARCHY

```
Page (app/...page.tsx)
  └── Composed from feature components
        └── Feature components (components/dashboard/, components/calculators/)
              └── Composed from UI primitives (components/ui/)
                    └── Uses utility functions (lib/utils/)
                    └── Calls tRPC hooks (lib/trpc/hooks.ts)
                    └── Uses calculation engine (lib/calculations/)
```

### What each layer is responsible for

**`app/...page.tsx` — Pages**
- Layout and composition only
- Server components by default (no 'use client')
- Can prefetch tRPC data for RSC hydration
- No business logic
- No inline styles or Tailwind beyond layout

**`components/dashboard/` and `components/calculators/` — Feature components**
- 'use client' only when they need interactivity or hooks
- Contain the actual UI for a feature
- Call tRPC hooks for data
- Use UI primitives for rendering
- No direct MongoDB/DB calls ever

**`components/ui/` — UI primitives**
- Always reusable, never feature-specific
- Props-driven, no hardcoded content
- No tRPC calls
- No business logic
- Pure presentation

**`lib/calculations/` — Calculation engine**
- Pure TypeScript functions only
- No React, no async, no side effects
- Imported by both server (tRPC procedures) and client (calculator components)

---

## 6. STANDARD UI COMPONENTS — USE THESE, DON'T RECREATE

### MANDATORY RULE: All calculators MUST use shared components

Every calculator in `components/calculators/` MUST import from `components/calculators/shared.tsx`.
NEVER use raw HTML `<button>`, `<div className="rounded-xl shadow-sm">`, or inline Tailwind for:
- Cards → use `CalcSection`, `CalcCard`, `StatCard`, `TableCard` (wrap shadcn Card)
- Buttons → use shadcn `Button` or `ToggleGroup` from shared.tsx
- Labels → use `Label` from shared.tsx
- Input class → use `CALC_INPUT_CLASS` from shared.tsx (matches shadcn Input tokens)
- Verdicts → use `Verdict` from shared.tsx
- Callouts → use `Callout` from shared.tsx

This ensures: if you change the Card or Button theme, ALL calculators update automatically.

```typescript
// ✅ CORRECT — import from shared.tsx
import { CalcSection, StatCard, ToggleGroup, Label, CALC_INPUT_CLASS } from "./shared";
import { Button } from "@/components/ui/button";

// ❌ WRONG — never do this in calculators
<div className="bg-white border rounded-xl shadow-sm p-4">  // use CalcCard instead
<button className="bg-blue-600 text-white px-4 py-2">       // use Button instead
```

### Button
```typescript
// components/ui/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'pro'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}
```

### Input
```typescript
// components/ui/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  prefix?: string   // e.g. "₹" or "%"
  suffix?: string
  hint?: string
}
```

### StatCard (dashboard)
```typescript
// components/dashboard/StatCard.tsx
interface StatCardProps {
  label: string
  value: string
  subValue?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: string
}
```

### LoanCard (dashboard)
```typescript
// components/dashboard/LoanCard.tsx
interface LoanCardProps {
  loan: Loan
  onViewDetails: (loanId: string) => void
}
```

**Rule:** If you need a component that is 80%+ similar to one of these, add a prop to the existing one rather than creating a new component.

---

## 7. ERROR HANDLING — CONSISTENT PATTERN

### In tRPC procedures (server-side)
```typescript
import { TRPCError } from '@trpc/server'

// Use the appropriate code:
throw new TRPCError({ code: 'UNAUTHORIZED' })          // not logged in
throw new TRPCError({ code: 'FORBIDDEN', message: '...' }) // logged in but no access
throw new TRPCError({ code: 'NOT_FOUND' })              // resource doesn't exist
throw new TRPCError({ code: 'BAD_REQUEST', message: '...' }) // invalid input
throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })  // unexpected error
```

### In client components
```typescript
const mutation = trpcReact.loans.create.useMutation({
  onError: (error) => {
    // error.message is always a string, already formatted by tRPC
    toast.error(error.message)
  },
  onSuccess: () => {
    toast.success('Loan added successfully')
    utils.loans.getAll.invalidate()
  }
})
```

### Never use try-catch in client components for tRPC calls
tRPC handles error propagation. Use `onError` callback instead.

---

## 8. FOLDER NAMING CONVENTIONS

```
kebab-case    for all folders and files: home-loan-eligibility/
PascalCase    for React components: LoanCard.tsx
camelCase     for utility functions and non-component files: loanCalcs.ts
SCREAMING_SNAKE for constants: FREE_LIMITS, MAX_LOAN_AMOUNT
```

---

## 9. IMPORT ORDER CONVENTION

Always in this order, with blank lines between groups:
```typescript
// 1. React and Next.js
import { useState, useEffect } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// 2. Third-party packages
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

// 3. Internal — types
import { Loan, UserPlan } from '@/types'

// 4. Internal — lib (calculations, utils, validators)
import { calculateEMI } from '@/lib/calculations/loanCalcs'
import { formatINR } from '@/lib/utils/formatters'

// 5. Internal — server (tRPC, models, db)
import { protectedProcedure } from '@/server/trpc'
import { LoanModel } from '@/lib/models/Loan'

// 6. Internal — components
import { Button } from '@/components/ui/Button'
import { LoanCard } from '@/components/dashboard/LoanCard'

// 7. Styles (if any)
import styles from './Component.module.css'
```

---

## 10. WHAT NEVER TO DO — ARCHITECTURE SPECIFIC

1. **No raw fetch('/api/...') from client components** — use tRPC hooks
2. **No manual `Response.json()` for data routes** — use tRPC procedures
3. **No duplicate type definitions** — derive from Zod schemas or import from `types/index.ts`
4. **No `as SomeType` casting on API responses** — tRPC guarantees types
5. **No business logic in pages (`app/...page.tsx`)** — belongs in components or tRPC procedures
6. **No DB calls from client components** — only via tRPC procedures
7. **No `useEffect` for initial data fetching** — use `trpcReact.x.y.useQuery()`
8. **No creating a new UI component if one exists** — extend with props
9. **No inline plan checks** — use `<ProGate>` or `proProcedure` in tRPC
10. **No magic numbers** — use named constants from `lib/utils/planGating.ts`
11. **No `console.log` in production code** — use `console.error` only in catch blocks
