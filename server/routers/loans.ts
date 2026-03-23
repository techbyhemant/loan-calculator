import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import dbConnect from "@/lib/mongodb";
import { LoanModel } from "@/lib/models/Loan";
import { FREE_LIMITS } from "@/lib/utils/planGating";
import { LoanInputSchema } from "@/lib/validators/loanSchema";

export const loansRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    await dbConnect();
    const loans = await LoanModel.find({
      userId: ctx.userId,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .lean();
    return loans;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      await dbConnect();
      const loan = await LoanModel.findOne({
        _id: input.id,
        userId: ctx.userId,
      }).lean();
      if (!loan) throw new TRPCError({ code: "NOT_FOUND" });
      return loan;
    }),

  create: protectedProcedure
    .input(LoanInputSchema)
    .mutation(async ({ ctx, input }) => {
      await dbConnect();

      if (ctx.userPlan === "free") {
        const count = await LoanModel.countDocuments({
          userId: ctx.userId,
          isActive: true,
        });
        if (count >= FREE_LIMITS.maxLoans) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `Free plan allows max ${FREE_LIMITS.maxLoans} loans. Upgrade to Pro.`,
          });
        }
      }

      const prepaymentPenalty =
        input.rateType === "floating" ? 0 : input.prepaymentPenalty;

      const loan = await LoanModel.create({
        ...input,
        prepaymentPenalty,
        userId: ctx.userId,
      });
      return loan;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: LoanInputSchema.partial(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await dbConnect();
      const loan = await LoanModel.findOneAndUpdate(
        { _id: input.id, userId: ctx.userId },
        { ...input.data, updatedAt: new Date() },
        { new: true, runValidators: true },
      ).lean();
      if (!loan) throw new TRPCError({ code: "NOT_FOUND" });
      return loan;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await dbConnect();
      await LoanModel.findOneAndUpdate(
        { _id: input.id, userId: ctx.userId },
        { isActive: false },
      );
      return { success: true };
    }),
});
