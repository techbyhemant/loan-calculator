import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Migrated to Supabase JS for Edge-runtime compatibility. Drizzle remains
// the source of truth for schema (lib/db/schema.ts) and migrations; queries
// at runtime go through the HTTP-based PostgREST API which works on Edge.

export const userRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id, email, name, image, plan, plan_expiry")
      .eq("id", ctx.userId)
      .maybeSingle();

    if (error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
        cause: error,
      });
    if (!data) throw new TRPCError({ code: "NOT_FOUND" });

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      image: data.image,
      plan: data.plan,
      planExpiry: data.plan_expiry,
    };
  }),

  updateName: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await supabaseAdmin
        .from("users")
        .update({ name: input.name.trim(), updated_at: new Date().toISOString() })
        .eq("id", ctx.userId)
        .select("id, email, name, image, plan, plan_expiry")
        .maybeSingle();

      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
          cause: error,
        });
      if (!data) throw new TRPCError({ code: "NOT_FOUND" });

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        image: data.image,
        plan: data.plan,
        planExpiry: data.plan_expiry,
      };
    }),
});
