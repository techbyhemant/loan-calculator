/**
 * Credit Card Calculation Engine — pure functions, no React, no async.
 *
 * Credit cards are REVOLVING credit, fundamentally different from amortizing loans:
 *   - No fixed end date
 *   - Interest = 3.5%/month = 42% PA (standard India)
 *   - Daily rate = monthly / 30
 *   - Minimum due = max(outstanding × 5%, ₹200)
 *   - If you pay less than full outstanding, interest is charged on the
 *     ENTIRE balance from TRANSACTION DATE — not just the remaining amount
 *   - NO prepayment penalties, NO tax benefits
 */

// ============================================================
// CONSTANTS
// ============================================================

export const CC_DEFAULTS = {
  monthlyRate: 0.035, // 3.5% per month = 42% per annum (standard India)
  dailyRate: 0.035 / 30, // ~0.1167% per day
  minimumDuePercent: 0.05, // 5% of outstanding
  minimumDueFloor: 200, // ₹200 minimum
  billingCycleDays: 30, // standard billing cycle
  interestFreePeriod: 20, // days after statement date
} as const;

// ============================================================
// CORE TYPES
// ============================================================

export interface CreditCardInput {
  outstanding: number;
  monthlyRate?: number; // defaults to 0.035
}

export interface PersonalLoanInput {
  amount: number;
  annualRate: number; // e.g. 0.15 for 15%
  tenureMonths: number;
  processingFeePercent?: number; // e.g. 0.02 for 2%
}

export interface CCMonthlyBreakdown {
  month: number;
  openingBalance: number;
  payment: number;
  interestCharged: number;
  principalPaid: number;
  closingBalance: number;
}

export interface CCPayoffResult {
  monthsToPayoff: number;
  totalInterestPaid: number;
  totalAmountPaid: number;
  monthlyBreakdown: CCMonthlyBreakdown[];
  isNeverPayoff: boolean; // true if payment <= monthly interest
}

export interface CCMinimumDueResult {
  monthsToPayoff: number; // usually 96-180 months
  totalInterestPaid: number; // usually 3-5x the original balance
  totalAmountPaid: number;
  yearsToPayoff: number;
  extraInterestVsFixedPayment: number; // how much MORE you pay vs fixed payment
}

export interface CCScenarioComparison {
  minimumDue: CCPayoffResult;
  fixedPayment: CCPayoffResult;
  fullClearance: {
    interestPaid: number; // 0 if paid within interest-free period
    saving: number; // saving vs minimum due
  };
  recommendedMonthlyPayment: number; // to clear in 12 months
  recommended24MonthPayment: number; // to clear in 24 months
}

export interface CCVsPersonalLoanResult {
  ccMonthlyPayment: number;
  ccTotalInterest: number;
  ccMonthsToPayoff: number;
  plMonthlyEMI: number;
  plTotalInterest: number;
  plProcessingFee: number;
  plNetSaving: number; // positive = PL saves money
  plBreakEvenMonths: number; // months until PL starts saving
  recommendation: "PERSONAL_LOAN" | "KEEP_CC" | "MARGINAL";
  recommendationReason: string;
}

export interface CardPayoffSchedule {
  cardName: string;
  outstanding: number;
  monthlyRate: number;
  monthsToPayoff: number;
  totalInterest: number;
  payoffOrder: number;
}

export interface MultiCardPayoffResult {
  avalanche: {
    cards: CardPayoffSchedule[];
    totalInterest: number;
    totalMonths: number;
    order: string[]; // card names in payoff order
  };
  snowball: {
    cards: CardPayoffSchedule[];
    totalInterest: number;
    totalMonths: number;
    order: string[];
  };
  interestSavedByAvalanche: number;
  recommendation: "AVALANCHE" | "SNOWBALL";
  recommendationReason: string;
}

export interface CreditUtilization {
  utilized: number;
  limit: number;
  utilizationPercent: number;
  status: "EXCELLENT" | "GOOD" | "WARNING" | "CRITICAL";
  statusLabel: string;
  cibilImpact: string;
  recommendation: string;
}

// ============================================================
// CORE CALCULATION: MONTHLY PAYOFF
// ============================================================

/**
 * Calculate credit card payoff schedule for a fixed monthly payment.
 * Uses standard revolving credit formula.
 */
