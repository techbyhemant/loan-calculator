import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { FREE_LIMITS } from "@/lib/utils/planGating";
import { calculatePartPaymentImpact } from "@/lib/calculations/loanCalcs";
import { PartPaymentInputSchema } from "@/lib/validators/loanSchema";
import type { Loan, ReduceType } from "@/types";

type PartPaymentRow = {
  id: string;
  user_id: string;
  loan_id: string;
  amount: string;
  date: string;
  reduce_type: string;
  interest_saved: string | null;
  months_reduced: number | null;
  note: string | null;
  created_at: string;
};

type LoanRow = {
  id: string;
  user_id: string;
  name: string;
  type: string;
  lender: string | null;
  original_amount: string;
  current_outstanding: string;
  interest_rate: string;
  emi_amount: string;
  emi_date: number | null;
  start_date: string;
  tenure_months: number;
  rate_type: string | null;
  prepayment_penalty: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function serializePartPayment(row: PartPaymentRow) {
  return {
    id: row.id,
    userId: row.user_id,
    loanId: row.loan_id,
    amount: Number(row.amount),
    date: row.date,
    reduceType: row.reduce_type,
    interestSaved: Number(row.interest_saved ?? 0),
    monthsReduced: row.months_reduced ?? 0,
    note: row.note ?? "",
    createdAt: row.created_at,
  };
}

function throwSupabaseError(error: { message: string; code?: string }): never {
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: error.message,
    cause: error,
  });
}

export const partPaymentsRouter = router({
  getByLoan: protectedProcedure
    .input(z.object({ loanId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      let query = supabaseAdmin
        .from("part_payments")
        .select("*")
        .eq("user_id", ctx.userId);

      if (input.loanId) {
        query = query.eq("loan_id", input.loanId);
      }

      const { data, error } = await query.order("date", { ascending: false });
      if (error) throwSupabaseError(error);
      return (data as PartPaymentRow[]).map(serializePartPayment);
    }),

  create: protectedProcedure
    .input(PartPaymentInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify the loan exists and belongs to this user
      const { data: loanData, error: loanError } = await supabaseAdmin
        .from("loans")
        .select("*")
        .eq("id", input.loanId)
        .eq("user_id", ctx.userId)
        .eq("is_active", true)
        .maybeSingle();

      if (loanError) throwSupabaseError(loanError);
      if (!loanData) throw new TRPCError({ code: "NOT_FOUND" });

      // Free plan limit check
      if (ctx.userPlan === "free") {
        const { count, error: countError } = await supabaseAdmin
          .from("part_payments")
          .select("*", { count: "exact", head: true })
          .eq("user_id", ctx.userId);
        if (countError) throwSupabaseError(countError);
        if ((count ?? 0) >= FREE_LIMITS.maxPartPaymentLogs) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `Free plan allows max ${FREE_LIMITS.maxPartPaymentLogs} part payment logs. Upgrade to Pro.`,
          });
        }
      }

      const dbLoan = loanData as LoanRow;

      // Build a Loan object for the calculation engine
      const loan: Loan = {
        id: dbLoan.id,
        userId: dbLoan.user_id,
        name: dbLoan.name,
        type: dbLoan.type as Loan["type"],
        lender: dbLoan.lender ?? "",
        originalAmount: Number(dbLoan.original_amount),
        currentOutstanding: Number(dbLoan.current_outstanding),
        interestRate: Number(dbLoan.interest_rate),
        emiAmount: Number(dbLoan.emi_amount),
        emiDate: dbLoan.emi_date ?? 1,
        startDate: new Date(dbLoan.start_date),
        tenureMonths: dbLoan.tenure_months,
        rateType: (dbLoan.rate_type ?? "floating") as Loan["rateType"],
        prepaymentPenalty: Number(dbLoan.prepayment_penalty ?? 0),
        isActive: dbLoan.is_active,
        notes: dbLoan.notes ?? "",
        createdAt: new Date(dbLoan.created_at),
        updatedAt: new Date(dbLoan.updated_at),
      };

      const impact = calculatePartPaymentImpact(
        loan,
        input.amount,
        input.reduceType as ReduceType,
      );

      const { data: inserted, error: insertError } = await supabaseAdmin
        .from("part_payments")
        .insert({
          user_id: ctx.userId,
          loan_id: input.loanId,
          amount: input.amount,
          date: new Date(input.date).toISOString(),
          reduce_type: input.reduceType,
          interest_saved: impact.interestSaved,
          months_reduced: impact.monthsReduced,
          note: input.note || "",
        })
        .select("*")
        .single();

      if (insertError) throwSupabaseError(insertError);
      return serializePartPayment(inserted as PartPaymentRow);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership before deleting (delete-with-condition is the
      // safest path; a non-matching row count returns no error but no row)
      const { data, error } = await supabaseAdmin
        .from("part_payments")
        .delete()
        .eq("id", input.id)
        .eq("user_id", ctx.userId)
        .select("id")
        .maybeSingle();

      if (error) throwSupabaseError(error);
      if (!data) throw new TRPCError({ code: "NOT_FOUND" });
      return { success: true };
    }),
});
