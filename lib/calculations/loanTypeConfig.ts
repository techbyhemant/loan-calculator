/**
 * Loan Type Configuration — single source of truth for all loan-type-specific behaviour.
 * Import from here. Never hardcode loan-type rules elsewhere.
 */

// ─── Loan Type Union ──────────────────────────────────────────

export type LoanType =
  | "home"
  | "car"
  | "two_wheeler"
  | "personal"
  | "education"
  | "gold"
  | "consumer_durable"
  | "lap" // Loan Against Property
  | "medical"
  | "other";

// ─── Per-type display config ──────────────────────────────────

export interface LoanTypeDisplay {
  label: string;
  shortLabel: string;
  icon: string;
  color: string; // Tailwind color class for badge
  description: string;
}

export const LOAN_TYPE_DISPLAY: Record<LoanType, LoanTypeDisplay> = {
  home: {
    label: "Home Loan",
    shortLabel: "Home",
    icon: "🏠",
    color: "blue",
    description: "For purchase or construction of residential property",
  },
  car: {
    label: "Car Loan",
    shortLabel: "Car",
    icon: "🚗",
    color: "orange",
    description: "New or used vehicle purchase financing",
  },
  two_wheeler: {
    label: "Two-Wheeler Loan",
    shortLabel: "Bike",
    icon: "🏍️",
    color: "amber",
    description: "Motorcycle or scooter financing",
  },
  personal: {
    label: "Personal Loan",
    shortLabel: "Personal",
    icon: "👤",
    color: "purple",
    description: "Unsecured loan for any personal purpose",
  },
  education: {
    label: "Education Loan",
    shortLabel: "Education",
    icon: "🎓",
    color: "teal",
    description: "For higher education fees and expenses",
  },
  gold: {
    label: "Gold Loan",
    shortLabel: "Gold",
    icon: "🪙",
    color: "yellow",
    description: "Loan against gold jewellery as collateral",
  },
  consumer_durable: {
    label: "Consumer EMI",
    shortLabel: "Consumer",
    icon: "📱",
    color: "pink",
    description: "EMI for electronics, appliances, or other goods",
  },
  lap: {
    label: "Loan Against Property",
    shortLabel: "LAP",
    icon: "🏢",
    color: "slate",
    description: "Loan secured against owned property",
  },
  medical: {
    label: "Medical Loan",
    shortLabel: "Medical",
    icon: "🏥",
    color: "red",
    description: "For medical treatment or emergency healthcare",
  },
  other: {
    label: "Other Loan",
    shortLabel: "Other",
    icon: "📋",
    color: "gray",
    description: "Any other type of personal loan",
  },
};

// ─── Per-type financial config ────────────────────────────────

export interface LoanTypeFinancials {
  defaultRatePA: number;
  defaultTenureMonths: number;
  defaultAmountINR: number;
  typicalRateMin: number;
  typicalRateMax: number;
  typicalTenureMin: number; // months
  typicalTenureMax: number; // months
  hasPrepaymentPenalty: boolean;
  prepaymentPenaltyPercent?: number;
  prepaymentLockInMonths?: number;
  rbiZeroPenaltyApplies: boolean; // ONLY true for floating-rate home loans + LAP
  taxBenefit80C: boolean;
  taxBenefit24b: boolean; // home loan interest deduction
  taxBenefit80E: boolean; // education loan interest (NO upper limit)
  taxBenefit80EE: boolean;
  taxBenefitSection37: boolean;
  hasMoratoriumOption: boolean;
  moratoriumMonths?: number;
  payoffPriority: number; // 1 (highest = pay first) to 10 (lowest)
  payoffPriorityReason: string;
  commonLenders: string[];
}

