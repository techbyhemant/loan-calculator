/**
 * Home loan tax benefit calculations.
 * Pure functions — no React, no async, no side effects.
 */

const SEC_80C_LIMIT = 150_000;
const SEC_24B_SELF_OCCUPIED_LIMIT = 200_000;

export interface TaxCalcResult {
  sec24Deduction: number;
  sec80CDeduction: number;
  sec80EDeduction: number;
  totalDeduction: number;
  oldRegimeTax: { at10: number; at20: number; at30: number };
  newRegimeTax: { at10: number; at20: number; at30: number };
  oldRegimeSaved: number;
  newRegimeSaved: number;
  recommendedRegime: "old" | "new";
}

export function calculateTaxBenefit(
  annualPrincipal: number,
  annualInterest: number,
  grossIncome: number,
  other80C: number,
  loanType: "self-occupied" | "rented-out",
  educationLoanInterest: number = 0,
): TaxCalcResult {
  const sec24Deduction =
    loanType === "self-occupied"
      ? Math.min(annualInterest, SEC_24B_SELF_OCCUPIED_LIMIT)
      : annualInterest;

  const remaining80C = Math.max(0, SEC_80C_LIMIT - other80C);
  const sec80CDeduction = Math.min(annualPrincipal, remaining80C);

  // Section 80E: entire education loan interest is deductible (NO upper limit)
  // Available for 8 years from start of repayment
  const sec80EDeduction = Math.max(0, educationLoanInterest);

  const totalDeduction = sec24Deduction + sec80CDeduction + sec80EDeduction;

  const oldRegimeTax = {
    at10: Math.round(totalDeduction * 0.1),
    at20: Math.round(totalDeduction * 0.2),
    at30: Math.round(totalDeduction * 0.3),
  };

  const newRegimeDeduction = loanType === "rented-out" ? sec24Deduction : 0;
  // Note: 80E is available only under the old regime
  const newRegimeTax = {
    at10: Math.round(newRegimeDeduction * 0.1),
    at20: Math.round(newRegimeDeduction * 0.2),
    at30: Math.round(newRegimeDeduction * 0.3),
  };

  let effectiveRate = 0.3;
  if (grossIncome <= 500_000) effectiveRate = 0.05;
  else if (grossIncome <= 750_000) effectiveRate = 0.1;
  else if (grossIncome <= 1_000_000) effectiveRate = 0.15;
  else if (grossIncome <= 1_250_000) effectiveRate = 0.2;
  else if (grossIncome <= 1_500_000) effectiveRate = 0.25;

  const oldRegimeSaved = Math.round(totalDeduction * effectiveRate);
  const newRegimeSaved = Math.round(newRegimeDeduction * effectiveRate);
  const recommendedRegime = oldRegimeSaved >= newRegimeSaved ? "old" : "new";

  return {
    sec24Deduction,
    sec80CDeduction,
    sec80EDeduction,
    totalDeduction,
    oldRegimeTax,
    newRegimeTax,
    oldRegimeSaved,
    newRegimeSaved,
    recommendedRegime,
  };
}
