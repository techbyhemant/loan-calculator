"use client";

import { useState, useMemo } from "react";
import { formatINR, formatLakhs, formatMonths } from "@/lib/utils/formatters";
import NumericInput from "@/components/ui/NumericInput";
import {
  CALC_INPUT_CLASS,
  CalcSection,
  StatCard,
  TableCard,
  Verdict,
  Callout,
  Label,
} from "./shared";
import { cn } from "@/lib/utils";
import { LoanInputMode } from "./LoanInputMode";
import type { LoanSnapshot } from "./LoanInputMode";

interface MonthRow {
  month: number;
  label: string;
  emi: number;
  principal: number;
  interest: number;
  partPayment: number;
  penalty: number;
  balance: number;
}

function generateSchedule(params: {
  outstanding: number;
  ratePA: number;
  emi: number;
  remainingMonths: number;
  partPayments: { month: number; amount: number }[];
  penaltyPercent: number;
  lockInMonths: number;
  startMonth: string;
}): { rows: MonthRow[]; totalInterest: number; totalPenalty: number } {
  const { outstanding, ratePA, emi, partPayments, penaltyPercent, lockInMonths, startMonth } = params;
  const monthlyRate = ratePA / 100 / 12;
  const ppMap = new Map(partPayments.map(pp => [pp.month, pp.amount]));

  let balance = outstanding;
  let totalInterest = 0;
  let totalPenalty = 0;
  const rows: MonthRow[] = [];
  const startDate = startMonth ? new Date(startMonth + "-01") : new Date();

  for (let m = 1; balance > 0.01 && m <= 600; m++) {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + m - 1);
    const label = d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });

    const interest = balance * monthlyRate;
    const principalPaid = Math.min(emi - interest, balance);

    if (principalPaid <= 0) break; // EMI doesn't cover interest

    balance = Math.max(0, balance - principalPaid);
    totalInterest += interest;

    let ppAmount = 0;
    let penaltyAmount = 0;

    if (ppMap.has(m) && balance > 0) {
      ppAmount = Math.min(ppMap.get(m)!, balance);
      // Penalty only applies after lock-in period
      penaltyAmount = m > lockInMonths ? ppAmount * (penaltyPercent / 100) : ppAmount * (penaltyPercent / 100);
      balance = Math.max(0, balance - ppAmount);
      totalPenalty += penaltyAmount;
    }

    rows.push({
      month: m,
      label,
      emi: Math.min(emi, principalPaid + interest),
      principal: principalPaid,
      interest,
      partPayment: ppAmount,
      penalty: penaltyAmount,
      balance,
    });

    if (balance <= 0) break;
  }

  return { rows, totalInterest, totalPenalty };
}

