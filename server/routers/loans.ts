import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { FREE_LIMITS } from "@/lib/utils/planGating";
import { LoanInputSchema } from "@/lib/validators/loanSchema";
import { isRBIZeroPenaltyApplicable } from "@/lib/calculations/loanTypeConfig";

// Postgres returns snake_case from PostgREST; the rest of the app expects
// camelCase. This is the API boundary where we translate.
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
  moratorium_end_date: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function serializeLoan(row: LoanRow) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type,
    lender: row.lender ?? "",
    originalAmount: Number(row.original_amount),
    currentOutstanding: Number(row.current_outstanding),
    interestRate: Number(row.interest_rate),
    emiAmount: Number(row.emi_amount),
    emiDate: row.emi_date,
    startDate: row.start_date,
    tenureMonths: row.tenure_months,
    rateType: row.rate_type ?? "floating",
    prepaymentPenalty: Number(row.prepayment_penalty ?? 0),
    moratoriumEndDate: row.moratorium_end_date,
    isActive: row.is_active,
    notes: row.notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function throwSupabaseError(error: { message: string; code?: string }): never {
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: error.message,
    cause: error,
  });
}

export const loansRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const t0 = Date.now();
    const { data, error } = await supabaseAdmin
      .from("loans")
      .select("*")
      .eq("user_id", ctx.userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throwSupabaseError(error);
    console.log(
      `[perf loans.getAll] db=${Date.now() - t0}ms rows=${data?.length ?? 0}`,
    );
    return (data as LoanRow[]).map(serializeLoan);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await supabaseAdmin
        .from("loans")
        .select("*")
        .eq("id", input.id)
        .eq("user_id", ctx.userId)
        .maybeSingle();

      if (error) throwSupabaseError(error);
      if (!data) throw new TRPCError({ code: "NOT_FOUND" });
      return serializeLoan(data as LoanRow);
    }),

  create: protectedProcedure
    .input(LoanInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Free plan limit check via PostgREST head+count
      if (ctx.userPlan === "free") {
        const { count, error: countError } = await supabaseAdmin
          .from("loans")
          .select("*", { count: "exact", head: true })
          .eq("user_id", ctx.userId)
          .eq("is_active", true);

        if (countError) throwSupabaseError(countError);
        if ((count ?? 0) >= FREE_LIMITS.maxLoans) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `Free plan allows max ${FREE_LIMITS.maxLoans} loans. Upgrade to Pro.`,
          });
        }
      }

      const prepaymentPenalty = isRBIZeroPenaltyApplicable(
        input.type,
        input.rateType,
      )
        ? 0
        : input.prepaymentPenalty;

      const { data, error } = await supabaseAdmin
        .from("loans")
        .insert({
          user_id: ctx.userId,
          name: input.name,
          type: input.type,
          lender: input.lender ?? "",
          original_amount: input.originalAmount,
          current_outstanding: input.currentOutstanding,
          interest_rate: input.interestRate,
          emi_amount: input.emiAmount,
          emi_date: input.emiDate,
          start_date: new Date(input.startDate).toISOString(),
          tenure_months: input.tenureMonths,
          rate_type: input.rateType,
          prepayment_penalty: prepaymentPenalty,
          moratorium_end_date: input.moratoriumEndDate
            ? new Date(input.moratoriumEndDate).toISOString()
            : null,
          notes: input.notes ?? "",
        })
        .select("*")
        .single();

      if (error) throwSupabaseError(error);
      return serializeLoan(data as LoanRow);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: LoanInputSchema.partial(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const setData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (input.data.name !== undefined) setData.name = input.data.name;
      if (input.data.type !== undefined) setData.type = input.data.type;
      if (input.data.lender !== undefined) setData.lender = input.data.lender;
      if (input.data.originalAmount !== undefined)
        setData.original_amount = input.data.originalAmount;
      if (input.data.currentOutstanding !== undefined)
        setData.current_outstanding = input.data.currentOutstanding;
      if (input.data.interestRate !== undefined)
        setData.interest_rate = input.data.interestRate;
      if (input.data.emiAmount !== undefined)
        setData.emi_amount = input.data.emiAmount;
      if (input.data.emiDate !== undefined) setData.emi_date = input.data.emiDate;
      if (input.data.startDate !== undefined)
        setData.start_date = new Date(input.data.startDate).toISOString();
      if (input.data.tenureMonths !== undefined)
        setData.tenure_months = input.data.tenureMonths;
      if (input.data.rateType !== undefined)
        setData.rate_type = input.data.rateType;
      if (input.data.prepaymentPenalty !== undefined)
        setData.prepayment_penalty = input.data.prepaymentPenalty;
      if (input.data.moratoriumEndDate !== undefined)
        setData.moratorium_end_date = input.data.moratoriumEndDate
          ? new Date(input.data.moratoriumEndDate).toISOString()
          : null;
      if (input.data.notes !== undefined) setData.notes = input.data.notes;

      const { data, error } = await supabaseAdmin
        .from("loans")
        .update(setData)
        .eq("id", input.id)
        .eq("user_id", ctx.userId)
        .select("*")
        .maybeSingle();

      if (error) throwSupabaseError(error);
      if (!data) throw new TRPCError({ code: "NOT_FOUND" });
      return serializeLoan(data as LoanRow);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await supabaseAdmin
        .from("loans")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", input.id)
        .eq("user_id", ctx.userId);

      if (error) throwSupabaseError(error);
      return { success: true };
    }),
});