export const LOAN_TYPE_FINANCIALS: Record<LoanType, LoanTypeFinancials> = {
  home: {
    defaultRatePA: 0.085,
    defaultTenureMonths: 240,
    defaultAmountINR: 5000000,
    typicalRateMin: 0.08,
    typicalRateMax: 0.105,
    typicalTenureMin: 60,
    typicalTenureMax: 360,
    hasPrepaymentPenalty: false,
    rbiZeroPenaltyApplies: true,
    taxBenefit80C: true,
    taxBenefit24b: true,
    taxBenefit80E: false,
    taxBenefit80EE: false,
    taxBenefitSection37: false,
    hasMoratoriumOption: false,
    payoffPriority: 8,
    payoffPriorityReason:
      "Lowest effective rate after Section 24(b) tax benefit. Home loan at 8.5% costs ~6.3% after-tax in 30% bracket.",
    commonLenders: [
      "SBI",
      "HDFC Bank",
      "ICICI Bank",
      "Axis Bank",
      "Kotak Mahindra Bank",
      "Bank of Baroda",
    ],
  },
  car: {
    defaultRatePA: 0.095,
    defaultTenureMonths: 60,
    defaultAmountINR: 800000,
    typicalRateMin: 0.085,
    typicalRateMax: 0.14,
    typicalTenureMin: 12,
    typicalTenureMax: 84,
    hasPrepaymentPenalty: true,
    prepaymentPenaltyPercent: 0.03,
    prepaymentLockInMonths: 6,
    rbiZeroPenaltyApplies: false,
    taxBenefit80C: false,
    taxBenefit24b: false,
    taxBenefit80E: false,
    taxBenefit80EE: false,
    taxBenefitSection37: false,
    hasMoratoriumOption: false,
    payoffPriority: 4,
    payoffPriorityReason:
      "No tax benefit, vehicle depreciates. Pay off faster than home loan but after personal loans and credit cards.",
    commonLenders: [
      "SBI",
      "HDFC Bank",
      "ICICI Bank",
      "Kotak Mahindra Bank",
      "Cholamandalam Finance",
    ],
  },
  two_wheeler: {
    defaultRatePA: 0.14,
    defaultTenureMonths: 36,
    defaultAmountINR: 120000,
    typicalRateMin: 0.1,
    typicalRateMax: 0.2,
    typicalTenureMin: 12,
    typicalTenureMax: 60,
    hasPrepaymentPenalty: true,
    prepaymentPenaltyPercent: 0.03,
    rbiZeroPenaltyApplies: false,
    taxBenefit80C: false,
    taxBenefit24b: false,
    taxBenefit80E: false,
    taxBenefit80EE: false,
    taxBenefitSection37: false,
    hasMoratoriumOption: false,
    payoffPriority: 3,
    payoffPriorityReason:
      "High rate, no tax benefit, rapidly depreciating asset. Pay off quickly.",
    commonLenders: [
      "Bajaj Finance",
      "HDFC Bank",
      "SBI",
      "Hero FinCorp",
      "TVS Credit",
    ],
  },
  personal: {
    defaultRatePA: 0.16,
    defaultTenureMonths: 36,
    defaultAmountINR: 500000,
    typicalRateMin: 0.11,
    typicalRateMax: 0.26,
    typicalTenureMin: 12,
    typicalTenureMax: 60,
    hasPrepaymentPenalty: true,
    prepaymentPenaltyPercent: 0.025,
    prepaymentLockInMonths: 6,
    rbiZeroPenaltyApplies: false,
    taxBenefit80C: false,
    taxBenefit24b: false,
    taxBenefit80E: false,
    taxBenefit80EE: false,
    taxBenefitSection37: false,
    hasMoratoriumOption: false,
    payoffPriority: 2,
    payoffPriorityReason:
      "High rate (11-24%), no tax benefit, no asset backing. Second only to credit cards in payoff priority.",
    commonLenders: [
      "HDFC Bank",
      "ICICI Bank",
      "Bajaj Finserv",
      "Tata Capital",
      "KreditBee",
      "MoneyTap",
      "Axis Bank",
    ],
  },
  education: {
    defaultRatePA: 0.105,
    defaultTenureMonths: 120,
    defaultAmountINR: 1000000,
    typicalRateMin: 0.08,
    typicalRateMax: 0.155,
    typicalTenureMin: 60,
    typicalTenureMax: 180,
    hasPrepaymentPenalty: false,
    rbiZeroPenaltyApplies: false,
    taxBenefit80C: false,
    taxBenefit24b: false,
    taxBenefit80E: true,
    taxBenefit80EE: false,
    taxBenefitSection37: false,
    hasMoratoriumOption: true,
    moratoriumMonths: 24,
    payoffPriority: 6,
    payoffPriorityReason:
      "Section 80E makes effective rate lower than headline. No upper limit on deduction. Moratorium means EMIs start later.",
    commonLenders: [
      "SBI",
      "Bank of Baroda",
      "Axis Bank",
      "HDFC Credila",
      "Avanse",
      "InCred",
    ],
  },
  gold: {
    defaultRatePA: 0.12,
    defaultTenureMonths: 12,
    defaultAmountINR: 200000,
    typicalRateMin: 0.08,
    typicalRateMax: 0.2,
    typicalTenureMin: 3,
    typicalTenureMax: 24,
    hasPrepaymentPenalty: false,
    rbiZeroPenaltyApplies: false,
    taxBenefit80C: false,
    taxBenefit24b: false,
    taxBenefit80E: false,
    taxBenefit80EE: false,
    taxBenefitSection37: false,
    hasMoratoriumOption: false,
    payoffPriority: 5,
    payoffPriorityReason:
      "Moderate rate but collateral risk is real — jewellery can be seized. Pay off to recover gold.",
    commonLenders: [
      "Muthoot Finance",
      "Manappuram",
      "IIFL Finance",
      "SBI",
      "HDFC Bank",
    ],
  },
  consumer_durable: {
    defaultRatePA: 0.18,
    defaultTenureMonths: 12,
    defaultAmountINR: 50000,
    typicalRateMin: 0.0,
    typicalRateMax: 0.26,
    typicalTenureMin: 3,
    typicalTenureMax: 24,
    hasPrepaymentPenalty: false,
    rbiZeroPenaltyApplies: false,
    taxBenefit80C: false,
    taxBenefit24b: false,
    taxBenefit80E: false,
    taxBenefit80EE: false,
    taxBenefitSection37: false,
    hasMoratoriumOption: false,
    payoffPriority: 3,
    payoffPriorityReason:
      '0% EMI has hidden processing fees (effective 15-20% PA). Short tenure means high opportunity cost. Clear quickly.',
    commonLenders: [
      "Bajaj Finserv",
      "HDFC Bank",
      "Tata Capital",
      "ZestMoney",
      "Kissht",
    ],
  },
  lap: {
    defaultRatePA: 0.11,
    defaultTenureMonths: 120,
    defaultAmountINR: 2000000,
    typicalRateMin: 0.09,
    typicalRateMax: 0.14,
    typicalTenureMin: 12,
    typicalTenureMax: 180,
    hasPrepaymentPenalty: false,
    rbiZeroPenaltyApplies: true,
    taxBenefit80C: false,
    taxBenefit24b: false,
    taxBenefit80E: false,
    taxBenefit80EE: false,
    taxBenefitSection37: false,
    hasMoratoriumOption: false,
    payoffPriority: 7,
    payoffPriorityReason:
      "Moderate rate, but property at risk. Usually lower priority than unsecured loans of similar rate.",
    commonLenders: [
      "HDFC Bank",
      "SBI",
      "ICICI Bank",
      "Bajaj Finance",
      "LIC Housing Finance",
    ],
  },
  medical: {
    defaultRatePA: 0.15,
    defaultTenureMonths: 36,
    defaultAmountINR: 300000,
    typicalRateMin: 0.12,
    typicalRateMax: 0.2,
    typicalTenureMin: 6,
    typicalTenureMax: 60,
    hasPrepaymentPenalty: true,
    prepaymentPenaltyPercent: 0.025,
    rbiZeroPenaltyApplies: false,
    taxBenefit80C: false,
    taxBenefit24b: false,
    taxBenefit80E: false,
    taxBenefit80EE: false,
    taxBenefitSection37: false,
    hasMoratoriumOption: false,
    payoffPriority: 2,
    payoffPriorityReason:
      "High rate, no tax benefit. Treat like personal loan — pay off quickly.",
    commonLenders: [
      "HDFC Bank",
      "ICICI Bank",
      "Bajaj Finserv",
      "CreditMantri",
      "Tata Capital",
    ],
  },
  other: {
    defaultRatePA: 0.14,
    defaultTenureMonths: 36,
    defaultAmountINR: 200000,
    typicalRateMin: 0.1,
    typicalRateMax: 0.24,
    typicalTenureMin: 6,
    typicalTenureMax: 120,
    hasPrepaymentPenalty: true,
    prepaymentPenaltyPercent: 0.025,
    rbiZeroPenaltyApplies: false,
    taxBenefit80C: false,
    taxBenefit24b: false,
    taxBenefit80E: false,
    taxBenefit80EE: false,
    taxBenefitSection37: false,
    hasMoratoriumOption: false,
    payoffPriority: 5,
    payoffPriorityReason: "Unknown type — assume moderate priority.",
    commonLenders: [],
  },
};

