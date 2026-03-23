# CLAUDE.md — EMIPartPay

# This file is read automatically by Claude Code at session start.

# It is the single source of truth. Never contradict it.

---

## WHAT THIS PROJECT IS

**emipartpay.com** — India's first honest debt freedom platform. Users track all their loans, see their exact debt-free date, and get honest math-backed guidance to become debt-free faster.

**The gap:** No Indian app offers debt payoff strategies (snowball/avalanche), floating rate recalculation tied to RBI repo rate, or honest consolidation analysis. This space is completely unoccupied.

**Acquisition funnel:** SEO calculator pages → Free dashboard (register) → Pro plan (pay ₹299/month)

---

## HOW CLAUDE CODE MUST BEHAVE IN THIS PROJECT

- **Always read this file fully before writing any code**
- **Never use the Pages Router** — App Router only, always
- **Never create a file without checking the folder structure in Section 4 first**
- **Never write a calculation inside a React component** — all logic goes in `/lib/calculations/`
- **Never write `any` in TypeScript** — use types from `types/index.ts`
- **Always run `npm run build` mentally before suggesting code** — no build errors
- **When in doubt about a pattern, follow the existing examples in Sections 6, 7, 8**
- **Mobile first** — every component works at 375px
- **After completing any task, update the checkbox in Section 14**

---

## TECH STACK — EXACT VERSIONS

```
Next.js         14 with App Router
TypeScript      strict: true
Tailwind CSS    v3
MongoDB         Atlas via Mongoose
NextAuth.js     v5 (next-auth@beta)
Zustand         v4
Recharts        v2
Razorpay        razorpay npm + client JS SDK
Resend          resend npm SDK
```

**Package manager:** npm
**Node:** 18+
**Deploy:** Vercel

**Key installed packages (reference before suggesting installs):**

```json
{
  "next": "14.x",
  "react": "18.x",
  "typescript": "5.x",
  "mongoose": "^8.x",
  "next-auth": "beta",
  "zustand": "^4.x",
  "recharts": "^2.x",
  "resend": "^3.x",
  "razorpay": "^2.x",
  "@auth/mongodb-adapter": "^3.x",
  "mongodb": "^6.x"
}
```

---

## ENVIRONMENT VARIABLES

All live in `.env.local`. Reference these exact names everywhere.

```env
MONGODB_URI=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
RESEND_API_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_PLAN_ID=
RAZORPAY_WEBHOOK_SECRET=
BANKBAZAAR_HOME_LOAN_URL=
BANKBAZAAR_PERSONAL_LOAN_URL=
PAISABAZAAR_URL=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
GROQ_API_KEY=
REPLICATE_API_TOKEN=          # Get at replicate.com/account/api-tokens
NEXT_PUBLIC_GA_ID=           # Google Analytics 4 (G-XXXXXXXXXX)
```

**Rule:** Only `NEXT_PUBLIC_*` vars are accessible client-side. Never expose secret keys to the browser.

---

## REPOSITORY STRUCTURE — COMPLETE TARGET