export function calculateCCPayoff(
  input: CreditCardInput,
  monthlyPayment: number
): CCPayoffResult {
  const { outstanding, monthlyRate = CC_DEFAULTS.monthlyRate } = input;

  // If payment doesn't cover monthly interest, debt never clears
  const monthlyInterestOnFull = outstanding * monthlyRate;
  if (monthlyPayment <= monthlyInterestOnFull) {
    return {
      monthsToPayoff: Infinity,
      totalInterestPaid: Infinity,
      totalAmountPaid: Infinity,
      monthlyBreakdown: [],
      isNeverPayoff: true,
    };
  }

  const breakdown: CCMonthlyBreakdown[] = [];
  let balance = outstanding;
  let totalInterest = 0;
  let totalPaid = 0;
  let month = 0;
  const MAX_MONTHS = 600; // safety cap — 50 years

  while (balance > 0.5 && month < MAX_MONTHS) {
    month++;
    const openingBalance = balance;
    const interestCharged = balance * monthlyRate;
    const actualPayment = Math.min(monthlyPayment, balance + interestCharged);
    const principalPaid = actualPayment - interestCharged;
    const closingBalance = Math.max(0, balance - principalPaid);

    breakdown.push({
      month,
      openingBalance: roundTo2(openingBalance),
      payment: roundTo2(actualPayment),
      interestCharged: roundTo2(interestCharged),
      principalPaid: roundTo2(principalPaid),
      closingBalance: roundTo2(closingBalance),
    });

    totalInterest += interestCharged;
    totalPaid += actualPayment;
    balance = closingBalance;
  }

  return {
    monthsToPayoff: month,
    totalInterestPaid: roundTo2(totalInterest),
    totalAmountPaid: roundTo2(totalPaid),
    monthlyBreakdown: breakdown,
    isNeverPayoff: false,
  };
}

// ============================================================
// MINIMUM DUE TRAP CALCULATION
// ============================================================

/**
 * Calculate the devastating effect of paying only minimum due.
 * Minimum due = max(outstanding × 5%, ₹200)
 * The trap: minimum due shrinks as balance shrinks, so you never get to zero quickly.
 */
export function calculateMinimumDueTrap(
  input: CreditCardInput
): CCMinimumDueResult {
  const { outstanding, monthlyRate = CC_DEFAULTS.monthlyRate } = input;

  let balance = outstanding;
  let totalInterest = 0;
  let totalPaid = 0;
  let month = 0;
  const MAX_MONTHS = 1200; // 100 years safety cap

  while (balance > 1 && month < MAX_MONTHS) {
    month++;
    const interestCharged = balance * monthlyRate;
    const minDue = Math.max(
      balance * CC_DEFAULTS.minimumDuePercent,
      CC_DEFAULTS.minimumDueFloor
    );
    // Payment can't exceed balance + interest
    const payment = Math.min(minDue, balance + interestCharged);
    const principalPaid = payment - interestCharged;

    // If min due doesn't even cover interest (near-zero balance edge case)
    if (principalPaid <= 0) {
      balance = balance + interestCharged - payment;
    } else {
      balance = Math.max(0, balance - principalPaid);
    }

    totalInterest += interestCharged;
    totalPaid += payment;
  }

  // Calculate what a fixed 12-month payment would cost for comparison
  const recommended12Month = calculateFixedPaymentForTarget(input, 12);
  const fixedPayoffResult = calculateCCPayoff(input, recommended12Month);

  return {
    monthsToPayoff: month,
    totalInterestPaid: roundTo2(totalInterest),
    totalAmountPaid: roundTo2(totalPaid),
    yearsToPayoff: Math.round((month / 12) * 10) / 10,
    extraInterestVsFixedPayment: roundTo2(
      totalInterest - fixedPayoffResult.totalInterestPaid
    ),
  };
}

// ============================================================
// SCENARIO COMPARISON
// ============================================================

/**
 * Compare 3 payment strategies side by side.
 */
export function calculateCCScenarios(
  input: CreditCardInput
): CCScenarioComparison {
  const recommended12 = calculateFixedPaymentForTarget(input, 12);
  const recommended24 = calculateFixedPaymentForTarget(input, 24);

  // Minimum due scenario
  const minimumDueTrap = calculateMinimumDueTrap(input);
  const minimumDueAsPayoff: CCPayoffResult = {
    monthsToPayoff: minimumDueTrap.monthsToPayoff,
    totalInterestPaid: minimumDueTrap.totalInterestPaid,
    totalAmountPaid: minimumDueTrap.totalAmountPaid,
    monthlyBreakdown: [],
    isNeverPayoff: false,
  };

  // Fixed payment scenario (using 12-month target)
  const fixedPayoff = calculateCCPayoff(input, recommended12);

  return {
    minimumDue: minimumDueAsPayoff,
    fixedPayment: fixedPayoff,
    fullClearance: {
      interestPaid: 0, // zero interest if paid within interest-free period
      saving: minimumDueTrap.totalInterestPaid,
    },
    recommendedMonthlyPayment: roundTo2(recommended12),
    recommended24MonthPayment: roundTo2(recommended24),
  };
}