// ─── Helper functions ─────────────────────────────────────────

export function getLoanTypeDefaults(type: LoanType) {
  const fin = LOAN_TYPE_FINANCIALS[type];
  const disp = LOAN_TYPE_DISPLAY[type];
  return {
    type,
    label: disp.label,
    defaultRatePA: fin.defaultRatePA,
    defaultTenureMonths: fin.defaultTenureMonths,
    defaultAmountINR: fin.defaultAmountINR,
  };
}

/**
 * Returns whether this loan type benefits from the RBI floating-rate
 * zero prepayment penalty rule.
 * CRITICAL: This is NOT universal — only home loans and LAP with
 * floating rates are protected.
 */
export function isRBIZeroPenaltyApplicable(
  type: LoanType,
  rateType: "fixed" | "floating"
): boolean {
  const config = LOAN_TYPE_FINANCIALS[type];
  return config.rbiZeroPenaltyApplies && rateType === "floating";
}

/**
 * Returns the effective tax-adjusted annual rate for payoff comparison.
 * Home loans and education loans are cheaper in real terms due to deductions.
 */
export function getEffectiveAnnualRate(
  type: LoanType,
  nominalRatePA: number,
  taxBracketPercent: number = 0.3
): {
  effectiveRate: number;
  taxSavingPA: number;
  explanation: string;
} {
  const config = LOAN_TYPE_FINANCIALS[type];
  const loanAmount = config.defaultAmountINR;

  if (config.taxBenefit24b && type === "home") {
    const annualInterest = loanAmount * nominalRatePA;
    const deductibleInterest = Math.min(annualInterest, 200000);
    const taxSaving = deductibleInterest * taxBracketPercent;
    const effectiveRate = nominalRatePA - taxSaving / loanAmount;
    return {
      effectiveRate,
      taxSavingPA: taxSaving,
      explanation: `Section 24(b) deduction reduces effective rate from ${(nominalRatePA * 100).toFixed(1)}% to ~${(effectiveRate * 100).toFixed(1)}% for ${(taxBracketPercent * 100).toFixed(0)}% tax bracket`,
    };
  }

  if (config.taxBenefit80E && type === "education") {
    const annualInterest = loanAmount * nominalRatePA;
    const taxSaving = annualInterest * taxBracketPercent;
    const effectiveRate = nominalRatePA * (1 - taxBracketPercent);
    return {
      effectiveRate,
      taxSavingPA: taxSaving,
      explanation: `Section 80E: 100% interest deductible (no cap). Effective rate = ${(nominalRatePA * 100).toFixed(1)}% × (1 - ${(taxBracketPercent * 100).toFixed(0)}%) = ${(effectiveRate * 100).toFixed(1)}%`,
    };
  }

  return {
    effectiveRate: nominalRatePA,
    taxSavingPA: 0,
    explanation: `No tax benefit — effective rate equals nominal rate of ${(nominalRatePA * 100).toFixed(1)}%`,
  };
}

