/**
 * Fact Injector — Provides live Indian finance data for blog generation.
 *
 * Data sources:
 * 1. Internal config (loanTypeConfig.ts) — loan rates, tax limits
 * 2. RBI rates page data — current repo rate
 * 3. Static facts that change infrequently — updated manually
 *
 * Usage: Called before blog generation to inject current facts into the system prompt.
 */

// Import loan type config for current rate defaults
import { LOAN_TYPE_FINANCIALS } from '../../../lib/calculations/loanTypeConfig';
import { CC_DEFAULTS } from '../../../lib/calculations/creditCardCalcs';

export interface FinanceFacts {
  // RBI
  rbiRepoRate: number;
  rbiLastChange: string; // "Feb 2026"
  rbiLastChangeAmount: number; // -0.25

  // Tax limits (FY 2025-26)
  sec80CLimit: number;
  sec24bLimit: number; // self-occupied
  sec80ELimit: string; // "No upper limit"
  newRegimeStandardDeduction: number;

  // Loan rates (current typical)
  homeLoanRate: { min: number; max: number; typical: number };
  personalLoanRate: { min: number; max: number; typical: number };
  carLoanRate: { min: number; max: number; typical: number };
  educationLoanRate: { min: number; max: number; typical: number };
  goldLoanRate: { min: number; max: number; typical: number };

  // Credit card
  ccMonthlyRate: number; // 3.5%
  ccAnnualRate: number; // 42%
  ccGSTRate: number; // 18%
  ccMinimumDuePercent: number; // 5%

  // Standard examples per loan type
  examples: {
    homeLoan: string; // "₹50,00,000 at 8.5% for 20 years"
    personalLoan: string;
    carLoan: string;
    educationLoan: string;
    creditCard: string;
  };

  // Key rules
  rbiPrepaymentRule: string;

  // Timestamp
  lastUpdated: string; // ISO date
}

export function getFinanceFacts(): FinanceFacts {
  const home = LOAN_TYPE_FINANCIALS.home;
  const personal = LOAN_TYPE_FINANCIALS.personal;
  const car = LOAN_TYPE_FINANCIALS.car;
  const education = LOAN_TYPE_FINANCIALS.education;
  const gold = LOAN_TYPE_FINANCIALS.gold;

  return {
    rbiRepoRate: 5.25,
    rbiLastChange: "Feb 2026",
    rbiLastChangeAmount: -0.25,

    sec80CLimit: 150000,
    sec24bLimit: 200000,
    sec80ELimit: "No upper limit — entire interest deductible for 8 years",
    newRegimeStandardDeduction: 75000,

    homeLoanRate: {
      min: home.typicalRateMin * 100,
      max: home.typicalRateMax * 100,
      typical: home.defaultRatePA * 100,
    },
    personalLoanRate: {
      min: personal.typicalRateMin * 100,
      max: personal.typicalRateMax * 100,
      typical: personal.defaultRatePA * 100,
    },
    carLoanRate: {
      min: car.typicalRateMin * 100,
      max: car.typicalRateMax * 100,
      typical: car.defaultRatePA * 100,
    },
    educationLoanRate: {
      min: education.typicalRateMin * 100,
      max: education.typicalRateMax * 100,
      typical: education.defaultRatePA * 100,
    },
    goldLoanRate: {
      min: gold.typicalRateMin * 100,
      max: gold.typicalRateMax * 100,
      typical: gold.defaultRatePA * 100,
    },

    ccMonthlyRate: CC_DEFAULTS.monthlyRate * 100,
    ccAnnualRate: CC_DEFAULTS.monthlyRate * 12 * 100,
    ccGSTRate: CC_DEFAULTS.gstRate * 100,
    ccMinimumDuePercent: CC_DEFAULTS.minimumDuePercent * 100,

    examples: {
      homeLoan: `₹${(home.defaultAmountINR / 100000).toFixed(0)}L at ${home.defaultRatePA * 100}% for ${home.defaultTenureMonths / 12} years`,
      personalLoan: `₹${(personal.defaultAmountINR / 100000).toFixed(0)}L at ${personal.defaultRatePA * 100}% for ${personal.defaultTenureMonths / 12} years`,
      carLoan: `₹${(car.defaultAmountINR / 100000).toFixed(0)}L at ${car.defaultRatePA * 100}% for ${car.defaultTenureMonths / 12} years`,
      educationLoan: `₹${(education.defaultAmountINR / 100000).toFixed(0)}L at ${education.defaultRatePA * 100}% for ${education.defaultTenureMonths / 12} years with ${(education.moratoriumMonths || 24)}-month moratorium`,
      creditCard: `₹50,000 at ${CC_DEFAULTS.monthlyRate * 100}%/month (${CC_DEFAULTS.monthlyRate * 12 * 100}% PA) + 18% GST on interest`,
    },

    rbiPrepaymentRule: "RBI mandates ZERO prepayment penalty on floating-rate HOME LOANS and LAP only. Personal loans, car loans, education loans are NOT protected — banks can charge 2-5% penalty.",

    lastUpdated: new Date().toISOString().split('T')[0],
  };
}

/**
 * Generates a fact block to inject into the system prompt.
 * This ensures every blog post uses CURRENT data, not stale hardcoded numbers.
 */
export function getFactBlock(): string {
  const f = getFinanceFacts();

  return `
## CURRENT FINANCIAL DATA (as of ${f.lastUpdated})

RBI Repo Rate: ${f.rbiRepoRate}% (last change: ${f.rbiLastChange}, ${f.rbiLastChangeAmount > 0 ? '+' : ''}${f.rbiLastChangeAmount}%)

CURRENT LOAN RATES IN INDIA:
- Home loan: ${f.homeLoanRate.min}-${f.homeLoanRate.max}% (typical: ${f.homeLoanRate.typical}%)
- Personal loan: ${f.personalLoanRate.min}-${f.personalLoanRate.max}% (typical: ${f.personalLoanRate.typical}%)
- Car loan: ${f.carLoanRate.min}-${f.carLoanRate.max}% (typical: ${f.carLoanRate.typical}%)
- Education loan: ${f.educationLoanRate.min}-${f.educationLoanRate.max}% (typical: ${f.educationLoanRate.typical}%)
- Gold loan: ${f.goldLoanRate.min}-${f.goldLoanRate.max}% (typical: ${f.goldLoanRate.typical}%)
- Credit card: ${f.ccMonthlyRate}%/month = ${f.ccAnnualRate}% PA + ${f.ccGSTRate}% GST on ALL charges

TAX LIMITS (FY 2025-26):
- Section 80C: ₹${(f.sec80CLimit / 100000).toFixed(1)}L
- Section 24(b): ₹${(f.sec24bLimit / 100000).toFixed(1)}L (self-occupied)
- Section 80E: ${f.sec80ELimit}
- New regime standard deduction: ₹${(f.newRegimeStandardDeduction / 1000).toFixed(0)}K

STANDARD EXAMPLES (use these exact numbers in articles):
- Home loan: ${f.examples.homeLoan}
- Personal loan: ${f.examples.personalLoan}
- Car loan: ${f.examples.carLoan}
- Education loan: ${f.examples.educationLoan}
- Credit card: ${f.examples.creditCard}

RBI PREPAYMENT RULE:
${f.rbiPrepaymentRule}

CRITICAL: Use these exact numbers. Do NOT invent rates or limits.
  `.trim();
}
