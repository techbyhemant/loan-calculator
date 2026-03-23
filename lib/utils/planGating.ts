import { UserPlan } from "@/types";

export const FREE_LIMITS = {
  maxLoans: 2,
  maxPartPaymentLogs: 5,
} as const;

export type ProFeature =
  | "payoff-planner"
  | "consolidation-analyzer"
  | "tax-benefit-dashboard"
  | "pdf-export"
  | "email-alerts"
  | "unlimited-loans"
  | "unlimited-part-payments";

export const canAccess = (plan: UserPlan, feature: ProFeature): boolean => {
  void feature;
  return plan === "pro";
};
