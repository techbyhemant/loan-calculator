import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import dbConnect from "@/lib/mongodb";
import { UserModel } from "@/lib/models/User";

export const userRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    await dbConnect();
    const user = await UserModel.findById(ctx.userId)
      .select("email name image plan planExpiry")
      .lean();
    if (!user) throw new TRPCError({ code: "NOT_FOUND" });
    return user;
  }),

  updateName: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      await dbConnect();
      const user = await UserModel.findByIdAndUpdate(
        ctx.userId,
        { $set: { name: input.name.trim() } },
        { new: true, runValidators: true },
      )
        .select("email name image plan planExpiry")
        .lean();
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      return user;
    }),
});
