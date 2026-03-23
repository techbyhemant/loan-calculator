import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@/lib/auth";
import superjson from "superjson";

export interface Context {
  userId: string | null;
  userPlan: "free" | "pro";
}

export async function createContext(): Promise<Context> {
  const session = await auth();
  return {
    userId: (session?.user?.id as string) ?? null,
    userPlan: (((session?.user as { plan?: string })?.plan ?? "free") as
      | "free"
      | "pro"),
  };
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

export const proProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (ctx.userPlan !== "pro") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This feature requires a Pro plan. Upgrade at /pricing.",
    });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});
