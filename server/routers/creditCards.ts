import { z } from "zod";
import { router, protectedProcedure, proProcedure } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/lib/db";
import { creditCards } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { FREE_LIMITS } from "@/lib/utils/planGating";
import { CreditCardInputSchema } from "@/lib/validators/creditCardSchema";
import {
  calculateCCScenarios,
  calculateCreditUtilization,
  calculateMultiCardPayoff,
  CC_DEFAULTS,
} from "@/lib/calculations/creditCardCalcs";

/**
 * Convert Drizzle numeric string columns to numbers for client consumption.
 * Also maps Drizzle column names back to the API-facing field names.
 */
function serializeCard(row: typeof creditCards.$inferSelect) {
  return {
    _id: row.id,
    id: row.id,
    userId: row.userId,
    name: row.name,
    issuer: row.bank,
    creditLimit: Number(row.creditLimit),
    currentOutstanding: Number(row.outstanding),
    monthlyRate: Number(row.monthlyInterestRate),
    minimumDuePercent: Number(row.minimumDuePercent),
    billingDate: row.billingDate,
    dueDate: row.dueDate,
    isActive: row.isActive,
    notes: row.notes ?? "",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const creditCardsRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const rows = await db
      .select()
      .from(creditCards)
      .where(
        and(eq(creditCards.userId, ctx.userId), eq(creditCards.isActive, true)),
      )
      .orderBy(desc(creditCards.outstanding));
    return rows.map(serializeCard);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const rows = await db
        .select()
        .from(creditCards)
        .where(
          and(eq(creditCards.id, input.id), eq(creditCards.userId, ctx.userId)),
        );
      if (rows.length === 0) throw new TRPCError({ code: "NOT_FOUND" });
      return serializeCard(rows[0]);
    }),

  create: protectedProcedure
    .input(CreditCardInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.userPlan === "free") {
        const [{ count }] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(creditCards)
          .where(
            and(
              eq(creditCards.userId, ctx.userId),
              eq(creditCards.isActive, true),
            ),
          );
        if (count >= FREE_LIMITS.maxCreditCards) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `Free plan allows max ${FREE_LIMITS.maxCreditCards} credit cards. Upgrade to Pro.`,
          });
        }
      }

      const [newCard] = await db
        .insert(creditCards)
        .values({
          userId: ctx.userId,
          name: input.name,
          bank: input.issuer ?? "",
          creditLimit: String(input.creditLimit),
          outstanding: String(input.currentOutstanding),
          monthlyInterestRate: String(input.monthlyRate),
          minimumDuePercent: String(input.minimumDuePercent),
          billingDate: input.billingDate,
          dueDate: input.dueDate,
          notes: input.notes ?? "",
        })
        .returning();
      return serializeCard(newCard);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: CreditCardInputSchema.partial(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const setData: Record<string, unknown> = { updatedAt: new Date() };

      if (input.data.name !== undefined) setData.name = input.data.name;
      if (input.data.issuer !== undefined) setData.bank = input.data.issuer;
      if (input.data.creditLimit !== undefined)
        setData.creditLimit = String(input.data.creditLimit);
      if (input.data.currentOutstanding !== undefined)
        setData.outstanding = String(input.data.currentOutstanding);
      if (input.data.monthlyRate !== undefined)
        setData.monthlyInterestRate = String(input.data.monthlyRate);
      if (input.data.minimumDuePercent !== undefined)
        setData.minimumDuePercent = String(input.data.minimumDuePercent);
      if (input.data.billingDate !== undefined)
        setData.billingDate = input.data.billingDate;
      if (input.data.dueDate !== undefined)
        setData.dueDate = input.data.dueDate;
      if (input.data.notes !== undefined) setData.notes = input.data.notes;

      const rows = await db
        .update(creditCards)
        .set(setData)
        .where(
          and(eq(creditCards.id, input.id), eq(creditCards.userId, ctx.userId)),
        )
        .returning();

      if (rows.length === 0) throw new TRPCError({ code: "NOT_FOUND" });
      return serializeCard(rows[0]);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .update(creditCards)
        .set({ isActive: false, updatedAt: new Date() })
        .where(
          and(eq(creditCards.id, input.id), eq(creditCards.userId, ctx.userId)),
        );
      return { success: true };
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const rows = await db
      .select()
      .from(creditCards)
      .where(
        and(eq(creditCards.userId, ctx.userId), eq(creditCards.isActive, true)),
      );

    const cards = rows.map(serializeCard);

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
      const rows = await db
        .select()
        .from(creditCards)
        .where(
          and(eq(creditCards.id, input.id), eq(creditCards.userId, ctx.userId)),
        );
      if (rows.length === 0) throw new TRPCError({ code: "NOT_FOUND" });

      const card = serializeCard(rows[0]);
      return calculateCCScenarios({
        outstanding: card.currentOutstanding,
        monthlyRate: card.monthlyRate,
      });
    }),

  getMultiCardPlan: proProcedure
    .input(z.object({ totalMonthlyBudget: z.number().positive() }))
    .query(async ({ ctx, input }) => {
      const rows = await db
        .select()
        .from(creditCards)
        .where(
          and(
            eq(creditCards.userId, ctx.userId),
            eq(creditCards.isActive, true),
          ),
        );

      // Filter to cards with outstanding > 0
      const cardsWithBalance = rows.filter(
        (r) => Number(r.outstanding) > 0,
      );

      return calculateMultiCardPayoff(
        cardsWithBalance.map((c) => ({
          name: c.name,
          outstanding: Number(c.outstanding),
          monthlyRate: Number(c.monthlyInterestRate),
        })),
        input.totalMonthlyBudget,
      );
    }),
});