// ============================================================
// CREDIT CARD VS PERSONAL LOAN
// ============================================================

/**
 * Should the user take a personal loan to clear CC debt?
 * Honest comparison including processing fees.
 * Only recommend PL if net saving > ₹5,000.
 */
export function compareCCVsPersonalLoan(
  cc: CreditCardInput,
  pl: PersonalLoanInput
): CCVsPersonalLoanResult {
  const ccMonthlyRate = cc.monthlyRate ?? CC_DEFAULTS.monthlyRate;
  const plMonthlyRate = pl.annualRate / 12;
  const processingFeePercent = pl.processingFeePercent ?? 0.02;

  // CC payoff with fixed payment (using PL tenure as benchmark)
  const ccFixedPayment = calculateFixedPaymentForTarget(cc, pl.tenureMonths);
  const ccResult = calculateCCPayoff(cc, ccFixedPayment);

  // Personal loan EMI calculation
  const plEMI = calculateEMI(pl.amount, plMonthlyRate, pl.tenureMonths);
  const plTotalPaid = plEMI * pl.tenureMonths;
  const plTotalInterest = plTotalPaid - pl.amount;
  const plProcessingFee = pl.amount * processingFeePercent;

  // Net saving = CC interest - (PL interest + processing fee)
  const netSaving =
    ccResult.totalInterestPaid - (plTotalInterest + plProcessingFee);

  let recommendation: "PERSONAL_LOAN" | "KEEP_CC" | "MARGINAL";
  let recommendationReason: string;

  if (netSaving > 5000) {
    recommendation = "PERSONAL_LOAN";
    recommendationReason = `Taking a personal loan saves ₹${formatINRLocal(netSaving)} after accounting for the ${(processingFeePercent * 100).toFixed(1)}% processing fee (₹${formatINRLocal(plProcessingFee)}).`;
  } else if (netSaving > 1000) {
    recommendation = "MARGINAL";
    recommendationReason = `Net saving is only ₹${formatINRLocal(netSaving)} — marginal benefit after processing fee. Only worth it if the PL also helps your CIBIL score or monthly cash flow.`;
  } else {
    recommendation = "KEEP_CC";
    recommendationReason = `After the ₹${formatINRLocal(plProcessingFee)} processing fee, there is little to no saving. Focus on paying the credit card directly with ₹${formatINRLocal(ccFixedPayment)}/month.`;
  }

  // Break-even: months until PL cumulative interest < CC cumulative interest
  let ccCumulative = 0;
  let plCumulative = plProcessingFee; // PL starts with processing fee
  let breakEven = 0;
  let ccBal = cc.outstanding;
  let plBal = pl.amount;

  for (let m = 1; m <= pl.tenureMonths; m++) {
    const ccInterest = ccBal * ccMonthlyRate;
    ccCumulative += ccInterest;
    ccBal = Math.max(0, ccBal - (ccFixedPayment - ccInterest));

    const plInterest = plBal * plMonthlyRate;
    plCumulative += plInterest;
    plBal = Math.max(0, plBal - (plEMI - plInterest));

    if (plCumulative < ccCumulative && breakEven === 0) {
      breakEven = m;
    }
  }

  return {
    ccMonthlyPayment: roundTo2(ccFixedPayment),
    ccTotalInterest: roundTo2(ccResult.totalInterestPaid),
    ccMonthsToPayoff: ccResult.monthsToPayoff,
    plMonthlyEMI: roundTo2(plEMI),
    plTotalInterest: roundTo2(plTotalInterest),
    plProcessingFee: roundTo2(plProcessingFee),
    plNetSaving: roundTo2(netSaving),
    plBreakEvenMonths: breakEven,
    recommendation,
    recommendationReason,
  };
}

// ============================================================
// MULTI-CARD PAYOFF STRATEGIES
// ============================================================

/**
 * Compare avalanche (highest rate first) vs snowball (lowest balance first).
 * Both strategies assume a fixed total monthly budget across all cards.
 */
