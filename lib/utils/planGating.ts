import { UserPlan } from "@/types";

export const FREE_LIMITS = {
  maxLoans: 2,
  maxPartPaymentLogs: 5,
  maxCreditCards: 2,
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

export const canAccess = (plan: UserPlan, feature: ProFeature): boolean => {
  void feature;
  return plan === "pro";
};
