import { z } from "zod";
import { router, protectedProcedure, proProcedure } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { FREE_LIMITS } from "@/lib/utils/planGating";
import { CreditCardInputSchema } from "@/lib/validators/creditCardSchema";
import {
  calculateCCScenarios,
  calculateCreditUtilization,
  calculateMultiCardPayoff,
  CC_DEFAULTS,
} from "@/lib/calculations/creditCardCalcs";

type CreditCardRow = {
  id: string;
  user_id: string;
  name: string;
  bank: string;
  last_4_digits: string | null;
  credit_limit: string;
  outstanding: string;
  monthly_interest_rate: string;
  minimum_due_percent: string;
  billing_date: number | null;
  due_date: number | null;
  last_statement_balance: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function serializeCard(row: CreditCardRow) {
  return {
    _id: row.id,
    id: row.id,
    userId: row.user_id,
    name: row.name,
    issuer: row.bank,
    creditLimit: Number(row.credit_limit),
    currentOutstanding: Number(row.outstanding),
    monthlyRate: Number(row.monthly_interest_rate),
    minimumDuePercent: Number(row.minimum_due_percent),
    billingDate: row.billing_date,
    dueDate: row.due_date,
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

export const creditCardsRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await supabaseAdmin
      .from("credit_cards")
      .select("*")
      .eq("user_id", ctx.userId)
      .eq("is_active", true)
      .order("outstanding", { ascending: false });
    if (error) throwSupabaseError(error);
    return (data as CreditCardRow[]).map(serializeCard);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await supabaseAdmin
        .from("credit_cards")
        .select("*")
        .eq("id", input.id)
        .eq("user_id", ctx.userId)
        .maybeSingle();
      if (error) throwSupabaseError(error);
      if (!data) throw new TRPCError({ code: "NOT_FOUND" });
      return serializeCard(data as CreditCardRow);
    }),

  create: protectedProcedure
    .input(CreditCardInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.userPlan === "free") {
        const { count, error: countError } = await supabaseAdmin
          .from("credit_cards")
          .select("*", { count: "exact", head: true })
          .eq("user_id", ctx.userId)
          .eq("is_active", true);
        if (countError) throwSupabaseError(countError);
        if ((count ?? 0) >= FREE_LIMITS.maxCreditCards) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `Free plan allows max ${FREE_LIMITS.maxCreditCards} credit cards. Upgrade to Pro.`,
          });
        }
      }

      const { data, error } = await supabaseAdmin
        .from("credit_cards")
        .insert({
          user_id: ctx.userId,
          name: input.name,
          bank: input.issuer ?? "",
          credit_limit: input.creditLimit,
          outstanding: input.currentOutstanding,
          monthly_interest_rate: input.monthlyRate,
          minimum_due_percent: input.minimumDuePercent,
          billing_date: input.billingDate,
          due_date: input.dueDate,
          notes: input.notes ?? "",
        })
        .select("*")
        .single();
      if (error) throwSupabaseError(error);
      return serializeCard(data as CreditCardRow);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: CreditCardInputSchema.partial(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const setData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (input.data.name !== undefined) setData.name = input.data.name;
      if (input.data.issuer !== undefined) setData.bank = input.data.issuer;
      if (input.data.creditLimit !== undefined)
        setData.credit_limit = input.data.creditLimit;
      if (input.data.currentOutstanding !== undefined)
        setData.outstanding = input.data.currentOutstanding;
      if (input.data.monthlyRate !== undefined)
        setData.monthly_interest_rate = input.data.monthlyRate;
      if (input.data.minimumDuePercent !== undefined)
        setData.minimum_due_percent = input.data.minimumDuePercent;
      if (input.data.billingDate !== undefined)
        setData.billing_date = input.data.billingDate;
      if (input.data.dueDate !== undefined) setData.due_date = input.data.dueDate;
      if (input.data.notes !== undefined) setData.notes = input.data.notes;

      const { data, error } = await supabaseAdmin
        .from("credit_cards")
        .update(setData)
        .eq("id", input.id)
        .eq("user_id", ctx.userId)
        .select("*")
        .maybeSingle();
      if (error) throwSupabaseError(error);
      if (!data) throw new TRPCError({ code: "NOT_FOUND" });
      return serializeCard(data as CreditCardRow);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await supabaseAdmin
        .from("credit_cards")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", input.id)
        .eq("user_id", ctx.userId);
      if (error) throwSupabaseError(error);
      return { success: true };
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await supabaseAdmin
      .from("credit_cards")
      .select("*")
      .eq("user_id", ctx.userId)
      .eq("is_active", true);
    if (error) throwSupabaseError(error);

    const cards = (data as CreditCardRow[]).map(serializeCard);

    const totalOutstanding = cards.reduce(
      (sum, c) => sum + c.currentOutstanding,
      0,
    );
    const totalLimit = cards.reduce((sum, c) => sum + c.creditLimit, 0);
    const totalMinDue = cards.reduce(
      (sum, c) =>
        sum +
        Math.max(
          c.currentOutstanding * c.minimumDuePercent,
          CC_DEFAULTS.minimumDueFloor,
        ),
      0,
    );
    const totalMonthlyInterest = cards.reduce(
      (sum, c) => sum + c.currentOutstanding * c.monthlyRate,
      0,
    );

    const utilization = calculateCreditUtilization(
      totalOutstanding,
      totalLimit,
    );

    return {
      cardCount: cards.length,
      totalOutstanding,
      totalLimit,
      totalMinDue,
      totalMonthlyInterest,
      utilization,
      cards: cards.map((c) => ({
        id: c.id,
        name: c.name,
        issuer: c.issuer,
        outstanding: c.currentOutstanding,
        limit: c.creditLimit,
        utilizationPercent:
          c.creditLimit > 0
            ? (c.currentOutstanding / c.creditLimit) * 100
            : 0,
        monthlyInterest: c.currentOutstanding * c.monthlyRate,
        minDue: Math.max(
          c.currentOutstanding * c.minimumDuePercent,
          CC_DEFAULTS.minimumDueFloor,
        ),
      })),
    };
  }),

  calculatePayoff: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await supabaseAdmin
        .from("credit_cards")
        .select("*")
        .eq("id", input.id)
        .eq("user_id", ctx.userId)
        .maybeSingle();
      if (error) throwSupabaseError(error);
      if (!data) throw new TRPCError({ code: "NOT_FOUND" });

      const card = serializeCard(data as CreditCardRow);
      return calculateCCScenarios({
        outstanding: card.currentOutstanding,
        monthlyRate: card.monthlyRate,
      });
    }),

  getMultiCardPlan: proProcedure
    .input(z.object({ totalMonthlyBudget: z.number().positive() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await supabaseAdmin
        .from("credit_cards")
        .select("*")
        .eq("user_id", ctx.userId)
        .eq("is_active", true);
      if (error) throwSupabaseError(error);

      // Filter to cards with outstanding > 0
      const cardsWithBalance = (data as CreditCardRow[]).filter(
        (r) => Number(r.outstanding) > 0,
      );

      return calculateMultiCardPayoff(
        cardsWithBalance.map((c) => ({
          name: c.name,
          outstanding: Number(c.outstanding),
          monthlyRate: Number(c.monthly_interest_rate),
        })),
        input.totalMonthlyBudget,
      );
    }),
});
