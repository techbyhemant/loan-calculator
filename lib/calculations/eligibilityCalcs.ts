/**
 * Home loan eligibility calculations.
 * Pure functions — no React, no async, no side effects.
 */

const DEFAULT_FOIR_RATIO = 0.5;

export function calculateMaxEMI(
  monthlyIncome: number,
  existingEMIs: number,
  foirRatio: number = DEFAULT_FOIR_RATIO,
): number {
  return monthlyIncome * foirRatio - existingEMIs;
}

export function calculateMaxLoan(
  maxEMI: number,
  annualRate: number,
  tenureYears: number,
): number {
  if (maxEMI <= 0) return 0;
  const r = annualRate / 12 / 100;
  const n = tenureYears * 12;
  if (r === 0) return maxEMI * n;
  return (maxEMI * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
}
