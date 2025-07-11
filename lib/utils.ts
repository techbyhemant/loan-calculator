import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface LoanCalculationInput {
  amount: number;
  rate: number; // annual interest rate in percent
  tenure: number; // years
  partPayments?: Record<number, number>; // schedule index to part-payment amount
  partPaymentMode?: "emi" | "tenure";
  emiIncreases?: Record<number, { type: "percent" | "value"; value: number }>; // schedule index to increase
}

export interface AmortizationRow {
  year: number;
  month: number;
  principal: number;
  interest: number;
  total: number;
  balance: number;
}

export interface LoanCalculationResult {
  emi: number;
  totalInterest: number;
  totalPayment: number;
  schedule: AmortizationRow[];
}

export function calculateLoan({
  amount,
  rate,
  tenure,
  partPayments = {},
  partPaymentMode = "emi",
  emiIncreases = {},
}: LoanCalculationInput): LoanCalculationResult {
  const n = tenure * 12;
  const r = rate / 12 / 100;
  let balance = amount;
  let totalInterest = 0;
  const schedule: AmortizationRow[] = [];
  let remainingMonths = n;
  let emi =
    (balance * r * Math.pow(1 + r, remainingMonths)) /
    (Math.pow(1 + r, remainingMonths) - 1);
  let nextEmi = emi;

  for (let i = 0; i < n; i++) {
    // Apply EMI increase for this month (if any)
    if (emiIncreases[i]) {
      if (emiIncreases[i].type === "percent") {
        nextEmi = emi * (1 + emiIncreases[i].value / 100);
      } else if (emiIncreases[i].type === "value") {
        nextEmi = emi + emiIncreases[i].value;
      }
    }
    // Apply part-payment if any
    if (partPayments[i]) {
      balance -= partPayments[i];
      if (partPaymentMode === "emi") {
        // Recalculate EMI for remaining period, but apply from next month
        remainingMonths = n - i;
        nextEmi =
          balance > 0 && remainingMonths > 0
            ? (balance * r * Math.pow(1 + r, remainingMonths)) /
              (Math.pow(1 + r, remainingMonths) - 1)
            : 0;
      }
      // else, for 'tenure', keep EMI the same and let the loop run until balance <= 0
    }
    // Use the current EMI for this month
    const interest = balance * r;
    const principal = emi - interest;
    totalInterest += interest;
    balance -= principal;
    schedule.push({
      year: Math.floor(i / 12) + 1,
      month: (i % 12) + 1,
      principal: Math.max(principal, 0),
      interest: Math.max(interest, 0),
      total: Math.max(emi, 0),
      balance: Math.max(balance, 0),
    });
    emi = nextEmi; // Update EMI for next month
    if (balance <= 0) break;
  }

  return {
    emi: Math.round(emi),
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(amount + totalInterest),
    schedule,
  };
}