```
emipartpay/
├── CLAUDE.md
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
│
├── types/
│   └── index.ts                      ← ALL shared TypeScript interfaces live here
│
├── app/
│   ├── layout.tsx                    ← Root layout + global metadata
│   ├── page.tsx                      ← Homepage: EMI Part Payment Calculator
│   ├── sitemap.ts                    ← Dynamic sitemap — update on every new page
│   ├── robots.ts                     ← robots.txt
│   ├── globals.css                   ← Tailwind directives only
│   │
│   ├── calculators/
│   │   ├── sip-vs-prepayment/
│   │   │   └── page.tsx
│   │   ├── home-loan-eligibility/
│   │   │   └── page.tsx
│   │   ├── tax-benefit/
│   │   │   └── page.tsx
│   │   ├── rent-vs-buy/
│   │   │   └── page.tsx
│   │   ├── balance-transfer/
│   │   │   └── page.tsx
│   │   └── salary-to-emi/
│   │       └── page.tsx
│   │
│   ├── blog/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   │
│   ├── rbi-rates/
│   │   └── page.tsx
│   │
│   ├── login/
│   │   └── page.tsx
│   ├── pricing/
│   │   └── page.tsx
│   ├── privacy/
│   │   └── page.tsx
│   │
│   ├── dashboard/
│   │   ├── layout.tsx                ← Auth guard + sidebar
│   │   ├── page.tsx                  ← Overview: 4 stats + loan cards
│   │   ├── loans/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [loanId]/
│   │   │       └── page.tsx
│   │   ├── planner/
│   │   │   └── page.tsx
│   │   ├── consolidation/
│   │   │   └── page.tsx
│   │   └── tax/
│   │       └── page.tsx
│   │
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts
│       ├── loans/
│       │   ├── route.ts
│       │   └── [loanId]/
│       │       └── route.ts
│       ├── part-payments/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── user/
│       │   └── route.ts
│       └── payments/
│           ├── create-subscription/
│           │   └── route.ts
│           └── webhook/
│               └── route.ts
│
├── components/
│   ├── calculators/
│   │   ├── EmiCalculator.tsx         ← EXISTING — do not break this
│   │   ├── AmortizationTable.tsx     ← EXISTING — reuse everywhere
│   │   ├── SipVsPrepaymentCalc.tsx
│   │   ├── EligibilityCalc.tsx
│   │   └── TaxBenefitCalc.tsx
│   │
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   ├── LoanCard.tsx
│   │   ├── StatCard.tsx
│   │   ├── LoanForm.tsx
│   │   ├── PartPaymentLogger.tsx
│   │   ├── AmortizationSection.tsx
│   │   └── PayoffPlannerTable.tsx
│   │
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Modal.tsx
│       ├── Toast.tsx
│       ├── Badge.tsx
│       └── ProGate.tsx
│
├── lib/
│   ├── mongodb.ts
│   ├── auth.ts
│   │
│   ├── models/
│   │   ├── User.ts
│   │   ├── Loan.ts
│   │   ├── PartPayment.ts
│   │   └── SavedCalc.ts
│   │
│   ├── calculations/
│   │   ├── loanCalcs.ts
│   │   ├── payoffStrategies.ts
│   │   ├── consolidationCalcs.ts
│   │   ├── taxCalcs.ts
│   │   └── sipVsPrepay.ts
│   │
│   ├── store/
│   │   └── dashboardStore.ts
│   │
│   ├── affiliates/
│   │   └── config.ts
│   │
│   ├── email/
│   │   └── alerts.ts
│   │
│   └── utils/
│       ├── planGating.ts
│       ├── formatters.ts
│       └── loanHelpers.ts
```

---

## TYPESCRIPT TYPES — SINGLE SOURCE OF TRUTH

**File: `types/index.ts`** — import everything from here. Never redeclare types inline.

