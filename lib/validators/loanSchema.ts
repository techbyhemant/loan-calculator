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
  moratoriumEndDate: z.string().optional(), // ISO date, for education loans
  notes: z.string().max(500).optional(),
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