export function calculateMultiCardPayoff(
  cards: Array<{ name: string; outstanding: number; monthlyRate?: number }>,
  totalMonthlyBudget: number
): MultiCardPayoffResult {
  // Sort for avalanche: highest rate first
  const avalancheOrder = [...cards].sort(
    (a, b) =>
      (b.monthlyRate ?? CC_DEFAULTS.monthlyRate) -
      (a.monthlyRate ?? CC_DEFAULTS.monthlyRate)
  );

  // Sort for snowball: lowest balance first
  const snowballOrder = [...cards].sort(
    (a, b) => a.outstanding - b.outstanding
  );

  const avalancheResult = runMultiCardStrategy(
    avalancheOrder,
    totalMonthlyBudget
  );
  const snowballResult = runMultiCardStrategy(
    snowballOrder,
    totalMonthlyBudget
  );

  const interestSavedByAvalanche =
    snowballResult.totalInterest - avalancheResult.totalInterest;

  return {
    avalanche: {
      ...avalancheResult,
      order: avalancheOrder.map((c) => c.name),
    },
    snowball: {
      ...snowballResult,
      order: snowballOrder.map((c) => c.name),
    },
    interestSavedByAvalanche: roundTo2(Math.max(0, interestSavedByAvalanche)),
    recommendation: interestSavedByAvalanche > 500 ? "AVALANCHE" : "SNOWBALL",
    recommendationReason:
      interestSavedByAvalanche > 500
        ? `Avalanche saves ₹${formatINRLocal(interestSavedByAvalanche)} in interest by clearing the highest-rate card first.`
        : `The interest difference is small (₹${formatINRLocal(Math.abs(interestSavedByAvalanche))}). Snowball keeps you motivated by clearing smaller cards faster — often leads to better follow-through.`,
  };
}

function runMultiCardStrategy(
  orderedCards: Array<{
    name: string;
    outstanding: number;
    monthlyRate?: number;
  }>,
  totalBudget: number
): {
  cards: CardPayoffSchedule[];
  totalInterest: number;
  totalMonths: number;
} {
  const balances = orderedCards.map((c) => ({
    name: c.name,
    balance: c.outstanding,
    rate: c.monthlyRate ?? CC_DEFAULTS.monthlyRate,
    totalInterest: 0,
    monthsToPayoff: 0,
  }));

  let month = 0;
  const MAX_MONTHS = 600;

  while (balances.some((b) => b.balance > 0.5) && month < MAX_MONTHS) {
    month++;
    let remainingBudget = totalBudget;

    // Pay minimum on all cards first
    for (const card of balances) {
      if (card.balance <= 0) continue;
      const interest = card.balance * card.rate;
      const minDue = Math.max(
        card.balance * CC_DEFAULTS.minimumDuePercent,
        CC_DEFAULTS.minimumDueFloor
      );
      const payment = Math.min(
        minDue,
        card.balance + interest,
        remainingBudget
      );
      card.totalInterest += interest;
      card.balance = Math.max(0, card.balance - (payment - interest));
      remainingBudget -= payment;
      if (remainingBudget < 0) remainingBudget = 0;
    }

    // Apply remaining budget to focus card (first in order with balance > 0)
    for (const card of balances) {
      if (card.balance <= 0 || remainingBudget <= 0) continue;
      const extra = Math.min(remainingBudget, card.balance);
      card.balance = Math.max(0, card.balance - extra);
      remainingBudget -= extra;
      break; // only apply extra to focus card
    }

    // Record payoff month for cards that cleared this month
    balances.forEach((card) => {
      if (card.balance <= 0.5 && card.monthsToPayoff === 0) {
        card.monthsToPayoff = month;
      }
    });
  }

  return {
    cards: balances.map((b, i) => ({
      cardName: b.name,
      outstanding: orderedCards[i].outstanding,
      monthlyRate: b.rate,
      monthsToPayoff: b.monthsToPayoff || month,
      totalInterest: roundTo2(b.totalInterest),
      payoffOrder: i + 1,
    })),
    totalInterest: roundTo2(
      balances.reduce((sum, b) => sum + b.totalInterest, 0)
    ),
    totalMonths: month,
  };
}

// ============================================================
// CREDIT UTILIZATION
// ============================================================