export default function PersonalLoanPayoffCalc() {
  // Loan details (single snapshot from LoanInputMode)
  const [loan, setLoan] = useState<LoanSnapshot | null>(null);

  // Prepayment penalty
  const [penaltyPercent, setPenaltyPercent] = useState<number | "">(3);
  const [lockInMonths, setLockInMonths] = useState<number | "">(6);

  // Part payments — user can add multiple
  const [partPayments, setPartPayments] = useState<{ month: number; amount: number }[]>([
    { month: 6, amount: 100000 },
  ]);

  const results = useMemo(() => {
    if (!loan) return null;

    const emi = loan.emi;
    const bal = loan.outstanding;
    const rate = loan.ratePA;
    const months = loan.remainingMonths;
    const penalty = (penaltyPercent as number) || 0;
    const lockIn = (lockInMonths as number) || 0;
    const startMonth = loan.startMonth;

    // Without prepayment
    const without = generateSchedule({
      outstanding: bal, ratePA: rate, emi, remainingMonths: months,
      partPayments: [], penaltyPercent: 0, lockInMonths: 0, startMonth,
    });

    // With prepayments
    const withPP = generateSchedule({
      outstanding: bal, ratePA: rate, emi, remainingMonths: months,
      partPayments: partPayments.filter(pp => pp.amount > 0),
      penaltyPercent: penalty, lockInMonths: lockIn, startMonth,
    });

    const interestSaved = without.totalInterest - withPP.totalInterest;
    const netSaving = interestSaved - withPP.totalPenalty;
    const monthsReduced = without.rows.length - withPP.rows.length;
    const totalPrepaid = partPayments.reduce((s, pp) => s + pp.amount, 0);

    let verdict: "WORTH_IT" | "MARGINAL" | "NOT_WORTH_IT";
    if (netSaving > 5000) verdict = "WORTH_IT";
    else if (netSaving >= 1000) verdict = "MARGINAL";
    else verdict = "NOT_WORTH_IT";

    return {
      emi,
      without,
      withPP,
      interestSaved,
      netSaving,
      monthsReduced,
      totalPenalty: withPP.totalPenalty,
      totalPrepaid,
      verdict,
      lockIn,
    };
  }, [loan, partPayments, penaltyPercent, lockInMonths]);

  const addPartPayment = () => {
    const lastMonth = partPayments.length > 0 ? partPayments[partPayments.length - 1].month : 0;
    setPartPayments([...partPayments, { month: lastMonth + 6, amount: 50000 }]);
  };

  const removePartPayment = (index: number) => {
    setPartPayments(partPayments.filter((_, i) => i !== index));
  };

  const updatePartPayment = (index: number, field: "month" | "amount", value: number) => {
    const updated = [...partPayments];
    updated[index] = { ...updated[index], [field]: value };
    setPartPayments(updated);
  };

  return (
    <div className="space-y-6">
      <LoanInputMode
        title="Your Personal Loan"
        onChange={setLoan}
        defaults={{ outstanding: 500000, rate: 16, remainingMonths: 36 }}
        rateHint="Typical: 11–18% for personal loans"
      />

      <CalcSection title="Prepayment Penalty">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Penalty on Prepayment (%)</Label>
            <NumericInput value={penaltyPercent} onChange={setPenaltyPercent} placeholder="3" min={0} max={10} step={0.5} className={CALC_INPUT_CLASS} />
            <p className="text-xs text-muted-foreground mt-1">Banks typically charge 2–5% on personal loans</p>
          </div>
          <div>
            <Label>Lock-in Period (months)</Label>
            <NumericInput value={lockInMonths} onChange={setLockInMonths} placeholder="6" min={0} max={24} className={CALC_INPUT_CLASS} />
            <p className="text-xs text-muted-foreground mt-1">Prepayment may not be allowed during lock-in</p>
          </div>
        </div>
      </CalcSection>

      <CalcSection title="Plan Your Prepayments">
        <p className="text-sm text-muted-foreground mb-4">
          Add one or more prepayments. Specify which month and how much — see how each one reduces your total interest.
        </p>

        <div className="space-y-3">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-[1fr_1fr_auto] gap-3 text-xs text-muted-foreground font-medium px-1">
            <span>Month #</span>
            <span>Amount (₹)</span>
            <span className="w-8" />
          </div>

          {partPayments.map((pp, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center">
              <div>
                <Label className="sm:hidden">Month #</Label>
                <NumericInput
                  value={pp.month}
                  onChange={(v) => updatePartPayment(i, "month", v || 1)}
                  min={1}
                  max={loan?.remainingMonths || 120}
                  className={CALC_INPUT_CLASS}
                  placeholder="6"
                />
                {pp.month && results?.withPP.rows[pp.month - 1] && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    = {results.withPP.rows[Math.min(pp.month - 1, results.withPP.rows.length - 1)]?.label}
                  </p>
                )}
              </div>
              <div>
                <Label className="sm:hidden">Amount</Label>
                <NumericInput
                  value={pp.amount}
                  onChange={(v) => updatePartPayment(i, "amount", v || 0)}
                  min={0}
                  className={CALC_INPUT_CLASS}
                  placeholder="1,00,000"
                />
              </div>
              <button
                onClick={() => removePartPayment(i)}
                disabled={partPayments.length === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-negative hover:bg-negative/10 transition-colors disabled:opacity-30"
                title="Remove"
              >
                ×
              </button>
            </div>
          ))}

          <button
            onClick={addPartPayment}
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            + Add another prepayment
          </button>
        </div>
      </CalcSection>

      {results && (
        <div className="space-y-4">
          <Verdict
            type={results.verdict === "WORTH_IT" ? "good" : results.verdict === "MARGINAL" ? "neutral" : "bad"}
          >
            {results.verdict === "WORTH_IT"
              ? `Prepay! Net saving after ${formatINR(results.totalPenalty)} penalty: ${formatINR(results.netSaving)}`
              : results.verdict === "MARGINAL"
                ? `Marginal saving of ${formatINR(results.netSaving)} after penalty`
                : `Not worth it — penalty of ${formatINR(results.totalPenalty)} eats most of the saving`}
            {results.monthsReduced > 0 && (
              <span className="block text-sm font-normal mt-1">
                Loan closes {formatMonths(results.monthsReduced)} earlier
              </span>
            )}
          </Verdict>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Interest Saved" value={formatLakhs(results.interestSaved)} valueColor="text-positive" />
            <StatCard label="Total Penalty" value={formatINR(results.totalPenalty)} valueColor="text-negative" />
            <StatCard label="Net Saving" value={(results.netSaving >= 0 ? "+" : "") + formatINR(results.netSaving)} valueColor={results.netSaving >= 0 ? "text-positive" : "text-negative"} />
            <StatCard label="Months Reduced" value={results.monthsReduced > 0 ? formatMonths(results.monthsReduced) : "0"} valueColor="text-primary" />
          </div>

          <TableCard title="Before vs After Prepayment">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium">Metric</th>
                  <th className="text-right px-4 py-3 font-medium">Without</th>
                  <th className="text-right px-4 py-3 font-medium">With Prepayment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">Loan Duration</td>
                  <td className="px-4 py-3 text-right font-medium">{formatMonths(results.without.rows.length)}</td>
                  <td className="px-4 py-3 text-right font-medium text-positive">{formatMonths(results.withPP.rows.length)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">Total Interest</td>
                  <td className="px-4 py-3 text-right font-medium">{formatLakhs(results.without.totalInterest)}</td>
                  <td className="px-4 py-3 text-right font-medium text-positive">{formatLakhs(results.withPP.totalInterest)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">Total Prepaid</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">—</td>
                  <td className="px-4 py-3 text-right font-medium">{formatINR(results.totalPrepaid)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">Penalty Paid</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">—</td>
                  <td className="px-4 py-3 text-right text-negative">{formatINR(results.totalPenalty)}</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="px-4 py-3 font-medium">Net Saving</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">—</td>
                  <td className={cn("px-4 py-3 text-right font-semibold", results.netSaving >= 0 ? "text-positive" : "text-negative")}>
                    {results.netSaving >= 0 ? "+" : ""}{formatINR(results.netSaving)}
                  </td>
                </tr>
              </tbody>
            </table>
          </TableCard>

          {/* Per-prepayment breakdown */}
          {partPayments.length > 1 && (
            <TableCard title="Per-Prepayment Impact">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-4 py-2 font-medium">When</th>
                    <th className="text-right px-4 py-2 font-medium">Amount</th>
                    <th className="text-right px-4 py-2 font-medium">Penalty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {partPayments.filter(pp => pp.amount > 0).map((pp, i) => {
                    const row = results.withPP.rows[Math.min(pp.month - 1, results.withPP.rows.length - 1)];
                    return (
                      <tr key={i}>
                        <td className="px-4 py-2 text-foreground">Month {pp.month}{row ? ` (${row.label})` : ""}</td>
                        <td className="px-4 py-2 text-right font-mono">{formatINR(pp.amount)}</td>
                        <td className="px-4 py-2 text-right text-negative font-mono">{formatINR(pp.amount * ((penaltyPercent as number || 0) / 100))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableCard>
          )}

          {(lockInMonths as number) > 0 && partPayments.some(pp => pp.month <= (lockInMonths as number)) && (
            <Callout type="warning">
              One or more prepayments fall within the {lockInMonths}-month lock-in period.
              Your bank may not allow prepayment during this time. Check your loan agreement.
            </Callout>
          )}

          <Callout type="info">
            Unlike home loans, personal loans are <strong>NOT</strong> protected by RBI
            prepayment rules. Banks can legally charge 2–5% foreclosure penalty.
            Always confirm the exact penalty with your lender before prepaying.
          </Callout>
        </div>
      )}
    </div>
  );
}
