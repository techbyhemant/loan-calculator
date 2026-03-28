import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/lib/db";
import { loans, partPayments } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { FREE_LIMITS } from "@/lib/utils/planGating";
import { calculatePartPaymentImpact } from "@/lib/calculations/loanCalcs";
import { PartPaymentInputSchema } from "@/lib/validators/loanSchema";
import type { Loan, ReduceType } from "@/types";

/** Convert Drizzle numeric string columns to numbers for client consumption. */
function serializePartPayment(row: typeof partPayments.$inferSelect) {
  return {
    ...row,
    amount: Number(row.amount),
    interestSaved: Number(row.interestSaved),
  };
}

export const partPaymentsRouter = router({
  getByLoan: protectedProcedure
    .input(z.object({ loanId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const conditions = [eq(partPayments.userId, ctx.userId)];
      if (input.loanId) {
        conditions.push(eq(partPayments.loanId, input.loanId));
      }

      const rows = await db
        .select()
        .from(partPayments)
        .where(and(...conditions))
        .orderBy(desc(partPayments.date));

      return rows.map(serializePartPayment);
    }),

  create: protectedProcedure
    .input(PartPaymentInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify the loan exists and belongs to this user
      const loanRows = await db
        .select()
        .from(loans)
        .where(
          and(
            eq(loans.id, input.loanId),
            eq(loans.userId, ctx.userId),
            eq(loans.isActive, true),
          ),
        );

      if (loanRows.length === 0) throw new TRPCError({ code: "NOT_FOUND" });

      // Free plan limit check
      if (ctx.userPlan === "free") {
        const [{ count }] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(partPayments)
          .where(eq(partPayments.userId, ctx.userId));
        if (count >= FREE_LIMITS.maxPartPaymentLogs) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `Free plan allows max ${FREE_LIMITS.maxPartPaymentLogs} part payment logs. Upgrade to Pro.`,
          });
        }
      }

      const dbLoan = loanRows[0];

      // Build a Loan object for the calculation engine
      const loanData: Loan = {
        id: dbLoan.id,
        userId: dbLoan.userId,
        name: dbLoan.name,
        type: dbLoan.type as Loan["type"],
        lender: dbLoan.lender ?? "",
        originalAmount: Number(dbLoan.originalAmount),
        currentOutstanding: Number(dbLoan.currentOutstanding),
        interestRate: Number(dbLoan.interestRate),
        emiAmount: Number(dbLoan.emiAmount),
        emiDate: dbLoan.emiDate ?? 1,
        startDate: dbLoan.startDate,
        tenureMonths: dbLoan.tenureMonths,
        rateType: dbLoan.rateType ?? "floating",
        prepaymentPenalty: Number(dbLoan.prepaymentPenalty),
        isActive: dbLoan.isActive,
        notes: dbLoan.notes ?? "",
        createdAt: dbLoan.createdAt,
        updatedAt: dbLoan.updatedAt,
      };

      const impact = calculatePartPaymentImpact(
        loanData,
        input.amount,
        input.reduceType as ReduceType,
      );

      const [newPartPayment] = await db
        .insert(partPayments)
        .values({
          userId: ctx.userId,
          loanId: input.loanId,
          amount: String(input.amount),
          date: new Date(input.date),
          reduceType: input.reduceType,
          interestSaved: String(impact.interestSaved),
          monthsReduced: impact.monthsReduced,
          note: input.note || "",
        })
        .returning();

      return serializePartPayment(newPartPayment);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership before deleting
      const rows = await db
        .select()
        .from(partPayments)
        .where(
          and(
            eq(partPayments.id, input.id),
            eq(partPayments.userId, ctx.userId),
          ),
        );

      if (rows.length === 0) throw new TRPCError({ code: "NOT_FOUND" });

      await db.delete(partPayments).where(eq(partPayments.id, input.id));
      return { success: true };
    }),
});
