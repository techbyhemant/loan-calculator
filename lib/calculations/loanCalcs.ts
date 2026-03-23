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

export function calculateRemainingInterest(loan: Loan): number {
  const rows = calculateAmortization(
    loan.currentOutstanding,
    loan.interestRate,
    loan.tenureMonths,
    new Date(loan.startDate),
  );
  return rows.reduce((sum, row) => sum + row.interest, 0);
}

export function calculateDebtFreeDate(loans: Loan[]): Date | null {
  const active = loans.filter((l) => l.isActive);
  if (!active.length) return null;
  return active
    .map((l) => {
      const rows = calculateAmortization(
        l.currentOutstanding,
        l.interestRate,
        l.tenureMonths,
        new Date(l.startDate),
      );
      return rows[rows.length - 1].date;
    })
    .reduce((latest, d) => (d > latest ? d : latest));
}

export function calculateWeightedAverageRate(loans: Loan[]): number {
  const total = loans.reduce((s, l) => s + l.currentOutstanding, 0);
  if (total === 0) return 0;
  return loans.reduce(
    (w, l) => w + (l.interestRate * l.currentOutstanding) / total,
    0,
  );
}

export function calculateDashboardStats(loans: Loan[]): DashboardStats {
  const active = loans.filter((l) => l.isActive);
  return {
    totalDebt: active.reduce((s, l) => s + l.currentOutstanding, 0),
    monthlyEmiTotal: active.reduce((s, l) => s + l.emiAmount, 0),
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
