import { z } from "zod";

export const LoanInputSchema = z.object({
  name: z.string().min(1, "Loan name is required").max(100),
  type: z.enum([
    "home",
    "car",
    "two_wheeler",
    "personal",
    "education",
    "gold",
    "consumer_durable",
    "credit_card",
    "lap",
    "medical",
    "other",
  ]),
  lender: z.string().max(100).default(""),
  originalAmount: z.number().positive("Amount must be positive"),
  currentOutstanding: z.number().min(0),
  interestRate: z.number().min(0).max(100),
  emiAmount: z.number().min(0),
  emiDate: z.number().int().min(1).max(28).default(1),
  startDate: z.string(),
  tenureMonths: z.number().int().positive(),
  rateType: z.enum(["fixed", "floating"]).default("floating"),
  prepaymentPenalty: z.number().min(0).max(10).default(0),
  // All optional string fields accept null too — superjson sometimes
  // serializes empty/undefined as null, and Zod's plain .optional() rejects
  // null. Defensive nullable() prevents this class of bug at every entry.
  moratoriumEndDate: z.string().optional().nullable(),
  // ISO date — when currentOutstanding was last verified against the
  // bank's books. Optional; NULL means user hasn't verified yet.
  outstandingAsOf: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

// Schema for adding a rate revision to an existing loan.
export const RateRevisionInputSchema = z.object({
  loanId: z.string().min(1),
  oldRate: z.number().min(0).max(100),
  newRate: z.number().min(0).max(100),
  effectiveDate: z.string(),
  // What the bank adjusted on your side when the rate changed.
  // 'emi'    → bank kept the original tenure, recalculated EMI
  // 'tenure' → bank kept your original EMI, lengthened/shortened tenure
  // 'both'   → unusual; user manually re-negotiated both
  adjusted: z.enum(["emi", "tenure", "both"]).default("emi"),
  newEmi: z.number().min(0).optional().nullable(),
  newTenureMonths: z.number().int().positive().optional().nullable(),
  note: z.string().max(200).optional().nullable(),
});

// Schema for the "refresh from bank statement" wizard. Smaller payload
// than a full loan update; only the three things the user reads off
// the latest statement.
export const RefreshFromStatementSchema = z.object({
  loanId: z.string().min(1),
  currentOutstanding: z.number().min(0),
  emiAmount: z.number().min(0),
  asOfDate: z.string(),
  // Optional — if user wants the rate updated to the back-solved
  // effective rate based on the EMI they entered. Accept `null` from
  // serializers that can't round-trip `undefined` cleanly (superjson).
  newInterestRate: z.number().min(0).max(100).optional().nullable(),
});

export const PartPaymentInputSchema = z.object({
  loanId: z.string().min(1),
  amount: z.number().positive("Amount must be positive"),
  date: z.string(),
  reduceType: z.enum(["emi", "tenure"]),
  note: z.string().max(200).optional(),
});

// Canonical types — derived from Zod schemas, re-exported by types/index.ts
export type LoanInput = z.infer<typeof LoanInputSchema>;
export type PartPaymentInput = z.infer<typeof PartPaymentInputSchema>;
export type RateRevisionInput = z.infer<typeof RateRevisionInputSchema>;
export type RefreshFromStatementInput = z.infer<
  typeof RefreshFromStatementSchema
>;
