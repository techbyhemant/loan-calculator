import { PlanType, UserPlan } from "@/types";

export const FREE_LIMITS = {
  maxLoans: 2,
  maxPartPaymentLogs: 5,
  maxCreditCards: 2,
} as const;

// Founding-member campaign config. Edit these two values to change the
// campaign window. The /pricing page reads them server-side and shows
// "X spots remaining" until the cap is hit, then hides the lifetime
// card entirely.
export const LIFETIME_CAMPAIGN = {
  totalSpots: 100,
  // Hard end-date in case the cap isn't hit. ISO format (YYYY-MM-DD).
  endsAt: "2026-08-04", // 90 days from launch (2026-05-06)
} as const;

// Pricing constants (single source of truth). All amounts in INR.
export const PRICING = {
  monthly: 299,
  yearly: 2499,
  lifetime: 6999,
} as const;

export type ProFeature =
  | "payoff-planner"
  | "consolidation-analyzer"
  | "tax-benefit-dashboard"
  | "pdf-export"
  | "email-alerts"
  | "unlimited-loans"
  | "unlimited-part-payments"
  | "unlimited-credit-cards"
  | "multi-card-payoff-planner";

/**
 * Returns true if a user's Pro access is currently valid.
 *
 * Lifetime users always pass.
 * Monthly/yearly users pass if their planExpiry is in the future.
 * Anything else (free, expired subscription, missing data) fails.
 */
export const isProActive = (user: {
  plan?: UserPlan | string | null;
  planType?: PlanType | string | null;
  planExpiry?: Date | string | null;
}): boolean => {
  if (user.plan !== "pro") return false;
  if (user.planType === "lifetime") return true;
  if (!user.planExpiry) return false;
  const expiry =
    user.planExpiry instanceof Date
      ? user.planExpiry
      : new Date(user.planExpiry);
  return expiry.getTime() > Date.now();
};

export const canAccess = (
  user: { plan?: UserPlan | string | null; planType?: PlanType | string | null; planExpiry?: Date | string | null },
  feature: ProFeature,
): boolean => {
  void feature;
  return isProActive(user);
};

/**
 * Backwards-compatible shim — older call sites pass just the plan string.
 * Returns true for any user marked "pro" without checking expiry. Prefer
 * canAccess(user, feature) on new call sites so lifetime/expiry are
 * honoured.
 */
export const canAccessByPlan = (plan: UserPlan, feature: ProFeature): boolean => {
  void feature;
  return plan === "pro";
};
