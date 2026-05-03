import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { RateRevisionInputSchema } from "@/lib/validators/loanSchema";

// Rate revision history. Floating-rate loans change every time RBI moves
// the repo rate, so a single `interest_rate` field on the loan can't tell
// the full story. This router lets the user log each revision with its
// effective date and what got adjusted (EMI vs tenure).

type RateHistoryRow = {
  id: string;
  loan_id: string;
  user_id: string;
  old_rate: string;
  new_rate: string;
  effective_date: string;
  adjusted: string;
  new_emi: string | null;
  new_tenure_months: number | null;
  note: string | null;
  created_at: string;
};

function serializeRateHistory(row: RateHistoryRow) {
  return {
    id: row.id,
    loanId: row.loan_id,
    userId: row.user_id,
    oldRate: Number(row.old_rate),
    newRate: Number(row.new_rate),
    effectiveDate: row.effective_date,
    adjusted: row.adjusted as "emi" | "tenure" | "both",
    newEmi: row.new_emi !== null ? Number(row.new_emi) : null,
    newTenureMonths: row.new_tenure_months,
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

export const loanRateHistoryRouter = router({
  listByLoan: protectedProcedure
    .input(z.object({ loanId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await supabaseAdmin
        .from("loan_rate_history")
        .select("*")
        .eq("loan_id", input.loanId)
        .eq("user_id", ctx.userId)
        .order("effective_date", { ascending: false });
      if (error) throwSupabaseError(error);
      return (data as RateHistoryRow[]).map(serializeRateHistory);
    }),

  add: protectedProcedure
    .input(RateRevisionInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify loan ownership before logging the rate change
      const { data: loan, error: loanError } = await supabaseAdmin
        .from("loans")
        .select("id")
        .eq("id", input.loanId)
        .eq("user_id", ctx.userId)
        .maybeSingle();

      if (loanError) throwSupabaseError(loanError);
      if (!loan) throw new TRPCError({ code: "NOT_FOUND" });

      // Insert the history row
      const { data: insertedRow, error: insertError } = await supabaseAdmin
        .from("loan_rate_history")
        .insert({
          loan_id: input.loanId,
          user_id: ctx.userId,
          old_rate: input.oldRate,
          new_rate: input.newRate,
          effective_date: new Date(input.effectiveDate).toISOString(),
          adjusted: input.adjusted,
          new_emi: input.newEmi ?? null,
          new_tenure_months: input.newTenureMonths ?? null,
          note: input.note ?? "",
        })
        .select("*")
        .single();

      if (insertError) throwSupabaseError(insertError);

      // Also update the loan itself with the new rate / EMI / tenure so
      // the dashboard reflects the latest state without having to scan
      // the history table on every read.
      const loanUpdate: Record<string, unknown> = {
        interest_rate: input.newRate,
        updated_at: new Date().toISOString(),
      };
      if (
        (input.adjusted === "emi" || input.adjusted === "both") &&
        typeof input.newEmi === "number"
      ) {
        loanUpdate.emi_amount = input.newEmi;
      }
      if (
        (input.adjusted === "tenure" || input.adjusted === "both") &&
        typeof input.newTenureMonths === "number"
      ) {
        loanUpdate.tenure_months = input.newTenureMonths;
      }

      const { error: updateError } = await supabaseAdmin
        .from("loans")
        .update(loanUpdate)
        .eq("id", input.loanId)
        .eq("user_id", ctx.userId);

      if (updateError) throwSupabaseError(updateError);

      return serializeRateHistory(insertedRow as RateHistoryRow);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await supabaseAdmin
        .from("loan_rate_history")
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
