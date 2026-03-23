import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import dbConnect from "@/lib/mongodb";
import { PartPaymentModel } from "@/lib/models/PartPayment";
import { LoanModel } from "@/lib/models/Loan";
import { FREE_LIMITS } from "@/lib/utils/planGating";
import { calculatePartPaymentImpact } from "@/lib/calculations/loanCalcs";
import { PartPaymentInputSchema } from "@/lib/validators/loanSchema";
import type { Loan, ReduceType } from "@/types";

export const partPaymentsRouter = router({
  getByLoan: protectedProcedure
    .input(z.object({ loanId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      await dbConnect();
      const filter: Record<string, string> = { userId: ctx.userId };
      if (input.loanId) filter.loanId = input.loanId;
      const partPayments = await PartPaymentModel.find(filter)
        .sort({ date: -1 })
        .lean();
      return partPayments;
    }),

  create: protectedProcedure
    .input(PartPaymentInputSchema)
    .mutation(async ({ ctx, input }) => {
      await dbConnect();

      const loan = (await LoanModel.findOne({
        _id: input.loanId,
        userId: ctx.userId,
        isActive: true,
      }).lean()) as (Loan & { _id: string }) | null;

      if (!loan) throw new TRPCError({ code: "NOT_FOUND" });

      if (ctx.userPlan === "free") {
        const count = await PartPaymentModel.countDocuments({
          userId: ctx.userId,
        });
        if (count >= FREE_LIMITS.maxPartPaymentLogs) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `Free plan allows max ${FREE_LIMITS.maxPartPaymentLogs} part payment logs. Upgrade to Pro.`,
          });
        }
      }

      const loanData: Loan = {
        _id: String(loan._id),
        userId: String(loan.userId),
        name: loan.name,
        type: loan.type,
        lender: loan.lender,
        originalAmount: loan.originalAmount,
        currentOutstanding: loan.currentOutstanding,
        interestRate: loan.interestRate,
        emiAmount: loan.emiAmount,
        emiDate: loan.emiDate,
        startDate: String(loan.startDate),
        tenureMonths: loan.tenureMonths,
        rateType: loan.rateType,
        prepaymentPenalty: loan.prepaymentPenalty,
        isActive: loan.isActive,
        notes: loan.notes,
        createdAt: String(loan.createdAt),
        updatedAt: String(loan.updatedAt),
      };

      const impact = calculatePartPaymentImpact(
        loanData,
        input.amount,
        input.reduceType as ReduceType,
      );

      const partPayment = await PartPaymentModel.create({
        userId: ctx.userId,
        loanId: input.loanId,
        amount: input.amount,
        date: input.date,
        reduceType: input.reduceType,
        interestSaved: impact.interestSaved,
        monthsReduced: impact.monthsReduced,
        note: input.note || "",
      });

      return partPayment;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await dbConnect();

      const partPayment = await PartPaymentModel.findOne({
        _id: input.id,
        userId: ctx.userId,
      });

      if (!partPayment) throw new TRPCError({ code: "NOT_FOUND" });

      await PartPaymentModel.findByIdAndDelete(input.id);
      return { success: true };
    }),
});
