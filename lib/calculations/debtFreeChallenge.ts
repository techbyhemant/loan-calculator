/**
 * Debt-Free Challenge — gamification engine.
 * Computes milestones from existing loan + part payment data.
 * Pure functions. No React. No async. No side effects.
 */

import type { Loan } from "@/types";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
}

export interface ChallengeStatus {
  milestones: Milestone[];
  earned: number;
  total: number;
  level: string;
  nextMilestone: Milestone | null;
  debtFreeDate: Date | null;
  whatIfDebtFreeDate: Date | null;
}

interface PartPaymentRecord {
  amount: number;
  date: string;
  interestSaved: number;
}

function getPaymentStreakMonths(partPayments: PartPaymentRecord[]): number {
  if (partPayments.length === 0) return 0;

  const months = new Set<string>();
  for (const pp of partPayments) {
    const d = new Date(pp.date);
    months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  let streak = 0;
  const now = new Date();
  let checkYear = now.getFullYear();
  let checkMonth = now.getMonth() + 1;

  for (let i = 0; i < 24; i++) {
    const key = `${checkYear}-${String(checkMonth).padStart(2, "0")}`;
    if (months.has(key)) {
      streak++;
    } else if (streak > 0) {
      break;
    }
    checkMonth--;
    if (checkMonth === 0) {
      checkMonth = 12;
      checkYear--;
    }
  }

  return streak;
}

function getMaxPaidPercent(loans: Loan[]): number {
  if (loans.length === 0) return 0;
  return Math.max(
    ...loans.map((l) =>
      l.originalAmount > 0
        ? ((l.originalAmount - l.currentOutstanding) / l.originalAmount) * 100
        : 0,
    ),
  );
}

function calculateDebtFreeDateFromLoans(loans: Loan[]): Date | null {
  const active = loans.filter((l) => l.isActive && l.currentOutstanding > 0);
  if (active.length === 0) return null;

  let maxMonths = 0;
  for (const loan of active) {
    maxMonths = Math.max(maxMonths, loan.tenureMonths);
  }
  const d = new Date();
  d.setMonth(d.getMonth() + maxMonths);
  return d;
}

function calculateWhatIfDebtFreeDate(
  loans: Loan[],
  monthlyExtra: number,
): Date | null {
  const active = loans.filter((l) => l.isActive && l.currentOutstanding > 0);
  if (active.length === 0 || monthlyExtra <= 0) return null;

  // Simulate: apply extra to highest rate loan first (avalanche)
  const sorted = [...active].sort((a, b) => b.interestRate - a.interestRate);
  const balances = new Map<string, number>();
  sorted.forEach((l) => balances.set(l.id, l.currentOutstanding));

  let months = 0;
  const maxMonths = 600;

  while (months < maxMonths) {
    const remaining = sorted.filter((l) => (balances.get(l.id) ?? 0) > 0.01);
    if (remaining.length === 0) break;
    months++;

    let extra = monthlyExtra;

    for (const loan of remaining) {
      const bal = balances.get(loan.id) ?? 0;
      const r = loan.interestRate / 12 / 100;
      const interest = bal * r;
      const principalPaid = Math.max(0, loan.emiAmount - interest);
      balances.set(loan.id, Math.max(0, bal - principalPaid));
    }

    for (const loan of sorted) {
      if (extra <= 0) break;
      const bal = balances.get(loan.id) ?? 0;
      if (bal <= 0.01) continue;
      const payment = Math.min(extra, bal);
      balances.set(loan.id, Math.max(0, bal - payment));
      extra -= payment;
    }
  }

  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d;
}

export function computeChallenge(
  loans: Loan[],
  partPayments: PartPaymentRecord[],
  monthlyExtra: number,
): ChallengeStatus {
  const active = loans.filter((l) => l.isActive);
  const maxPaid = getMaxPaidPercent(active);
  const totalInterestSaved = partPayments.reduce(
    (sum, pp) => sum + pp.interestSaved,
    0,
  );
  const streak = getPaymentStreakMonths(partPayments);

  const milestones: Milestone[] = [
    {
      id: "first-loan",
      title: "Loan Tracker",
      description: "Added your first loan",
      icon: "clipboard-list",
      earned: loans.length >= 1,
    },
    {
      id: "first-pp",
      title: "First Strike",
      description: "Made your first part payment",
      icon: "zap",
      earned: partPayments.length >= 1,
    },
    {
      id: "paid-10",
      title: "10% Down",
      description: "Paid off 10% of a loan",
      icon: "sprout",
      earned: maxPaid >= 10,
    },
    {
      id: "paid-25",
      title: "Quarter Way",
      description: "Paid off 25% of a loan",
      icon: "leaf",
      earned: maxPaid >= 25,
    },
    {
      id: "paid-50",
      title: "Halfway Hero",
      description: "Paid off 50% of a loan",
      icon: "trophy",
      earned: maxPaid >= 50,
    },
    {
      id: "paid-75",
      title: "Debt Crusher",
      description: "Paid off 75% of a loan",
      icon: "flame",
      earned: maxPaid >= 75,
    },
    {
      id: "saved-1l",
      title: "Lakh Saver",
      description: "Saved ₹1 lakh in interest",
      icon: "piggy-bank",
      earned: totalInterestSaved >= 100_000,
    },
    {
      id: "saved-5l",
      title: "Five Lakh Club",
      description: "Saved ₹5 lakh in interest",
      icon: "gem",
      earned: totalInterestSaved >= 500_000,
    },
    {
      id: "streak-3",
      title: "Hat Trick",
      description: "3 consecutive months of part payments",
      icon: "rocket",
      earned: streak >= 3,
    },
    {
      id: "streak-6",
      title: "Half Year Hero",
      description: "6 consecutive months of part payments",
      icon: "star",
      earned: streak >= 6,
    },
    {
      id: "streak-12",
      title: "Year of Discipline",
      description: "12 consecutive months of part payments",
      icon: "crown",
      earned: streak >= 12,
    },
  ];

  const earned = milestones.filter((m) => m.earned).length;
  const nextMilestone = milestones.find((m) => !m.earned) ?? null;

  let level: string;
  if (earned >= 9) level = "Debt-Free Legend";
  else if (earned >= 7) level = "Debt Warrior";
  else if (earned >= 5) level = "Smart Borrower";
  else if (earned >= 3) level = "Getting Started";
  else if (earned >= 1) level = "Beginner";
  else level = "New Member";

  return {
    milestones,
    earned,
    total: milestones.length,
    level,
    nextMilestone,
    debtFreeDate: calculateDebtFreeDateFromLoans(active),
    whatIfDebtFreeDate: calculateWhatIfDebtFreeDate(active, monthlyExtra),
  };
}
