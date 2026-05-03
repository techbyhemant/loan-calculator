/**
 * Payoff strategy calculations — avalanche vs snowball.
 * Pure functions. No React. No async. No side effects.
 */

import type {
  Loan,
  PayoffResult,
  StrategyComparison,
  AttackOrderItem,
  PayoffMilestone,
} from "@/types";

import { calculateAmortization } from "./loanCalcs";

interface SimulationOutput {
  totalInterest: number;
  months: number;
  // month index (1-based) at which each loan was fully paid off
  payoffMonth: Map<string, number>;
}

function simulatePayoff(
  loans: Loan[],
  monthlyExtra: number,
  order: Loan[],
): SimulationOutput {
  const balances = new Map<string, number>();
  const payoffMonth = new Map<string, number>();
  loans.forEach((l) => balances.set(l.id, l.currentOutstanding));

  let totalInterest = 0;
  let months = 0;
  const maxMonths = 600; // 50 year cap

  while (months < maxMonths) {
    const activeLoans = loans.filter((l) => (balances.get(l.id) ?? 0) > 0.01);
    if (activeLoans.length === 0) break;

    months++;
    let extraRemaining = monthlyExtra;

    // Pay regular EMIs on all active loans
    for (const loan of activeLoans) {
      const balance = balances.get(loan.id) ?? 0;
      const r = loan.interestRate / 12 / 100;
      const interest = balance * r;
      totalInterest += interest;
      const principalPaid = Math.min(loan.emiAmount - interest, balance);
      balances.set(loan.id, Math.max(0, balance - principalPaid));
    }

    // Apply extra payment in priority order. As loans die, the freed EMI
    // also rolls in (snowball effect): we add the EMIs of paid-off loans
    // back into the extra pool starting next month.
    for (const loan of order) {
      if (extraRemaining <= 0) break;
      const balance = balances.get(loan.id) ?? 0;
      if (balance <= 0.01) continue;
      const payment = Math.min(extraRemaining, balance);
      balances.set(loan.id, Math.max(0, balance - payment));
      extraRemaining -= payment;
    }

    // Stamp payoff month for any loan that died this cycle.
    for (const loan of activeLoans) {
      if ((balances.get(loan.id) ?? 0) <= 0.01 && !payoffMonth.has(loan.id)) {
        payoffMonth.set(loan.id, months);
      }
    }
  }

  return { totalInterest, months, payoffMonth };
}

function buildMilestones(
  loans: Loan[],
  payoffMonth: Map<string, number>,
): PayoffMilestone[] {
  const now = new Date();
  return loans
    .map((l) => {
      const m = payoffMonth.get(l.id) ?? 0;
      const date = new Date(now);
      date.setMonth(date.getMonth() + m);
      return {
        loanId: l.id,
        loanName: l.name,
        monthsFromNow: m,
        payoffDate: date,
        freedEmi: l.emiAmount,
      };
    })
    .sort((a, b) => a.monthsFromNow - b.monthsFromNow);
}

function calculateCurrentPayoff(loans: Loan[]): PayoffResult {
  let totalInterest = 0;
  let maxMonths = 0;
  const payoffMonth = new Map<string, number>();

  for (const loan of loans) {
    const rows = calculateAmortization(
      loan.currentOutstanding,
      loan.interestRate,
      loan.tenureMonths,
      new Date(loan.startDate),
    );
    totalInterest += rows.reduce((sum, r) => sum + r.interest, 0);
    payoffMonth.set(loan.id, rows.length);
    maxMonths = Math.max(maxMonths, rows.length);
  }

  const debtFreeDate = new Date();
  debtFreeDate.setMonth(debtFreeDate.getMonth() + maxMonths);

  const attackOrder: AttackOrderItem[] = loans.map((l, i) => ({
    loanId: l.id,
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
    milestones: buildMilestones(loans, payoffMonth),
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

  const { totalInterest, months, payoffMonth } = simulatePayoff(
    loans,
    monthlyExtra,
    orderedLoans,
  );

  const debtFreeDate = new Date();
  debtFreeDate.setMonth(debtFreeDate.getMonth() + months);

  const attackOrder: AttackOrderItem[] = orderedLoans.map((l, i) => ({
    loanId: l.id,
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
    milestones: buildMilestones(loans, payoffMonth),
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
      "Both strategies finish nearly the same. Pick snowball if you want quick wins, or avalanche for the math-optimal result.";
  } else if (recommended === "avalanche") {
    explanation = `Avalanche saves ${formatINRSimple(interestDifference)} more in interest by attacking your highest-rate loan first.`;
  } else {
    explanation = `Snowball clears small loans first, freeing up EMI capacity faster and finishing ${monthsDifference} months earlier.`;
  }

  const currentMonthlyOutflow = active.reduce((sum, l) => sum + l.emiAmount, 0);

  return {
    current,
    avalanche,
    snowball,
    recommended,
    interestDifference,
    monthsDifference,
    explanation,
    currentMonthlyOutflow,
  };
}

function formatINRSimple(n: number): string {
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}
