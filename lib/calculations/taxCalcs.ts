/**
 * Tax benefit calculations for the dashboard.
 * Calculates actual tax benefits from user's loan portfolio.
 * Pure functions. No React. No async. No side effects.
 */

import type { Loan, TaxBenefit, TaxProfile } from "@/types";

const SEC_80C_LIMIT = 150_000;
const SEC_24B_SELF_OCCUPIED_LIMIT = 200_000;

// Old regime slab rates (FY 2024-25 onwards)
const OLD_REGIME_SLABS = [
  { limit: 250_000, rate: 0 },
  { limit: 500_000, rate: 0.05 },
  { limit: 1_000_000, rate: 0.2 },
  { limit: Infinity, rate: 0.3 },
];

// New regime slab rates (FY 2024-25 onwards)
const NEW_REGIME_SLABS = [
  { limit: 300_000, rate: 0 },
  { limit: 700_000, rate: 0.05 },
  { limit: 1_000_000, rate: 0.1 },
  { limit: 1_200_000, rate: 0.15 },
  { limit: 1_500_000, rate: 0.2 },
  { limit: Infinity, rate: 0.3 },
];

function calculateTaxOnIncome(
  income: number,
  slabs: { limit: number; rate: number }[],
): number {
  let remaining = income;
  let tax = 0;
  let prev = 0;

  for (const slab of slabs) {
    const taxable = Math.min(remaining, slab.limit - prev);
    if (taxable <= 0) break;
    tax += taxable * slab.rate;
    remaining -= taxable;
    prev = slab.limit;
  }

  return tax;
}

export function calculateLoanTaxBenefits(
  loans: Loan[],
  profile: TaxProfile,
): TaxBenefit {
  const homeLoans = loans.filter(
    (l) => l.isActive && l.type === "home",
  );

  // Estimate annual interest and principal from EMI schedule
  let totalAnnualInterest = 0;
  let totalAnnualPrincipal = 0;

  for (const loan of homeLoans) {
    const r = loan.interestRate / 12 / 100;
    // First year interest/principal approximation from current outstanding
    for (let m = 0; m < 12; m++) {
      const outstanding =
        loan.currentOutstanding -
        totalAnnualPrincipal; // simplified
      const interest = Math.max(0, outstanding * r);
      const principal = Math.max(0, loan.emiAmount - interest);
      totalAnnualInterest += interest;
      totalAnnualPrincipal += principal;
    }
  }

  // Section 24(b): Interest deduction (max 2L for self-occupied)
  const sec24Deduction = Math.min(
    totalAnnualInterest,
    SEC_24B_SELF_OCCUPIED_LIMIT,
  );

  // Section 80C: Principal repayment (shared 1.5L limit)
  const remaining80C = Math.max(
    0,
    SEC_80C_LIMIT - profile.existing80CInvestments,
  );
  const sec80CDeduction = Math.min(totalAnnualPrincipal, remaining80C);

  // Section 80EE/80EEA: Additional interest for first-time buyers
  // Simplified: not included in this version
  const sec80EDeduction = 0;

  const totalDeduction = sec24Deduction + sec80CDeduction + sec80EDeduction;

  // Old regime: full deductions apply
  const oldRegimeTaxable = Math.max(0, profile.grossIncome - totalDeduction);
  const oldRegimeTaxFull = calculateTaxOnIncome(
    profile.grossIncome,
    OLD_REGIME_SLABS,
  );
  const oldRegimeTaxReduced = calculateTaxOnIncome(
    oldRegimeTaxable,
    OLD_REGIME_SLABS,
  );
  const oldRegimeTaxSaved = oldRegimeTaxFull - oldRegimeTaxReduced;

  // New regime: no 80C, no 24(b) for self-occupied
  const newRegimeTaxFull = calculateTaxOnIncome(
    profile.grossIncome,
    NEW_REGIME_SLABS,
  );
  const newRegimeTaxSaved = 0; // No deductions in new regime for self-occupied

  // Compare total tax paid under each regime
  const oldRegimeTotalTax = oldRegimeTaxReduced;
  const newRegimeTotalTax = newRegimeTaxFull;
  const regimeDifference = Math.abs(oldRegimeTotalTax - newRegimeTotalTax);

  const taxSaved = Math.max(oldRegimeTaxSaved, newRegimeTaxSaved);

  return {
    sec24Deduction,
    sec80CDeduction,
    sec80EDeduction,
    totalDeduction,
    taxSaved,
    oldRegimeTaxSaved,
    newRegimeTaxSaved,
    recommendedRegime:
      oldRegimeTotalTax < newRegimeTotalTax ? "old" : "new",
    regimeDifference,
  };
}