```typescript
export type LoanType =
  | "home"
  | "car"
  | "personal"
  | "gold"
  | "education"
  | "credit_card"
  | "other";

export type RateType = "fixed" | "floating";
export type ReduceType = "emi" | "tenure";
export type UserPlan = "free" | "pro";
export type TaxRegime = "old" | "new";
export type ConsolidationVerdict =
  | "BENEFICIAL"
  | "MARGINAL"
  | "NOT_RECOMMENDED";

export interface Loan {
  _id: string;
  userId: string;
  name: string;
  type: LoanType;
  lender: string;
  originalAmount: number;
  currentOutstanding: number;
  interestRate: number; // annual %
  emiAmount: number;
  emiDate: number; // 1–31
  startDate: string; // ISO date string
  tenureMonths: number;
  rateType: RateType;
  prepaymentPenalty: number; // % — ALWAYS 0 for floating (RBI mandated)
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type LoanInput = Omit<
  Loan,
  "_id" | "userId" | "isActive" | "createdAt" | "updatedAt"
>;

export interface PartPayment {
  _id: string;
  userId: string;
  loanId: string;
  amount: number;
  date: string;
  reduceType: ReduceType;
  interestSaved: number;
  monthsReduced: number;
  note?: string;
  createdAt: string;
}

export type PartPaymentInput = Pick<
  PartPayment,
  "loanId" | "amount" | "date" | "reduceType" | "note"
>;

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  plan: UserPlan;
  planExpiry?: string;
}

export interface AmortizationRow {
  month: number;
  date: Date;
  emi: number;
  principal: number;
  interest: number;
  outstanding: number;
}

export interface PartPaymentResult {
  originalTotalInterest: number;
  newTotalInterest: number;
  interestSaved: number;
  originalDebtFreeDate: Date;
  newDebtFreeDate: Date;
  monthsReduced: number;
  newEMI?: number;
}

export interface AttackOrderItem {
  loanId: string;
  loanName: string;
  interestRate: number;
  priority: number;
  reason: string;
}

export interface PayoffResult {
  strategy: "avalanche" | "snowball" | "current";
  totalInterest: number;
  interestSaved: number;
  debtFreeDate: Date;
  monthsEarlier: number;
  attackOrder: AttackOrderItem[];
}

export interface StrategyComparison {
  current: PayoffResult;
  avalanche: PayoffResult;
  snowball: PayoffResult;
  recommended: "avalanche" | "snowball";
  interestDifference: number;
  monthsDifference: number;
  explanation: string;
}

export interface ConsolidationAnalysis {
  currentWeightedRate: number;
  proposedRate: number;
  currentTotalInterest: number;
  newTotalInterest: number;
  processingFee: number;
  prepaymentPenalties: number;
  netSaving: number;
  verdict: ConsolidationVerdict;
  breakEvenMonths: number;
  loansToConsolidate: string[];
  loansToKeep: string[];
  recommendation: string;
  showAffiliate: boolean;
}

export interface TaxProfile {
  grossIncome: number;
  taxRegime: TaxRegime;
  existing80CInvestments: number;
}

export interface TaxBenefit {
  sec24Deduction: number;
  sec80CDeduction: number;
  sec80EDeduction: number;
  totalDeduction: number;
  taxSaved: number;
  oldRegimeTaxSaved: number;
  newRegimeTaxSaved: number;
  recommendedRegime: TaxRegime;
  regimeDifference: number;
}

export interface SipVsPrepayParams {
  loanOutstanding: number;
  interestRate: number;
  remainingMonths: number;
  monthlyExtra: number;
  sipExpectedReturn: number;
  taxBracket: 10 | 20 | 30;
}

export interface SipVsPrepayResult {
  prepay: {
    interestSaved: number;
    taxBenefitLost: number;
    netBenefit: number;
    monthsReduced: number;
    newDebtFreeDate: Date;
  };
  sip: {
    corpus: number;
    gains: number;
    ltcgTax: number;
    netCorpus: number;
  };
  recommendation: "PREPAY" | "SIP" | "SPLIT";
  optimalSplit: { prepayPercent: number; sipPercent: number };
  explanation: string;
}

export interface DashboardStats {
  totalDebt: number;
  monthlyEmiTotal: number;
  totalInterestRemaining: number;
  debtFreeDate: Date | null;
  loanCount: number;
}
```

---

## MONGOOSE SCHEMAS — EXACT CODE

### `lib/mongodb.ts`

```typescript
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("MONGODB_URI not set in .env.local");

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const cached = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cached;

export default async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
```

### `lib/models/User.ts`

```typescript
import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, trim: true },
    image: { type: String },
    plan: { type: String, enum: ["free", "pro"], default: "free" },
    planExpiry: { type: Date },
    razorpayCustomerId: { type: String },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

export const UserModel =
  mongoose.models.User ?? mongoose.model("User", UserSchema);
```

### `lib/models/Loan.ts`

```typescript
import mongoose, { Schema } from "mongoose";

const LoanSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: [
        "home",
        "car",
        "personal",
        "gold",
        "education",
        "credit_card",
        "other",
      ],
      required: true,
    },
    lender: { type: String, trim: true, default: "" },
    originalAmount: { type: Number, required: true, min: 0 },
    currentOutstanding: { type: Number, required: true, min: 0 },
    interestRate: { type: Number, required: true, min: 0, max: 100 },
    emiAmount: { type: Number, required: true, min: 0 },
    emiDate: { type: Number, min: 1, max: 31, default: 1 },
    startDate: { type: Date, required: true },
    tenureMonths: { type: Number, required: true, min: 1 },
    rateType: {
      type: String,
      enum: ["fixed", "floating"],
      default: "floating",
    },
    prepaymentPenalty: { type: Number, default: 0, min: 0, max: 10 },
    isActive: { type: Boolean, default: true, index: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

export const LoanModel =
  mongoose.models.Loan ?? mongoose.model("Loan", LoanSchema);
```

### `lib/models/PartPayment.ts`

```typescript
import mongoose, { Schema } from "mongoose";

const PartPaymentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    loanId: {
      type: Schema.Types.ObjectId,
      ref: "Loan",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 1 },
    date: { type: Date, required: true },
    reduceType: { type: String, enum: ["emi", "tenure"], required: true },
    interestSaved: { type: Number, required: true, default: 0 },
    monthsReduced: { type: Number, required: true, default: 0 },
    note: { type: String, default: "" },
  },
  { timestamps: true },
);

export const PartPaymentModel =
  mongoose.models.PartPayment ??
  mongoose.model("PartPayment", PartPaymentSchema);
```

