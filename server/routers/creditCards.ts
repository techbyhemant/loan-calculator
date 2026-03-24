import { z } from "zod";
import { router, protectedProcedure, proProcedure } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import dbConnect from "@/lib/mongodb";
import { CreditCardModel } from "@/lib/models/CreditCard";
import { FREE_LIMITS } from "@/lib/utils/planGating";
import { CreditCardInputSchema } from "@/lib/validators/creditCardSchema";
import {
  calculateCCScenarios,
  calculateCreditUtilization,
  calculateMultiCardPayoff,
  CC_DEFAULTS,
} from "@/lib/calculations/creditCardCalcs";

export const creditCardsRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    await dbConnect();
    const cards = await CreditCardModel.find({
      userId: ctx.userId,
      isActive: true,
    })
      .sort({ currentOutstanding: -1 })
      .lean();
    return cards;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      await dbConnect();
      const card = await CreditCardModel.findOne({
        _id: input.id,
        userId: ctx.userId,
      }).lean();
      if (!card) throw new TRPCError({ code: "NOT_FOUND" });
      return card;
    }),

  create: protectedProcedure
    .input(CreditCardInputSchema)
    .mutation(async ({ ctx, input }) => {
      await dbConnect();

      if (ctx.userPlan === "free") {
        const count = await CreditCardModel.countDocuments({
          userId: ctx.userId,
          isActive: true,
        });
        if (count >= FREE_LIMITS.maxCreditCards) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `Free plan allows max ${FREE_LIMITS.maxCreditCards} credit cards. Upgrade to Pro.`,
          });
        }
      }

      const card = await CreditCardModel.create({
        ...input,
        userId: ctx.userId,
      });
      return card;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: CreditCardInputSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await dbConnect();
      const card = await CreditCardModel.findOneAndUpdate(
        { _id: input.id, userId: ctx.userId },
        { ...input.data, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).lean();
      if (!card) throw new TRPCError({ code: "NOT_FOUND" });
      return card;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await dbConnect();
      await CreditCardModel.findOneAndUpdate(
        { _id: input.id, userId: ctx.userId },
        { isActive: false }
      );
      return { success: true };
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    await dbConnect();
    const cards = await CreditCardModel.find({
      userId: ctx.userId,
      isActive: true,
    }).lean();

    const totalOutstanding = cards.reduce(
      (sum, c) => sum + (c.currentOutstanding as number),
      0
    );
    const totalLimit = cards.reduce(
      (sum, c) => sum + (c.creditLimit as number),
      0
    );
    const totalMinDue = cards.reduce(
      (sum, c) =>
        sum +
        Math.max(
          (c.currentOutstanding as number) *
            (c.minimumDuePercent as number),
          CC_DEFAULTS.minimumDueFloor
        ),
      0
    );
    const totalMonthlyInterest = cards.reduce(
      (sum, c) =>
        sum +
        (c.currentOutstanding as number) * (c.monthlyRate as number),
      0
    );

    const utilization = calculateCreditUtilization(
      totalOutstanding,
      totalLimit
    );

    return {
      cardCount: cards.length,
      totalOutstanding,
      totalLimit,
      totalMinDue,
      totalMonthlyInterest,
      utilization,
      cards: cards.map((c) => ({
        id: c._id,
        name: c.name,
        issuer: c.issuer,
        outstanding: c.currentOutstanding,
        limit: c.creditLimit,
        utilizationPercent:
          (c.creditLimit as number) > 0
            ? ((c.currentOutstanding as number) /
                (c.creditLimit as number)) *
              100
            : 0,
        monthlyInterest:
          (c.currentOutstanding as number) * (c.monthlyRate as number),
        minDue: Math.max(
          (c.currentOutstanding as number) *
            (c.minimumDuePercent as number),
          CC_DEFAULTS.minimumDueFloor
        ),
      })),
    };
  }),

  calculatePayoff: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      await dbConnect();
      const card = await CreditCardModel.findOne({
        _id: input.id,
        userId: ctx.userId,
      }).lean();
      if (!card) throw new TRPCError({ code: "NOT_FOUND" });

      return calculateCCScenarios({
        outstanding: card.currentOutstanding as number,
        monthlyRate: card.monthlyRate as number,
      });
    }),

  getMultiCardPlan: proProcedure
    .input(z.object({ totalMonthlyBudget: z.number().positive() }))
    .query(async ({ ctx, input }) => {
      await dbConnect();
      const cards = await CreditCardModel.find({
        userId: ctx.userId,
        isActive: true,
        currentOutstanding: { $gt: 0 },
      }).lean();

      return calculateMultiCardPayoff(
        cards.map((c) => ({
          name: c.name as string,
          outstanding: c.currentOutstanding as number,
          monthlyRate: c.monthlyRate as number,
        })),
        input.totalMonthlyBudget
      );
    }),
});
