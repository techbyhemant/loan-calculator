export type LoanType =
  | "home"
  | "car"
  | "personal"
  | "gold"
  | "education"
  | "credit_card"
  | "other";

export type RateType = "fixed" | "floating";
export type ReduceType = "emi" | "tenure";
export type UserPlan = "free" | "pro";
export type TaxRegime = "old" | "new";
export type ConsolidationVerdict =
  | "BENEFICIAL"
  | "MARGINAL"
  | "NOT_RECOMMENDED";

export interface Loan {
  _id: string;
  userId: string;
  name: string;
  type: LoanType;
  lender: string;
  originalAmount: number;
  currentOutstanding: number;
  interestRate: number; // annual %
  emiAmount: number;
  emiDate: number; // 1–31
  startDate: string; // ISO date string
  tenureMonths: number;
  rateType: RateType;
  prepaymentPenalty: number; // % — ALWAYS 0 for floating (RBI mandated)
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// LoanInput derived from Zod schema — single source of truth
export type { LoanInput } from "@/lib/validators/loanSchema";

export interface PartPayment {
  _id: string;
  userId: string;
  loanId: string;
  amount: number;
  date: string;
  reduceType: ReduceType;
  interestSaved: number;
  monthsReduced: number;
  note?: string;
  createdAt: string;
}

// PartPaymentInput derived from Zod schema — single source of truth
export type { PartPaymentInput } from "@/lib/validators/loanSchema";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  plan: UserPlan;
  planExpiry?: string;
}

export interface AmortizationRow {
  month: number;
  date: Date;
  emi: number;
  principal: number;
  interest: number;
  outstanding: number;
}

export interface PartPaymentResult {
  originalTotalInterest: number;
  newTotalInterest: number;
  interestSaved: number;
  originalDebtFreeDate: Date;
  newDebtFreeDate: Date;
  monthsReduced: number;
  newEMI?: number;
}

export interface AttackOrderItem {
  loanId: string;
  loanName: string;
  interestRate: number;
  priority: number;
  reason: string;
}

export interface PayoffResult {
  strategy: "avalanche" | "snowball" | "current";
  totalInterest: number;
  interestSaved: number;
  debtFreeDate: Date;
  monthsEarlier: number;
  attackOrder: AttackOrderItem[];
}

export interface StrategyComparison {
  current: PayoffResult;
  avalanche: PayoffResult;
  snowball: PayoffResult;
  recommended: "avalanche" | "snowball";
  interestDifference: number;
  monthsDifference: number;
  explanation: string;
}

export interface ConsolidationAnalysis {
  currentWeightedRate: number;
  proposedRate: number;
  currentTotalInterest: number;
  newTotalInterest: number;
  processingFee: number;
  prepaymentPenalties: number;
  netSaving: number;
  verdict: ConsolidationVerdict;
  breakEvenMonths: number;
  loansToConsolidate: string[];
  loansToKeep: string[];
  recommendation: string;
  showAffiliate: boolean;
}

export interface TaxProfile {
  grossIncome: number;
  taxRegime: TaxRegime;
  existing80CInvestments: number;
}

export interface TaxBenefit {
  sec24Deduction: number;
  sec80CDeduction: number;
  sec80EDeduction: number;
  totalDeduction: number;
  taxSaved: number;
  oldRegimeTaxSaved: number;
  newRegimeTaxSaved: number;
  recommendedRegime: TaxRegime;
  regimeDifference: number;
}

export interface SipVsPrepayParams {
  loanOutstanding: number;
  interestRate: number;
  remainingMonths: number;
  monthlyExtra: number;
  sipExpectedReturn: number;
  taxBracket: 10 | 20 | 30;
}

export interface SipVsPrepayResult {
  prepay: {
    interestSaved: number;
    taxBenefitLost: number;
    netBenefit: number;
    monthsReduced: number;
    newDebtFreeDate: Date;
  };
  sip: {
    corpus: number;
    gains: number;
    ltcgTax: number;
    netCorpus: number;
  };
  recommendation: "PREPAY" | "SIP" | "SPLIT";
  optimalSplit: { prepayPercent: number; sipPercent: number };
  explanation: string;
}

export interface DashboardStats {
  totalDebt: number;
  monthlyEmiTotal: number;
  totalInterestRemaining: number;
  debtFreeDate: Date | null;
  loanCount: number;
}