---

## NEXTAUTH v5 — EXACT CONFIG

### `lib/auth.ts`

```typescript
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
const clientPromise = client.connect();

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: "login@emipartpay.com",
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.plan = (user as { plan?: string }).plan ?? "free";
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user.id = token.id as string;
      (session.user as { plan?: string }).plan = token.plan as string;
      return session;
    },
  },
  pages: { signIn: "/login", error: "/login" },
});
```

### `app/api/auth/[...nextauth]/route.ts`

```typescript
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

### Auth guard pattern — use in every dashboard layout and page

```typescript
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const session = await auth();
if (!session) redirect("/login");
const userId = session.user.id as string;
const userPlan = (session.user as { plan?: string }).plan ?? "free";
```

---

## API ROUTE TEMPLATE — COPY THIS FOR EVERY ROUTE

```typescript
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { LoanModel } from "@/lib/models/Loan";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const loans = await LoanModel.find({
      userId: session.user.id,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .lean();
    return Response.json({ loans });
  } catch (err) {
    console.error("[GET /api/loans]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    await dbConnect();

    // Free plan limit check
    const userPlan = (session.user as { plan?: string }).plan ?? "free";
    if (userPlan === "free") {
      const count = await LoanModel.countDocuments({
        userId: session.user.id,
        isActive: true,
      });
      if (count >= 2) {
        return Response.json(
          {
            error:
              "Free plan allows max 2 loans. Upgrade to Pro for unlimited.",
          },
          { status: 403 },
        );
      }
    }

    const loan = await LoanModel.create({ ...body, userId: session.user.id });
    return Response.json({ loan }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/loans]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

---

## CALCULATION ENGINE — CORE IMPLEMENTATIONS

**Location: `/lib/calculations/loanCalcs.ts`**
Pure functions. No React. No async. No side effects.

```typescript
import {
  Loan,
  AmortizationRow,
  PartPaymentResult,
  DashboardStats,
  ReduceType,
} from "@/types";

export function calculateEMI(
  principal: number,
  annualRate: number,
  tenureMonths: number,
): number {
  if (annualRate === 0) return principal / tenureMonths;
  const r = annualRate / 12 / 100;
  return (
    (principal * r * Math.pow(1 + r, tenureMonths)) /
    (Math.pow(1 + r, tenureMonths) - 1)
  );
}

export function calculateAmortization(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  startDate: Date,
): AmortizationRow[] {
  const r = annualRate / 12 / 100;
  const emi = calculateEMI(principal, annualRate, tenureMonths);
  const rows: AmortizationRow[] = [];
  let outstanding = principal;
  const date = new Date(startDate);

  for (let month = 1; month <= tenureMonths; month++) {
    const interest = outstanding * r;
    const principalPaid = Math.min(emi - interest, outstanding);
    outstanding = Math.max(0, outstanding - principalPaid);

    rows.push({
      month,
      date: new Date(date),
      emi,
      principal: principalPaid,
      interest,
      outstanding,
    });
    date.setMonth(date.getMonth() + 1);
    if (outstanding <= 0.01) break;
  }

  return rows;
}

export function calculateRemainingInterest(loan: Loan): number {
  const rows = calculateAmortization(
    loan.currentOutstanding,
    loan.interestRate,
    loan.tenureMonths,
    new Date(loan.startDate),
  );
  return rows.reduce((sum, r) => sum + r.interest, 0);
}

export function calculateDebtFreeDate(loans: Loan[]): Date | null {
  const active = loans.filter((l) => l.isActive);
  if (!active.length) return null;
  return active
    .map((l) => {
      const rows = calculateAmortization(
        l.currentOutstanding,
        l.interestRate,
        l.tenureMonths,
        new Date(l.startDate),
      );
      return rows[rows.length - 1].date;
    })
    .reduce((latest, d) => (d > latest ? d : latest));
}

export function calculateWeightedAverageRate(loans: Loan[]): number {
  const total = loans.reduce((s, l) => s + l.currentOutstanding, 0);
  if (total === 0) return 0;
  return loans.reduce(
    (w, l) => w + (l.interestRate * l.currentOutstanding) / total,
    0,
  );
}

export function calculateDashboardStats(loans: Loan[]): DashboardStats {
  const active = loans.filter((l) => l.isActive);
  return {
    totalDebt: active.reduce((s, l) => s + l.currentOutstanding, 0),
    monthlyEmiTotal: active.reduce((s, l) => s + l.emiAmount, 0),
    totalInterestRemaining: active.reduce(
      (s, l) => s + calculateRemainingInterest(l),
      0,
    ),
    debtFreeDate: calculateDebtFreeDate(active),
    loanCount: active.length,
  };
}

export function calculatePartPaymentImpact(
  loan: Loan,
  partPaymentAmount: number,
  reduceType: ReduceType,
): PartPaymentResult {
  const original = calculateAmortization(
    loan.currentOutstanding,
    loan.interestRate,
    loan.tenureMonths,
    new Date(loan.startDate),
  );
  const originalTotalInterest = original.reduce((s, r) => s + r.interest, 0);
  const originalDebtFreeDate = original[original.length - 1].date;

  const newPrincipal = Math.max(0, loan.currentOutstanding - partPaymentAmount);
  const r = loan.interestRate / 12 / 100;

  if (reduceType === "tenure") {
    const newTenure =
      r === 0
        ? Math.ceil(newPrincipal / loan.emiAmount)
        : Math.ceil(
            Math.log(loan.emiAmount / (loan.emiAmount - newPrincipal * r)) /
              Math.log(1 + r),
          );
    const newSchedule = calculateAmortization(
      newPrincipal,
      loan.interestRate,
      newTenure,
      new Date(loan.startDate),
    );
    const newTotalInterest = newSchedule.reduce((s, r) => s + r.interest, 0);
    return {
      originalTotalInterest,
      newTotalInterest,
      interestSaved: Math.max(0, originalTotalInterest - newTotalInterest),
      originalDebtFreeDate,
      newDebtFreeDate: newSchedule[newSchedule.length - 1].date,
      monthsReduced: Math.max(0, original.length - newSchedule.length),
    };
  } else {
    const newEMI = calculateEMI(
      newPrincipal,
      loan.interestRate,
      loan.tenureMonths,
    );
    const newSchedule = calculateAmortization(
      newPrincipal,
      loan.interestRate,
      loan.tenureMonths,
      new Date(loan.startDate),
    );
    const newTotalInterest = newSchedule.reduce((s, r) => s + r.interest, 0);
    return {
      originalTotalInterest,
      newTotalInterest,
      interestSaved: Math.max(0, originalTotalInterest - newTotalInterest),
      originalDebtFreeDate,
      newDebtFreeDate: newSchedule[newSchedule.length - 1].date,
      monthsReduced: 0,
      newEMI,
    };
  }
}
```

---

## ZUSTAND STORE

**`lib/store/dashboardStore.ts`**

```typescript
import { create } from "zustand";
import { Loan, LoanInput, DashboardStats } from "@/types";
import { calculateDashboardStats } from "@/lib/calculations/loanCalcs";

interface DashboardStore {
  loans: Loan[];
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  fetchLoans: () => Promise<void>;
  addLoan: (input: LoanInput) => Promise<void>;
  updateLoan: (id: string, data: Partial<LoanInput>) => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  loans: [],
  stats: null,
  isLoading: false,
  error: null,

  fetchLoans: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/loans");
      if (!res.ok) throw new Error("Failed to fetch");
      const { loans } = (await res.json()) as { loans: Loan[] };
      set({ loans, stats: calculateDashboardStats(loans), isLoading: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Unknown error",
        isLoading: false,
      });
    }
  },

  addLoan: async (input) => {
    const res = await fetch("/api/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const { error } = (await res.json()) as { error: string };
      throw new Error(error);
    }
    await get().fetchLoans();
  },

  updateLoan: async (id, data) => {
    await fetch(`/api/loans/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await get().fetchLoans();
  },

  deleteLoan: async (id) => {
    await fetch(`/api/loans/${id}`, { method: "DELETE" });
    await get().fetchLoans();
  },
}));
```

---

## SEO PATTERNS

### Every page MUST have its own metadata export

```typescript
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "[Primary Keyword] — [Secondary] | EMIPartPay",
  description: "[155 chars max]",
  keywords: ["keyword1", "keyword2"],
  metadataBase: new URL("https://emipartpay.com"),
  openGraph: {
    title: "[Short OG title]",
    url: "https://emipartpay.com/[path]",
    siteName: "EMIPartPay",
    locale: "en_IN",
    type: "website",
  },
  alternates: { canonical: "https://emipartpay.com/[path]" },
  robots: { index: true, follow: true },
};
```

### Keyword targets

```
/                                  → "part payment calculator"             8K/mo
/calculators/sip-vs-prepayment     → "sip vs home loan prepayment"         18K/mo
/calculators/home-loan-eligibility → "home loan eligibility calculator"    60K/mo
/calculators/tax-benefit           → "home loan tax benefit calculator"    22K/mo
/calculators/salary-to-emi         → "how much home loan on 1 lakh salary" 35K/mo
/rbi-rates                         → "RBI repo rate 2026"                  25K/mo
```

### `app/sitemap.ts` — add every new page immediately after creating it

```typescript
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://emipartpay.com";
  return [
    { url: base, lastModified: new Date(), priority: 1.0 },
    {
      url: `${base}/calculators/sip-vs-prepayment`,
      lastModified: new Date(),
      priority: 0.9,
    },
    {
      url: `${base}/calculators/home-loan-eligibility`,
      lastModified: new Date(),
      priority: 0.9,
    },
    {
      url: `${base}/calculators/tax-benefit`,
      lastModified: new Date(),
      priority: 0.8,
    },
    // Add new pages here
  ];
}
```

### `app/robots.ts`

```typescript
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: "https://emipartpay.com/sitemap.xml",
  };
}
```

---

## STYLING CONVENTIONS

- Tailwind only. No CSS modules. No inline `style={{}}` except chart dynamic colors.
- Mobile first. Design for 375px first, then larger screens.

| Purpose            | Classes                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------- |
| Primary button     | `bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium`     |
| Pro upgrade button | `bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 text-sm font-medium` |
| Success state      | `text-green-700 bg-green-50 border border-green-200 rounded-lg`                         |
| Warning state      | `text-amber-700 bg-amber-50 border border-amber-200 rounded-lg`                         |
| Danger state       | `text-red-700 bg-red-50 border border-red-200 rounded-lg`                               |
| Card               | `bg-white border border-gray-100 rounded-xl shadow-sm p-4`                              |
| Page background    | `bg-gray-50 min-h-screen`                                                               |
| Section heading    | `text-xl font-semibold text-gray-900`                                                   |

**Number formatting:** Always use `formatINR()` or `formatLakhs()` from `lib/utils/formatters.ts`.

**Loan type icons (text only, no icon library needed):**
`home` → 🏠 · `car` → 🚗 · `personal` → 💼 · `gold` → 🥇 · `education` → 🎓 · `credit_card` → 💳 · `other` → 📋

---

## UTILITY FUNCTIONS

### `lib/utils/formatters.ts`

```typescript
export const formatINR = (n: number): string =>
  "₹" + Math.round(n).toLocaleString("en-IN");

