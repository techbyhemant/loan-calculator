import { z } from "zod";
import { router, adminProcedure } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { LIFETIME_CAMPAIGN } from "@/lib/utils/planGating";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  plan_type: string | null;
  plan_expiry: string | null;
  razorpay_customer_id: string | null;
  created_at: string;
  updated_at: string;
};

function serializeUser(row: UserRow) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    plan: row.plan,
    planType: row.plan_type,
    planExpiry: row.plan_expiry,
    razorpayCustomerId: row.razorpay_customer_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function throwIfError(error: { message?: string } | null): void {
  if (!error) return;
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: error.message ?? "Database error",
    cause: error,
  });
}

export const adminRouter = router({
  // Top-level stats for the /admin landing page.
  stats: adminProcedure.query(async () => {
    const [total, free, monthly, yearly, lifetime, last7d] = await Promise.all([
      supabaseAdmin.from("users").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("plan", "free"),
      supabaseAdmin
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("plan_type", "monthly"),
      supabaseAdmin
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("plan_type", "yearly"),
      supabaseAdmin
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("plan_type", "lifetime"),
      supabaseAdmin
        .from("users")
        .select("id", { count: "exact", head: true })
        .gte(
          "created_at",
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        ),
    ]);

    [total, free, monthly, yearly, lifetime, last7d].forEach((r) =>
      throwIfError(r.error),
    );

    const lifetimeCount = lifetime.count ?? 0;
    const spotsRemaining = Math.max(
      0,
      LIFETIME_CAMPAIGN.totalSpots - lifetimeCount,
    );

    return {
      totalUsers: total.count ?? 0,
      freeUsers: free.count ?? 0,
      monthlyUsers: monthly.count ?? 0,
      yearlyUsers: yearly.count ?? 0,
      lifetimeUsers: lifetimeCount,
      signupsLast7Days: last7d.count ?? 0,
      lifetime: {
        totalSpots: LIFETIME_CAMPAIGN.totalSpots,
        taken: lifetimeCount,
        spotsRemaining,
        endsAt: LIFETIME_CAMPAIGN.endsAt,
      },
    };
  }),

  // Paginated user list with optional email/name search.
  listUsers: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        plan: z.enum(["free", "pro", "all"]).default("all"),
        planType: z.enum(["monthly", "yearly", "lifetime", "any"]).optional(),
        limit: z.number().min(1).max(200).default(50),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ input }) => {
      let q = supabaseAdmin
        .from("users")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (input.plan !== "all") {
        q = q.eq("plan", input.plan);
      }
      if (input.planType && input.planType !== "any") {
        q = q.eq("plan_type", input.planType);
      }
      if (input.search && input.search.trim()) {
        const term = input.search.trim();
        // Match on email OR name (case-insensitive partial)
        q = q.or(`email.ilike.%${term}%,name.ilike.%${term}%`);
      }

      const { data, count, error } = await q;
      throwIfError(error);

      return {
        users: ((data ?? []) as UserRow[]).map(serializeUser),
        total: count ?? 0,
      };
    }),

  // Single user detail.
  getUser: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input }) => {
      const { data, error } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("id", input.id)
        .maybeSingle();
      throwIfError(error);
      if (!data) throw new TRPCError({ code: "NOT_FOUND" });
      return serializeUser(data as UserRow);
    }),

  // Manually override a user's plan. Used for support cases:
  //  - Activate Pro for someone whose webhook didn't fire
  //  - Revoke Pro after a refund
  //  - Comp a free Lifetime to a partner / press contact
  setUserPlan: adminProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        plan: z.enum(["free", "pro"]),
        planType: z
          .enum(["monthly", "yearly", "lifetime"])
          .optional()
          .nullable(),
        planExpiry: z.string().optional().nullable(), // ISO date string
        reason: z.string().max(500).optional(), // for the audit log if we add one
      }),
    )
    .mutation(async ({ input }) => {
      void input.reason; // not yet stored — wire to an audit table later

      const update: Record<string, unknown> = {
        plan: input.plan,
        updated_at: new Date().toISOString(),
      };

      if (input.plan === "free") {
        update.plan_type = null;
        update.plan_expiry = null;
      } else {
        // Pro
        if (input.planType !== undefined) {
          update.plan_type = input.planType;
        }
        // Lifetime users always have NULL expiry; everyone else needs one.
        if (input.planType === "lifetime") {
          update.plan_expiry = null;
        } else if (input.planExpiry !== undefined) {
          update.plan_expiry = input.planExpiry
            ? new Date(input.planExpiry).toISOString()
            : null;
        }
      }

      const { data, error } = await supabaseAdmin
        .from("users")
        .update(update)
        .eq("id", input.userId)
        .select("*")
        .maybeSingle();
      throwIfError(error);
      if (!data) throw new TRPCError({ code: "NOT_FOUND" });
      return serializeUser(data as UserRow);
    }),

  // Recent signups for the activity panel.
  recentSignups: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
    .query(async ({ input }) => {
      const { data, error } = await supabaseAdmin
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(input.limit);
      throwIfError(error);
      return ((data ?? []) as UserRow[]).map(serializeUser);
    }),
});