export function calculateCreditUtilization(
  totalOutstanding: number,
  totalLimit: number
): CreditUtilization {
  const percent =
    totalLimit > 0 ? (totalOutstanding / totalLimit) * 100 : 0;

  let status: CreditUtilization["status"];
  let statusLabel: string;
  let cibilImpact: string;
  let recommendation: string;

  if (percent <= 10) {
    status = "EXCELLENT";
    statusLabel = "Excellent";
    cibilImpact = "Positive — very low utilization boosts CIBIL score";
    recommendation = "Great. Maintain utilization below 30% for best CIBIL health.";
  } else if (percent <= 30) {
    status = "GOOD";
    statusLabel = "Good";
    cibilImpact = "Neutral to positive — within healthy range";
    recommendation = "Healthy range. Try to keep it below 30%.";
  } else if (percent <= 50) {
    status = "WARNING";
    statusLabel = "High";
    cibilImpact = "Negative — above 30% starts hurting CIBIL score";
    recommendation = `Pay down ₹${formatINRLocal(totalOutstanding - totalLimit * 0.3)} to bring utilization below 30%.`;
  } else {
    status = "CRITICAL";
    statusLabel = "Very High";
    cibilImpact =
      "Significantly negative — hurting CIBIL score and loan eligibility";
    recommendation = `Urgent: Pay down ₹${formatINRLocal(totalOutstanding - totalLimit * 0.3)} to bring utilization below 30%. High utilization is the fastest way to lower your CIBIL score.`;
  }

  return {
    utilized: roundTo2(totalOutstanding),
    limit: totalLimit,
    utilizationPercent: roundTo2(percent),
    status,
    statusLabel,
    cibilImpact,
    recommendation,
  };
}

// ============================================================
// INTEREST-FREE PERIOD EXPLAINER
// ============================================================

/**
 * Explains the interest-free period trap:
 * If you pay less than full outstanding, interest is charged
 * on the ENTIRE balance from the TRANSACTION DATE.
 */
export function calculateInterestFreePeriodImpact(params: {
  outstandingBeforePayment: number;
  paymentMade: number;
  daysSinceOldestTransaction: number;
  monthlyRate?: number;
}): {
  interestCharged: number;
  interestFreePeriodLost: boolean;
  costOfPayingLess: number;
  explanation: string;
} {
  const rate = params.monthlyRate ?? CC_DEFAULTS.monthlyRate;
  const dailyRate = rate / 30;

  const interestFreePeriodLost =
    params.paymentMade < params.outstandingBeforePayment;

  if (!interestFreePeriodLost) {
    return {
      interestCharged: 0,
      interestFreePeriodLost: false,
      costOfPayingLess: 0,
      explanation:
        "You paid the full outstanding. No interest charged. Interest-free period preserved for next cycle.",
    };
  }

  // Interest on full balance from transaction date
  const remaining = params.outstandingBeforePayment - params.paymentMade;
  const interestOnOldBalance =
    params.outstandingBeforePayment *
    dailyRate *
    params.daysSinceOldestTransaction;
  const interestOnRemaining = remaining * rate; // next month's interest on remaining

  const totalInterest = interestOnOldBalance + interestOnRemaining;

  return {
    interestCharged: roundTo2(totalInterest),
    interestFreePeriodLost: true,
    costOfPayingLess: roundTo2(totalInterest),
    explanation: `By paying ₹${formatINRLocal(params.paymentMade)} instead of the full ₹${formatINRLocal(params.outstandingBeforePayment)}, you lost the interest-free period. Interest of ₹${formatINRLocal(totalInterest)} will be charged on the ENTIRE ₹${formatINRLocal(params.outstandingBeforePayment)} from the date of your oldest transaction — not just on the remaining ₹${formatINRLocal(remaining)}.`,
  };
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function calculateEMI(
  principal: number,
  monthlyRate: number,
  months: number
): number {
  if (monthlyRate === 0) return principal / months;
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1)
  );
}

/**
 * Calculate the fixed monthly payment needed to clear debt in N months.
 * Standard PMT formula.
 */
export function calculateFixedPaymentForTarget(
  input: CreditCardInput,
  targetMonths: number
): number {
  const r = input.monthlyRate ?? CC_DEFAULTS.monthlyRate;
  const pv = input.outstanding;
  if (r === 0) return pv / targetMonths;
  return (
    (pv * r * Math.pow(1 + r, targetMonths)) /
    (Math.pow(1 + r, targetMonths) - 1)
  );
}

function roundTo2(n: number): number {
  return Math.round(n * 100) / 100;
}

function formatINRLocal(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}
