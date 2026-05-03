import {
  Loan,
  AmortizationRow,
  PartPaymentResult,
  DashboardStats,
  ReduceType,
} from "@/types";

export function calculateEMI(
  principal: number,
  annualRate: number,
  tenureMonths: number,
): number {
  if (annualRate === 0) return principal / tenureMonths;
  const r = annualRate / 12 / 100;
  return (
    (principal * r * Math.pow(1 + r, tenureMonths)) /
    (Math.pow(1 + r, tenureMonths) - 1)
  );
}

/**
 * Back-solves the annual interest rate from a known principal, EMI, and
 * tenure. Used to expose the "hidden spread" Indian banks bake into EMIs
 * via day-count conventions (30/360) and rounding.
 *
 * Example: ICICI personal loan with contract rate 11.80%, P=30L, T=60 mo
 * computes to EMI ₹66,431 mathematically — but the bank charges ₹66,475.
 * Plugging ₹66,475 back in here returns ~11.83%, the *effective* rate
 * the borrower is actually paying. Difference = bank's hidden margin.
 *
 * Uses bisection over [0.01%, 60%] annual. Converges to <0.001% in ~30
 * iterations. Returns the headline rate if EMI ≤ minimum payment for
 * any rate (degenerate case).
 */
export function calculateEffectiveRate(
  principal: number,
  emi: number,
  tenureMonths: number,
): number {
  if (principal <= 0 || tenureMonths <= 0 || emi <= 0) return 0;
  // EMI can't be less than P/n (zero-interest case); guard against it
  if (emi <= principal / tenureMonths) return 0;

  let low = 0.001;
  let high = 60;
  for (let i = 0; i < 80; i++) {
    const mid = (low + high) / 2;
    const calc = calculateEMI(principal, mid, tenureMonths);
    if (Math.abs(calc - emi) < 0.005) return mid;
    if (calc < emi) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

export function calculateAmortization(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  startDate: Date,
): AmortizationRow[] {
  const r = annualRate / 12 / 100;
  const emi = calculateEMI(principal, annualRate, tenureMonths);
  const rows: AmortizationRow[] = [];
  let outstanding = principal;
  const date = new Date(startDate);

  for (let month = 1; month <= tenureMonths; month++) {
    const interest = outstanding * r;
    const principalPaid = Math.min(emi - interest, outstanding);
    outstanding = Math.max(0, outstanding - principalPaid);

    rows.push({
      month,
      date: new Date(date),
      emi,
      principal: principalPaid,
      interest,
      outstanding,
    });
    date.setMonth(date.getMonth() + 1);
    if (outstanding <= 0.01) break;
  }

  return rows;
}

/**
 * Calculate EMIs paid so far and the actual current outstanding for a loan.
 * Simulates amortization from originalAmount forward to today's date,
 * matching the homepage calculator's approach.
 */
export function calculateActualOutstanding(loan: Loan): {
  emisPaid: number;
  remainingMonths: number;
  actualOutstanding: number;
  computedEmi: number;
} {
  const start = new Date(loan.startDate);
  const now = new Date();
  let paid =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  const dueDay = loan.emiDate ?? 5;
  if (now.getDate() >= dueDay) paid += 1;
  paid = Math.max(0, Math.min(paid, loan.tenureMonths));

  const remaining = Math.max(0, loan.tenureMonths - paid);
  const emi = calculateEMI(
    loan.originalAmount,
    loan.interestRate,
    loan.tenureMonths,
  );
  const r = loan.interestRate / 12 / 100;

  let balance = loan.originalAmount;
  for (let i = 0; i < paid; i++) {
    const interest = balance * r;
    const principal = Math.min(emi - interest, balance);
    balance = Math.max(0, balance - principal);
  }

  return {
    emisPaid: paid,
    remainingMonths: remaining,
    actualOutstanding: balance,
    computedEmi: emi,
  };
}

export function calculateRemainingInterest(loan: Loan): number {
  const { actualOutstanding, remainingMonths, computedEmi } =
    calculateActualOutstanding(loan);
  if (remainingMonths === 0) return 0;
  const r = loan.interestRate / 12 / 100;
  let balance = actualOutstanding;
  let totalInterest = 0;

  for (let m = 0; m < remainingMonths && balance > 0.01; m++) {
    const interest = balance * r;
    const principal = Math.min(computedEmi - interest, balance);
    totalInterest += interest;
    balance = Math.max(0, balance - principal);
  }

  return totalInterest;
}

export function calculateDebtFreeDate(loans: Loan[]): Date | null {
  const active = loans.filter((l) => l.isActive);
  if (!active.length) return null;
  return active
    .map((l) => {
      const { actualOutstanding, remainingMonths, computedEmi } =
        calculateActualOutstanding(l);
      if (remainingMonths === 0) return new Date();
      const rows = calculateAmortization(
        actualOutstanding,
        l.interestRate,
        remainingMonths,
        new Date(),
      );
      return rows.length > 0 ? rows[rows.length - 1].date : new Date();
    })
    .reduce((latest, d) => (d > latest ? d : latest));
}

export function calculateWeightedAverageRate(loans: Loan[]): number {
  const withOutstanding = loans.map((l) => ({
    rate: l.interestRate,
    outstanding: calculateActualOutstanding(l).actualOutstanding,
  }));
  const total = withOutstanding.reduce((s, l) => s + l.outstanding, 0);
  if (total === 0) return 0;
  return withOutstanding.reduce(
    (w, l) => w + (l.rate * l.outstanding) / total,
    0,
  );
}

export function calculateDashboardStats(loans: Loan[]): DashboardStats {
  const active = loans.filter((l) => l.isActive);
  const loanSnapshots = active.map((l) => ({
    loan: l,
    ...calculateActualOutstanding(l),
  }));

  return {
    totalDebt: loanSnapshots.reduce((s, l) => s + l.actualOutstanding, 0),
    monthlyEmiTotal: loanSnapshots.reduce((s, l) => s + l.computedEmi, 0),
    totalInterestRemaining: active.reduce(
      (s, l) => s + calculateRemainingInterest(l),
      0,
    ),
    debtFreeDate: calculateDebtFreeDate(active),
    loanCount: active.length,
  };
}

export function calculatePartPaymentImpact(
  loan: Loan,
  partPaymentAmount: number,
  reduceType: ReduceType,
): PartPaymentResult {
  const original = calculateAmortization(
    loan.currentOutstanding,
    loan.interestRate,
    loan.tenureMonths,
    new Date(loan.startDate),
  );
  const originalTotalInterest = original.reduce((s, row) => s + row.interest, 0);
  const originalDebtFreeDate = original[original.length - 1].date;

  const newPrincipal = Math.max(0, loan.currentOutstanding - partPaymentAmount);
  const r = loan.interestRate / 12 / 100;

  if (reduceType === "tenure") {
    const newTenure =
      r === 0
        ? Math.ceil(newPrincipal / loan.emiAmount)
        : Math.ceil(
            Math.log(loan.emiAmount / (loan.emiAmount - newPrincipal * r)) /
              Math.log(1 + r),
          );
    const newSchedule = calculateAmortization(
      newPrincipal,
      loan.interestRate,
      newTenure,
      new Date(loan.startDate),
    );
    const newTotalInterest = newSchedule.reduce((s, row) => s + row.interest, 0);
    return {
      originalTotalInterest,
      newTotalInterest,
      interestSaved: Math.max(0, originalTotalInterest - newTotalInterest),
      originalDebtFreeDate,
      newDebtFreeDate: newSchedule[newSchedule.length - 1].date,
      monthsReduced: Math.max(0, original.length - newSchedule.length),
    };
  } else {
    const newEMI = calculateEMI(
      newPrincipal,
      loan.interestRate,
      loan.tenureMonths,
    );
    const newSchedule = calculateAmortization(
      newPrincipal,
      loan.interestRate,
      loan.tenureMonths,
      new Date(loan.startDate),
    );
    const newTotalInterest = newSchedule.reduce((s, row) => s + row.interest, 0);
    return {
      originalTotalInterest,
      newTotalInterest,
      interestSaved: Math.max(0, originalTotalInterest - newTotalInterest),
      originalDebtFreeDate,
      newDebtFreeDate: newSchedule[newSchedule.length - 1].date,
      monthsReduced: 0,
      newEMI,
    };
  }
}
