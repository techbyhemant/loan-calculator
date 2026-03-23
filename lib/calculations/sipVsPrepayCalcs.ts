/**
 * SIP vs Prepayment comparison calculations.
 * Pure functions — no React, no async, no side effects.
 */

const LTCG_EXEMPTION = 125_000;
const LTCG_TAX_RATE = 0.125;
const SEC_24B_LIMIT = 200_000;

export interface PrepayResult {
  interestSaved: number;
  monthsReduced: number;
  netBenefit: number;
}

export interface SipResult {
  corpus: number;
  totalInvested: number;
  gains: number;
  ltcgTax: number;
  netCorpus: number;
}

export type Recommendation = "PREPAY" | "SIP" | "SPLIT";

function calculateEMI(
  principal: number,
  annualRate: number,
  months: number,
): number {
  if (annualRate === 0) return principal / months;
  const r = annualRate / 12 / 100;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

export function calculatePrepayBenefit(
  outstanding: number,
  annualRate: number,
  remainingMonths: number,
  monthlyExtra: number,
  taxBracket: number,
): PrepayResult {
  const r = annualRate / 12 / 100;
  const emi = calculateEMI(outstanding, annualRate, remainingMonths);

  let balance = outstanding;
  let originalInterest = 0;
  for (let i = 0; i < remainingMonths; i++) {
    const interest = balance * r;
    const principal = emi - interest;
    originalInterest += interest;
    balance -= principal;
    if (balance <= 0) break;
  }

  balance = outstanding;
  let newInterest = 0;
  let newMonths = 0;
  for (let i = 0; i < remainingMonths; i++) {
    const interest = balance * r;
    const principal = emi - interest + monthlyExtra;
    newInterest += interest;
    balance -= principal;
    newMonths++;
    if (balance <= 0) break;
  }

  const interestSaved = Math.max(0, originalInterest - newInterest);
  const monthsReduced = Math.max(0, remainingMonths - newMonths);

  const annualInterestSavedApprox = interestSaved / (remainingMonths / 12);
  const taxBenefitLost =
    Math.min(annualInterestSavedApprox, SEC_24B_LIMIT) *
    (taxBracket / 100) *
    (remainingMonths / 12);

  const netBenefit = interestSaved - taxBenefitLost;

  return { interestSaved, monthsReduced, netBenefit };
}

export function calculateSipBenefit(
  monthlyExtra: number,
  remainingMonths: number,
  sipReturnPercent: number,
): SipResult {
  const monthlyRate = sipReturnPercent / 12 / 100;
  const n = remainingMonths;

  const corpus =
    monthlyRate === 0
      ? monthlyExtra * n
      : monthlyExtra *
        ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate) *
        (1 + monthlyRate);

  const totalInvested = monthlyExtra * n;
  const gains = corpus - totalInvested;
  const taxableGains = Math.max(0, gains - LTCG_EXEMPTION);
  const ltcgTax = taxableGains * LTCG_TAX_RATE;
  const netCorpus = corpus - ltcgTax;

  return { corpus, totalInvested, gains, ltcgTax, netCorpus };
}