export const formatLakhs = (n: number): string => {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  return formatINR(n);
};

export const formatMonths = (months: number): string => {
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m} month${m !== 1 ? "s" : ""}`;
  if (m === 0) return `${y} yr${y > 1 ? "s" : ""}`;
  return `${y} yr${y > 1 ? "s" : ""} ${m} mo`;
};

export const formatDate = (d: Date | string): string =>
  new Date(d).toLocaleDateString("en-IN", { month: "short", year: "numeric" });

export const formatFinancialYear = (d: Date): string => {
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return month >= 4
    ? `FY ${year}–${String(year + 1).slice(2)}`
    : `FY ${year - 1}–${String(year).slice(2)}`;
};
```

### `lib/utils/planGating.ts`

```typescript
import { UserPlan } from "@/types";

export const FREE_LIMITS = {
  maxLoans: 2,
  maxPartPaymentLogs: 5,
} as const;

export type ProFeature =
  | "payoff-planner"
  | "consolidation-analyzer"
  | "tax-benefit-dashboard"
  | "pdf-export"
  | "email-alerts"
  | "unlimited-loans"
  | "unlimited-part-payments";

export const canAccess = (plan: UserPlan, feature: ProFeature): boolean =>
  plan === "pro";
```

---

## BUSINESS RULES — ENFORCE IN CODE

