import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/lib/db";
import { loans } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { FREE_LIMITS } from "@/lib/utils/planGating";
import { LoanInputSchema } from "@/lib/validators/loanSchema";
import { isRBIZeroPenaltyApplicable } from "@/lib/calculations/loanTypeConfig";

/** Convert Drizzle numeric string columns to numbers for client consumption. */
function serializeLoan(row: typeof loans.$inferSelect) {
  return {
    ...row,
    originalAmount: Number(row.originalAmount),
    currentOutstanding: Number(row.currentOutstanding),
    interestRate: Number(row.interestRate),
    emiAmount: Number(row.emiAmount),
    prepaymentPenalty: Number(row.prepaymentPenalty),
  };
}

export const loansRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const rows = await db
      .select()
      .from(loans)
      .where(and(eq(loans.userId, ctx.userId), eq(loans.isActive, true)))
      .orderBy(desc(loans.createdAt));
    return rows.map(serializeLoan);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const rows = await db
        .select()
        .from(loans)
        .where(and(eq(loans.id, input.id), eq(loans.userId, ctx.userId)));
      if (rows.length === 0) throw new TRPCError({ code: "NOT_FOUND" });
      return serializeLoan(rows[0]);
    }),

  create: protectedProcedure
    .input(LoanInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.userPlan === "free") {
        const [{ count }] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(loans)
          .where(
            and(eq(loans.userId, ctx.userId), eq(loans.isActive, true)),
          );
        if (count >= FREE_LIMITS.maxLoans) {
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

      const [newLoan] = await db
        .insert(loans)
        .values({
          userId: ctx.userId,
          name: input.name,
          type: input.type,
          lender: input.lender ?? "",
          originalAmount: String(input.originalAmount),
          currentOutstanding: String(input.currentOutstanding),
          interestRate: String(input.interestRate),
          emiAmount: String(input.emiAmount),
          emiDate: input.emiDate,
          startDate: new Date(input.startDate),
          tenureMonths: input.tenureMonths,
          rateType: input.rateType,
          prepaymentPenalty: String(prepaymentPenalty),
          moratoriumEndDate: input.moratoriumEndDate
            ? new Date(input.moratoriumEndDate)
            : null,
          notes: input.notes ?? "",
        })
        .returning();
      return serializeLoan(newLoan);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: LoanInputSchema.partial(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Build the set object, converting numbers to strings for numeric columns
      const setData: Record<string, unknown> = { updatedAt: new Date() };

      if (input.data.name !== undefined) setData.name = input.data.name;
      if (input.data.type !== undefined) setData.type = input.data.type;
      if (input.data.lender !== undefined) setData.lender = input.data.lender;
      if (input.data.originalAmount !== undefined)
        setData.originalAmount = String(input.data.originalAmount);
      if (input.data.currentOutstanding !== undefined)
        setData.currentOutstanding = String(input.data.currentOutstanding);
      if (input.data.interestRate !== undefined)
        setData.interestRate = String(input.data.interestRate);
      if (input.data.emiAmount !== undefined)
        setData.emiAmount = String(input.data.emiAmount);
      if (input.data.emiDate !== undefined) setData.emiDate = input.data.emiDate;
      if (input.data.startDate !== undefined)
        setData.startDate = new Date(input.data.startDate);
      if (input.data.tenureMonths !== undefined)
        setData.tenureMonths = input.data.tenureMonths;
      if (input.data.rateType !== undefined)
        setData.rateType = input.data.rateType;
      if (input.data.prepaymentPenalty !== undefined)
        setData.prepaymentPenalty = String(input.data.prepaymentPenalty);
      if (input.data.moratoriumEndDate !== undefined)
        setData.moratoriumEndDate = input.data.moratoriumEndDate
          ? new Date(input.data.moratoriumEndDate)
          : null;
      if (input.data.notes !== undefined) setData.notes = input.data.notes;

      const rows = await db
        .update(loans)
        .set(setData)
        .where(and(eq(loans.id, input.id), eq(loans.userId, ctx.userId)))
        .returning();

      if (rows.length === 0) throw new TRPCError({ code: "NOT_FOUND" });
      return serializeLoan(rows[0]);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .update(loans)
        .set({ isActive: false, updatedAt: new Date() })
        .where(and(eq(loans.id, input.id), eq(loans.userId, ctx.userId)));
      return { success: true };
    }),
});
