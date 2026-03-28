/**
 * Loan consolidation analysis.
 * Pure functions. No React. No async. No side effects.
 */

import type { Loan, ConsolidationAnalysis, ConsolidationVerdict } from "@/types";

import { calculateAmortization, calculateWeightedAverageRate } from "./loanCalcs";

function getVerdict(netSaving: number): ConsolidationVerdict {
  if (netSaving > 10_000) return "BENEFICIAL";
  if (netSaving > 0) return "MARGINAL";
  return "NOT_RECOMMENDED";
}

export function analyzeConsolidation(
  loans: Loan[],
  proposedRate: number,
  proposedTenureMonths: number,
  processingFeePercent: number,
): ConsolidationAnalysis {
  const active = loans.filter((l) => l.isActive);

  const currentWeightedRate = calculateWeightedAverageRate(active);
  const totalOutstanding = active.reduce(
    (s, l) => s + l.currentOutstanding,
    0,
  );

  // Current total interest across all loans
  let currentTotalInterest = 0;
  for (const loan of active) {
    const rows = calculateAmortization(
      loan.currentOutstanding,
      loan.interestRate,
      loan.tenureMonths,
      new Date(loan.startDate),
    );
    currentTotalInterest += rows.reduce((sum, r) => sum + r.interest, 0);
  }

  // Consolidated loan interest
  const consolidatedRows = calculateAmortization(
    totalOutstanding,
    proposedRate,
    proposedTenureMonths,
    new Date(),
  );
  const newTotalInterest = consolidatedRows.reduce(
    (sum, r) => sum + r.interest,
    0,
  );

  const processingFee = totalOutstanding * (processingFeePercent / 100);

  // Prepayment penalties for fixed-rate loans
  const prepaymentPenalties = active.reduce((sum, l) => {
    if (l.rateType === "floating") return sum; // RBI: 0 penalty for floating
    return sum + l.currentOutstanding * (l.prepaymentPenalty / 100);
  }, 0);

  const grossSaving = currentTotalInterest - newTotalInterest;
  const netSaving = grossSaving - processingFee - prepaymentPenalties;

  const verdict = getVerdict(netSaving);

  // Which loans benefit from consolidation (rate > proposed rate)
  const loansToConsolidate = active
    .filter((l) => l.interestRate > proposedRate)
    .map((l) => l.id);
  const loansToKeep = active
    .filter((l) => l.interestRate <= proposedRate)
    .map((l) => l.id);

  // Break-even: months until savings exceed fees
  const monthlyCurrentEMI = active.reduce((s, l) => s + l.emiAmount, 0);
  const consolidatedEMI =
    consolidatedRows.length > 0 ? consolidatedRows[0].emi : 0;
  const monthlySaving = monthlyCurrentEMI - consolidatedEMI;
  const breakEvenMonths =
    monthlySaving > 0
      ? Math.ceil((processingFee + prepaymentPenalties) / monthlySaving)
      : 0;

  let recommendation: string;
  if (verdict === "BENEFICIAL") {
    recommendation = `Consolidating saves you ₹${Math.round(netSaving).toLocaleString("en-IN")} after all fees. Your weighted average rate drops from ${currentWeightedRate.toFixed(1)}% to ${proposedRate}%.`;
  } else if (verdict === "MARGINAL") {
    recommendation = `Marginal saving of ₹${Math.round(netSaving).toLocaleString("en-IN")}. Consider only if you also want to simplify to a single EMI.`;
  } else {
    recommendation = `Not recommended. You'd pay ₹${Math.round(Math.abs(netSaving)).toLocaleString("en-IN")} more after fees and penalties.`;
  }

  const showAffiliate = verdict === "BENEFICIAL" && netSaving > 25_000;

  return {
    currentWeightedRate,
    proposedRate,
    currentTotalInterest,
    newTotalInterest,
    processingFee,
    prepaymentPenalties,
    netSaving,
    verdict,
    breakEvenMonths,
    loansToConsolidate,
    loansToKeep,
    recommendation,
    showAffiliate,
  };
}
