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

type PayoffVerdict = "WORTH_IT" | "MARGINAL" | "NOT_WORTH_IT";

interface SimResult {
  months: number;
  totalInterest: number;
  totalPaid: number;
}

function simulatePayoff(
  balance: number,
  ratePA: number,
  emi: number
): SimResult {
  if (balance <= 0) return { months: 0, totalInterest: 0, totalPaid: 0 };

  const monthlyRate = ratePA / 100 / 12;
  let outstanding = balance;
  let months = 0;
  let totalInterest = 0;
  let totalPaid = 0;

  while (outstanding > 0.01 && months < 600) {
    months++;
    const interest = outstanding * monthlyRate;
    const principalPaid = Math.min(emi - interest, outstanding);

    if (principalPaid <= 0) {
      // EMI doesn't even cover interest
      return { months: Infinity, totalInterest: Infinity, totalPaid: Infinity };
    }

    totalInterest += interest;
    totalPaid += Math.min(emi, outstanding + interest);
    outstanding = Math.max(0, outstanding - principalPaid);
  }

  return { months, totalInterest, totalPaid };
}

export default function PersonalLoanPayoffCalc() {
  const [outstanding, setOutstanding] = useState<number | "">(300000);
  const [ratePA, setRatePA] = useState<number | "">(16);
  const [monthlyEMI, setMonthlyEMI] = useState<number | "">(12000);
  const [prepaymentAmount, setPrepaymentAmount] = useState<number | "">(100000);
  const [penaltyPercent, setPenaltyPercent] = useState<number | "">(3);
  const [lockInRemaining, setLockInRemaining] = useState<number | "">(0);

  const results = useMemo(() => {
    if (!outstanding || !ratePA || !monthlyEMI || !prepaymentAmount)
      return null;

    const bal = outstanding as number;
    const rate = ratePA as number;
    const emi = monthlyEMI as number;
    const prepay = Math.min(prepaymentAmount as number, bal);
    const penalty = (penaltyPercent as number) || 0;
    const lockIn = (lockInRemaining as number) || 0;

    // Without prepayment
    const without = simulatePayoff(bal, rate, emi);
    if (without.months === Infinity) return null;

    // With prepayment
    const newBalance = bal - prepay;
    const withPrepay = simulatePayoff(newBalance, rate, emi);

    const interestSaved = without.totalInterest - withPrepay.totalInterest;
    const penaltyAmount = prepay * (penalty / 100);
    const netSaving = interestSaved - penaltyAmount;
    const monthsReduced = without.months - withPrepay.months;

    let verdict: PayoffVerdict;
    if (netSaving > 5000) {
      verdict = "WORTH_IT";
    } else if (netSaving >= 1000) {
      verdict = "MARGINAL";
    } else {
      verdict = "NOT_WORTH_IT";
    }

    return {
      without,
      withPrepay,
      interestSaved,
      penaltyAmount,
      netSaving,
      monthsReduced,
      verdict,
      lockIn,
      prepay,
    };
  }, [outstanding, ratePA, monthlyEMI, prepaymentAmount, penaltyPercent, lockInRemaining]);

  return (
    <div className="space-y-6">
      <CalcSection title="Enter Your Personal Loan Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Outstanding Balance (&#8377;)</Label>
            <NumericInput
              value={outstanding}
              onChange={setOutstanding}
              placeholder="3,00,000"
              min={0}
              className={CALC_INPUT_CLASS}
            />
          </div>
          <div>
            <Label>Interest Rate (% p.a.)</Label>
            <NumericInput
              value={ratePA}
              onChange={setRatePA}
              placeholder="16"
              min={0}
              max={40}
              step={0.1}
              className={CALC_INPUT_CLASS}
            />
          </div>
          <div>
            <Label>Monthly EMI (&#8377;)</Label>
            <NumericInput
              value={monthlyEMI}
              onChange={setMonthlyEMI}
              placeholder="12,000"
              min={1}
              className={CALC_INPUT_CLASS}
            />
          </div>
          <div>
            <Label>Prepayment Amount (&#8377;)</Label>
            <NumericInput
              value={prepaymentAmount}
              onChange={setPrepaymentAmount}
              placeholder="1,00,000"
              min={0}
              className={CALC_INPUT_CLASS}
            />
          </div>
          <div>
            <Label>Foreclosure/Prepayment Penalty (%)</Label>
            <NumericInput
              value={penaltyPercent}
              onChange={setPenaltyPercent}
              placeholder="3"
              min={0}
              max={10}
              step={0.1}
              className={CALC_INPUT_CLASS}
            />
          </div>
          <div>
            <Label>Lock-in Remaining (Months)</Label>
            <NumericInput
              value={lockInRemaining}
              onChange={setLockInRemaining}
              placeholder="0"
              min={0}
              max={60}
              className={CALC_INPUT_CLASS}
            />
          </div>
        </div>
      </CalcSection>

      {results && (
        <div className="space-y-4">
          <Verdict
            type={
              results.verdict === "WORTH_IT"
                ? "good"
                : results.verdict === "MARGINAL"
                  ? "neutral"
                  : "bad"
            }
          >
            {results.verdict === "WORTH_IT"
              ? `Yes, prepay! Net saving after penalty: ${formatINR(results.netSaving)}`
              : results.verdict === "MARGINAL"
                ? `Marginal saving of ${formatINR(results.netSaving)} — weigh the hassle`
                : `Not worth it. After ${formatINR(results.penaltyAmount)} penalty, you ${results.netSaving < 0 ? "lose" : "save only"} ${formatINR(Math.abs(results.netSaving))}`}
            {results.monthsReduced > 0 && (
              <span className="block text-sm font-normal mt-1">
                Loan closes {formatMonths(results.monthsReduced)} earlier
              </span>
            )}
          </Verdict>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="Interest Saved"
              value={formatLakhs(results.interestSaved)}
              valueColor="text-green-700"
            />
            <StatCard
              label="Penalty Amount"
              value={formatINR(results.penaltyAmount)}
              valueColor="text-red-600"
            />
            <StatCard
              label="Net Saving"
              value={
                (results.netSaving >= 0 ? "+" : "") +
                formatINR(results.netSaving)
              }
              valueColor={
                results.netSaving >= 0 ? "text-green-700" : "text-red-600"
              }
            />
            <StatCard
              label="Months Reduced"
              value={
                results.monthsReduced > 0
                  ? formatMonths(results.monthsReduced)
                  : "0"
              }
              valueColor="text-blue-700"
            />
          </div>

          <TableCard title="Prepayment Comparison">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium">Metric</th>
                  <th className="text-right px-4 py-3 font-medium">
                    Without Prepayment
                  </th>
                  <th className="text-right px-4 py-3 font-medium">
                    With Prepayment
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">
                    Months Remaining
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatMonths(results.without.months)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-green-700">
                    {formatMonths(results.withPrepay.months)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">
                    Total Interest
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatLakhs(results.without.totalInterest)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-green-700">
                    {formatLakhs(results.withPrepay.totalInterest)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">
                    Total Paid (EMI + Prepayment)
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatLakhs(results.without.totalPaid)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatLakhs(
                      results.withPrepay.totalPaid +
                        results.prepay +
                        results.penaltyAmount
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">
                    Prepayment Penalty
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    &mdash;
                  </td>
                  <td className="px-4 py-3 text-right text-red-600">
                    {formatINR(results.penaltyAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </TableCard>

          {results.lockIn > 0 && (
            <Callout type="warning">
              Your loan has {results.lockIn} months of lock-in remaining.
              Prepayment may not be allowed yet. Check your loan agreement or
              contact your lender before making the payment.
            </Callout>
          )}

          <Callout type="info">
            Unlike home loans, personal loans are <strong>NOT</strong> protected
            by RBI prepayment rules. Your bank can legally charge 2-5%
            foreclosure penalty on the prepaid amount. Always ask for the exact
            penalty clause before paying.
          </Callout>
        </div>
      )}
    </div>
  );
}