### Free Plan Limits

```
Max loans:              2     (enforced in POST /api/loans)
Max part payment logs:  5     (enforced in POST /api/part-payments)
Payoff Planner:         Pro only (wrap with ProGate component)
Consolidation:          Pro only (wrap with ProGate component)
Tax Dashboard:          Pro only (wrap with ProGate component)
PDF Export:             Pro only
Email Alerts:           Pro only
```

### Affiliate Trigger Rules — NEVER bypass these

```typescript
// lib/affiliates/config.ts
// Only show affiliate link when:
//   balanceTransfer → netSaving > 50_000 after all fees
//   creditCardDebt  → outstanding > 50_000
//   consolidation   → verdict === 'BENEFICIAL' && netSaving > 25_000
//   newHomeLoan     → always show rate comparison CTA (no phone capture)
```

### Consolidation Verdict

```typescript
const getVerdict = (netSaving: number): ConsolidationVerdict => {
  if (netSaving > 10_000) return "BENEFICIAL";
  if (netSaving > 0) return "MARGINAL";
  return "NOT_RECOMMENDED";
};

// showAffiliate only when:
const showAffiliate = verdict === "BENEFICIAL" && netSaving > 25_000;
```

### RBI Rule — Always enforce

```typescript
// Floating rate loans ALWAYS have 0 prepayment penalty (RBI mandated)
// Enforce in form validation, in model pre-save, everywhere
if (rateType === "floating") prepaymentPenalty = 0;
```

