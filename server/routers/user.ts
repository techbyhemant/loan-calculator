import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const userRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        image: users.image,
        plan: users.plan,
        planExpiry: users.planExpiry,
      })
      .from(users)
      .where(eq(users.id, ctx.userId));

    if (rows.length === 0) throw new TRPCError({ code: "NOT_FOUND" });
    return rows[0];
  }),

  updateName: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const rows = await db
        .update(users)
        .set({ name: input.name.trim(), updatedAt: new Date() })
        .where(eq(users.id, ctx.userId))
        .returning({
          id: users.id,
          email: users.email,
          name: users.name,
          image: users.image,
          plan: users.plan,
          planExpiry: users.planExpiry,
        });

      if (rows.length === 0) throw new TRPCError({ code: "NOT_FOUND" });
      return rows[0];
    }),
});
