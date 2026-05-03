/**
 * Loan-level what-if simulator.
 *
 * Pure functions — no React, no async, no side effects. Mirrors the homepage
 * calculator's simulation behaviour but operates on a single dashboard loan.
 *
 * Supports two scenario types stacked together:
 *  - "recurring" — extra `amount` paid every month from month `startMonth`
 *  - "lumpSum"   — one-time `amount` paid in month `startMonth`
 *
 * Both shrink the outstanding balance after the regular EMI is applied.
 */

export type SimulationScenarioType = "recurring" | "lumpSum";

export interface SimulationScenario {
  id: string;
  type: SimulationScenarioType;
  amount: number;
  // 1-based month index from "now". For recurring, it's the first month
  // the extra applies; for lumpSum, the only month it applies.
  startMonth: number;
}

export interface SimulationResult {
  baseline: {
    months: number;
    totalInterest: number;
    debtFreeDate: Date;
  };
  simulated: {
    months: number;
    totalInterest: number;
    debtFreeDate: Date;
  };
  monthsSaved: number;
  interestSaved: number;
}

function runAmortizationWithScenarios(
  outstanding: number,
  annualRate: number,
  emi: number,
  scenarios: SimulationScenario[],
): { months: number; totalInterest: number } {
  const r = annualRate / 12 / 100;
  let balance = outstanding;
  let totalInterest = 0;
  let months = 0;
  const maxMonths = 600; // 50-year cap

  while (balance > 0.01 && months < maxMonths) {
    months++;
    const interest = balance * r;
    totalInterest += interest;
    const principalPaid = Math.min(emi - interest, balance);
    balance = Math.max(0, balance - principalPaid);
    if (balance <= 0.01) break;

    // Apply each scenario that activates this month.
    for (const s of scenarios) {
      if (balance <= 0.01) break;
      if (s.amount <= 0) continue;
      const active =
        s.type === "recurring"
          ? months >= s.startMonth
          : months === s.startMonth;
      if (!active) continue;
      const apply = Math.min(s.amount, balance);
      balance = Math.max(0, balance - apply);
    }
  }

  return { months, totalInterest };
}

export function simulateLoanWithScenarios(
  outstanding: number,
  annualRate: number,
  emi: number,
  scenarios: SimulationScenario[],
): SimulationResult {
  const baseline = runAmortizationWithScenarios(
    outstanding,
    annualRate,
    emi,
    [],
  );
  const simulated = runAmortizationWithScenarios(
    outstanding,
    annualRate,
    emi,
    scenarios,
  );

  const now = new Date();
  const baselineDate = new Date(now);
  baselineDate.setMonth(baselineDate.getMonth() + baseline.months);
  const simulatedDate = new Date(now);
  simulatedDate.setMonth(simulatedDate.getMonth() + simulated.months);

  return {
    baseline: {
      months: baseline.months,
      totalInterest: baseline.totalInterest,
      debtFreeDate: baselineDate,
    },
    simulated: {
      months: simulated.months,
      totalInterest: simulated.totalInterest,
      debtFreeDate: simulatedDate,
    },
    monthsSaved: Math.max(0, baseline.months - simulated.months),
    interestSaved: Math.max(0, baseline.totalInterest - simulated.totalInterest),
  };
}