### ProGate component

```typescript
// components/ui/ProGate.tsx
'use client'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface ProGateProps {
  children: React.ReactNode
  feature: string
}

export function ProGate({ children, feature }: ProGateProps) {
  const { data: session } = useSession()
  const isPro = (session?.user as { plan?: string })?.plan === 'pro'
  if (isPro) return <>{children}</>
  return (
    <div className="rounded-xl border border-dashed border-purple-200 bg-purple-50 p-8 text-center">
      <p className="text-3xl mb-3">🔒</p>
      <h3 className="text-base font-semibold text-gray-800 mb-1">{feature} is a Pro feature</h3>
      <p className="text-sm text-gray-500 mb-4">Upgrade to Pro for ₹299/month</p>
      <Link href="/pricing"
        className="inline-flex px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors">
        Upgrade to Pro →
      </Link>
    </div>
  )
}
```

---

## WHAT NEVER TO DO

1. **No `pages/` directory** — App Router only
2. **No password auth** — Google OAuth + Email magic link (Resend) only
3. **No lead gen forms** — never capture phone numbers for bank/DSA leads
4. **No affiliate links outside trigger conditions** — check before every placement
5. **No calculations in React components** — belongs in `/lib/calculations/`
6. **No shared `metadata` between pages** — every page has unique metadata
7. **No skipping auth check in API routes** — every route starts with `const session = await auth()`
8. **No TypeScript `any`** — use proper types from `types/index.ts`
9. **No `prepaymentPenalty > 0` when `rateType === 'floating'`** — RBI rule
10. **No installing packages without verifying they're not already installed**
11. **No building DSA/B2B features** — that is Month 18+, not now

---

## BUILD STATUS — CHECK OFF AS TASKS COMPLETE

### Phase 1 — SEO Foundation (Week 1–2)

- [x] `app/robots.ts`
- [x] `app/sitemap.ts` (minimal)
- [x] `app/layout.tsx` — metadata export added
- [x] `app/page.tsx` — JSON-LD structured data added
- [x] Shareable URL feature (calc params as URL search params)
- [ ] Sitemap submitted to Google Search Console
- [x] `/calculators/sip-vs-prepayment` — page + calculator component
- [x] `/calculators/home-loan-eligibility` — page + calculator component
- [x] `/calculators/tax-benefit` — page + calculator component
- [ ] Blog post #1: "Reduce EMI or Reduce Tenure After Part Payment?"
- [ ] Blog post #2: "How Much Total Interest Will You Pay on Your Home Loan?"

### Phase 2 — Auth + Dashboard (Week 3–6)

- [x] `lib/mongodb.ts`
- [x] `lib/models/User.ts`
- [x] `lib/models/Loan.ts`
- [x] `lib/models/PartPayment.ts`
- [x] `lib/auth.ts`
- [x] `app/api/auth/[...nextauth]/route.ts`
- [x] `app/api/loans/route.ts` (GET + POST) — migrated to tRPC
- [x] `app/api/loans/[loanId]/route.ts` (GET + PUT + DELETE) — migrated to tRPC
- [x] `app/api/part-payments/route.ts` (GET + POST) — migrated to tRPC
- [x] `app/api/part-payments/[id]/route.ts` (DELETE) — migrated to tRPC
- [x] `app/login/page.tsx`
- [x] `app/dashboard/layout.tsx` (auth guard + sidebar)
- [x] `app/dashboard/page.tsx` (overview)
- [x] `lib/store/dashboardStore.ts` — replaced with tRPC React Query
- [x] `types/index.ts` (all interfaces)
- [x] `lib/utils/formatters.ts`
- [x] `lib/utils/planGating.ts`
- [x] `lib/calculations/loanCalcs.ts`
- [x] `components/ui/ProGate.tsx`
- [x] `app/dashboard/loans/new/page.tsx`
- [x] `app/dashboard/loans/[loanId]/page.tsx`
- [x] `components/dashboard/PartPaymentLogger.tsx`

