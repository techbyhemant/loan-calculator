/**
 * Payoff strategy calculations — avalanche vs snowball.
 * Pure functions. No React. No async. No side effects.
 */

import type {
  Loan,
  PayoffResult,
  StrategyComparison,
  AttackOrderItem,
} from "@/types";

import { calculateAmortization } from "./loanCalcs";

function simulatePayoff(
  loans: Loan[],
  monthlyExtra: number,
  order: Loan[],
): { totalInterest: number; months: number } {
  const balances = new Map<string, number>();
  loans.forEach((l) => balances.set(l._id, l.currentOutstanding));

  let totalInterest = 0;
  let months = 0;
  const maxMonths = 600; // 50 year cap

  while (months < maxMonths) {
    const activeLoans = loans.filter((l) => (balances.get(l._id) ?? 0) > 0.01);
    if (activeLoans.length === 0) break;

    months++;
    let extraRemaining = monthlyExtra;

    // Pay regular EMIs on all active loans
    for (const loan of activeLoans) {
      const balance = balances.get(loan._id) ?? 0;
      const r = loan.interestRate / 12 / 100;
      const interest = balance * r;
      totalInterest += interest;
      const principalPaid = Math.min(loan.emiAmount - interest, balance);
      balances.set(loan._id, Math.max(0, balance - principalPaid));
    }

    // Apply extra payment in priority order
    for (const loan of order) {
      if (extraRemaining <= 0) break;
      const balance = balances.get(loan._id) ?? 0;
      if (balance <= 0.01) continue;
      const payment = Math.min(extraRemaining, balance);
      balances.set(loan._id, Math.max(0, balance - payment));
      extraRemaining -= payment;
    }
  }

  return { totalInterest, months };
}

function calculateCurrentPayoff(loans: Loan[]): PayoffResult {
  let totalInterest = 0;
  let maxMonths = 0;

  for (const loan of loans) {
    const rows = calculateAmortization(
      loan.currentOutstanding,
      loan.interestRate,
      loan.tenureMonths,
      new Date(loan.startDate),
    );
    totalInterest += rows.reduce((sum, r) => sum + r.interest, 0);
    maxMonths = Math.max(maxMonths, rows.length);
  }

  const debtFreeDate = new Date();
  debtFreeDate.setMonth(debtFreeDate.getMonth() + maxMonths);

  const attackOrder: AttackOrderItem[] = loans.map((l, i) => ({
    loanId: l._id,
    loanName: l.name,
    interestRate: l.interestRate,
    priority: i + 1,
    reason: "Equal distribution (current plan)",
  }));

  return {
    strategy: "current",
    totalInterest,
    interestSaved: 0,
    debtFreeDate,
    monthsEarlier: 0,
    attackOrder,
  };
}

function buildPayoffResult(
  strategy: "avalanche" | "snowball",
  loans: Loan[],
  monthlyExtra: number,
  currentResult: PayoffResult,
): PayoffResult {
  let orderedLoans: Loan[];
  let reasonTemplate: string;

  if (strategy === "avalanche") {
    orderedLoans = [...loans].sort((a, b) => b.interestRate - a.interestRate);
    reasonTemplate = "Highest interest rate";
  } else {
    orderedLoans = [...loans].sort(
      (a, b) => a.currentOutstanding - b.currentOutstanding,
    );
    reasonTemplate = "Smallest balance";
  }

  const { totalInterest, months } = simulatePayoff(
    loans,
    monthlyExtra,
    orderedLoans,
  );

  const debtFreeDate = new Date();
  debtFreeDate.setMonth(debtFreeDate.getMonth() + months);

  const attackOrder: AttackOrderItem[] = orderedLoans.map((l, i) => ({
    loanId: l._id,
    loanName: l.name,
    interestRate: l.interestRate,
    priority: i + 1,
    reason:
      i === 0
        ? `${reasonTemplate} — attack first`
        : `${reasonTemplate} priority #${i + 1}`,
  }));

  return {
    strategy,
    totalInterest,
    interestSaved: Math.max(0, currentResult.totalInterest - totalInterest),
    debtFreeDate,
    monthsEarlier: Math.max(
      0,
      Math.round(
        (currentResult.debtFreeDate.getTime() - debtFreeDate.getTime()) /
          (30 * 24 * 60 * 60 * 1000),
      ),
    ),
    attackOrder,
  };
}

export function compareStrategies(
  loans: Loan[],
  monthlyExtra: number,
): StrategyComparison {
  const active = loans.filter((l) => l.isActive);
  const current = calculateCurrentPayoff(active);
  const avalanche = buildPayoffResult("avalanche", active, monthlyExtra, current);
  const snowball = buildPayoffResult("snowball", active, monthlyExtra, current);

  const recommended =
    avalanche.interestSaved >= snowball.interestSaved ? "avalanche" : "snowball";

  const interestDifference = Math.abs(
    avalanche.interestSaved - snowball.interestSaved,
  );
  const monthsDifference = Math.abs(
    avalanche.monthsEarlier - snowball.monthsEarlier,
  );

  let explanation: string;
  if (interestDifference < 5000) {
    explanation =
      "Both strategies save nearly the same amount. Pick snowball if you want the motivation of quick wins, or avalanche for the mathematically optimal result.";
  } else if (recommended === "avalanche") {
    explanation = `Avalanche saves you ${formatINRSimple(interestDifference)} more in interest by targeting your highest-rate loan first. It's the mathematically optimal approach.`;
  } else {
    explanation = `Snowball gets you debt-free ${monthsDifference} months earlier by clearing small loans first, building momentum and freeing up EMI capacity faster.`;
  }

  return {
    current,
    avalanche,
    snowball,
    recommended,
    interestDifference,
    monthsDifference,
    explanation,
  };
}

function formatINRSimple(n: number): string {
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}
