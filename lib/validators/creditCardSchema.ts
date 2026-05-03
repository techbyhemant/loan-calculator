import { z } from "zod";

export const CreditCardInputSchema = z.object({
  name: z.string().min(1, "Card name is required").max(100),
  issuer: z.string().max(100).default(""),
  creditLimit: z.number().positive("Credit limit must be positive"),
  currentOutstanding: z.number().min(0),
  monthlyRate: z.number().min(0).max(0.1).default(0.035),
  minimumDuePercent: z.number().min(0.01).max(0.5).default(0.05),
  billingDate: z.number().int().min(1).max(28).default(1),
  dueDate: z.number().int().min(1).max(28).default(20),
  // Accept null too — superjson can serialize empty/undefined as null in
  // some setups, and Zod's plain .optional() rejects null. Same defensive
  // pattern used on loanSchema's optional string fields.
  notes: z.string().max(500).optional().nullable(),
});

export type CreditCardInput = z.infer<typeof CreditCardInputSchema>;