### Phase 3 — Core Features (Week 7–12)

- [x] `lib/calculations/payoffStrategies.ts`
- [x] `app/dashboard/planner/page.tsx`
- [x] `lib/calculations/consolidationCalcs.ts`
- [x] `app/dashboard/consolidation/page.tsx`
- [x] `lib/calculations/taxCalcs.ts`
- [x] `app/dashboard/tax/page.tsx`
- [x] `app/pricing/page.tsx`
- [x] `app/api/payments/create-subscription/route.ts`
- [x] `app/api/payments/webhook/route.ts`

### Phase 4 — Monetisation (Week 13–16)

- [x] `lib/affiliates/config.ts`
- [x] Contextual affiliate links wired to consolidation
- [x] `lib/email/alerts.ts` (Resend)
- [x] Monthly email summary function
- [ ] AdSense applied for

### Phase 5 — Growth (Week 17–24)

- [x] `lib/calculations/sipVsPrepay.ts`
- [x] Dynamic SIP vs Prepayment page
- [x] `/rbi-rates` page
- [x] Debt-Free Challenge
- [x] PDF Report (jsPDF)

### Blog Automation System

- [x] scripts/blog/post-list.ts (36 posts, 3-tier strategy)
- [x] scripts/blog/prompts/system-prompt.ts (LastEMI rebrand, competition-aware)
- [x] scripts/blog/prompts/image-prompts.ts
- [x] scripts/blog/generate-post.ts (tier-aware user prompt, updated frontmatter)
- [x] scripts/blog/generate-all.ts (tier-ordered generation)
- [x] scripts/blog/check-quality.ts (12-rule quality gate)
- [x] package.json blog:generate, blog:generate-all, blog:check scripts
- [x] lib/blog/types.ts updated with image field
- [x] app/blog/[slug]/page.tsx updated to show header image
- [x] components/blog/BlogCard.tsx updated with thumbnail
- [x] REPLICATE_API_TOKEN added to .env.local and CLAUDE.md env vars
- [ ] REPLICATE_API_TOKEN configured with real value
- [ ] GROQ_API_KEY configured with real value
- [ ] Blog posts generated (run: npm run blog:generate-all)

### SEO Systems

- [x] lib/seo/metadata.ts — centralized metadata factory
- [x] lib/seo/schema.ts — all JSON-LD schema generators (Org, Website, Financial, Calculator, Article, FAQ, Breadcrumb, HowTo)
- [x] lib/seo/web-vitals.ts — Core Web Vitals reporting
- [x] app/robots.ts — AI crawlers explicitly allowed (GPTBot, ClaudeBot, PerplexityBot)
- [x] app/sitemap.ts — dynamic with blog posts + tier-based priority
- [x] public/llms.txt — AI platform indexing file (GEO)
- [x] app/about/page.tsx — E-E-A-T about page
- [x] app/editorial-standards/page.tsx — E-E-A-T editorial standards
- [x] Organization + Website + FinancialService schema in root layout
- [x] Article + FAQ + Breadcrumb schema on blog posts
- [x] scripts/blog/autonomous/internal-linker.ts — auto internal linking
- [x] scripts/blog/autonomous/distributor.ts — social content generation
- [x] scripts/seo/collect-metrics.ts — weekly SEO metrics collector
- [x] docs/ai-visibility-checks.md — AI visibility monitoring guide
- [x] next.config.ts — security + performance headers
- [ ] Google Search Console verified
- [ ] Google Analytics 4 configured (NEXT_PUBLIC_GA_ID)

---

## CURRENT SESSION FOCUS

**Phase:** 1 — SEO Foundation
**Week:** 1
**Immediate goal:** Get site indexed on Google

**Tasks in order for this session:**

1. `app/robots.ts`
2. `app/sitemap.ts`
3. `app/layout.tsx` — add metadata
4. `app/page.tsx` — add JSON-LD
5. `/calculators/sip-vs-prepayment` full page
6. `/calculators/home-loan-eligibility` full page
7. Update sitemap with new pages

**After each task:** check the box in Section 14, then move to next.