/**
 * Sorts loans by payoff priority (which to clear first).
 */
export function sortByPayoffPriority(
  loans: Array<{
    type: LoanType;
    ratePA: number;
    outstanding: number;
    taxBracketPercent?: number;
  }>
): Array<{
  type: LoanType;
  ratePA: number;
  outstanding: number;
  effectiveRatePA: number;
  priority: number;
  reason: string;
}> {
  return loans
    .map((loan) => {
      const config = LOAN_TYPE_FINANCIALS[loan.type];
      const { effectiveRate } = getEffectiveAnnualRate(
        loan.type,
        loan.ratePA,
        loan.taxBracketPercent ?? 0.3
      );
      return {
        ...loan,
        effectiveRatePA: effectiveRate,
        priority: config.payoffPriority,
        reason: config.payoffPriorityReason,
      };
    })
    .sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.effectiveRatePA - a.effectiveRatePA;
    });
}

/**
 * Returns the 0% EMI true cost calculation for consumer durable loans.
 */
export function calculateConsumerEMITrueCost(params: {
  purchasePrice: number;
  tenureMonths: number;
  processingFeePercent: number;
}): {
  processingFee: number;
  effectiveAnnualRate: number;
  totalCostVsCash: number;
  isTrulyCostFree: boolean;
} {
  const { purchasePrice, tenureMonths, processingFeePercent } = params;
  const processingFee = purchasePrice * processingFeePercent;

  const effectiveAnnualRate =
    processingFeePercent > 0
      ? (2 * processingFeePercent * 12) / (tenureMonths + 1)
      : 0;

  return {
    processingFee,
    effectiveAnnualRate,
    totalCostVsCash: processingFee,
    isTrulyCostFree: processingFeePercent === 0 && processingFee === 0,
  };
}
