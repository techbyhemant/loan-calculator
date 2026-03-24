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

import {
  calculateCCPayoff,
  calculateMinimumDueTrap,
  calculateFixedPaymentForTarget,
  CC_DEFAULTS,
} from "@/lib/calculations/creditCardCalcs";

export default function CCPayoffCalc() {
  const [outstanding, setOutstanding] = useState<number | "">(50000);
  const [monthlyRate, setMonthlyRate] = useState<number | "">(3.5);
  const [monthlyPayment, setMonthlyPayment] = useState<number | "">(3000);

  const [showAllRows, setShowAllRows] = useState(false);

  const results = useMemo(() => {
    if (!outstanding || !monthlyRate || !monthlyPayment) return null;

    const input = {
      outstanding: outstanding as number,
      monthlyRate: (monthlyRate as number) / 100,
    };

    const payoff = calculateCCPayoff(input, monthlyPayment as number);
    const minDueTrap = calculateMinimumDueTrap(input);
    const pay12 = calculateFixedPaymentForTarget(input, 12);
    const pay24 = calculateFixedPaymentForTarget(input, 24);

    return { payoff, minDueTrap, pay12, pay24 };
  }, [outstanding, monthlyRate, monthlyPayment]);

  const verdictType = useMemo(() => {
    if (!results) return "neutral" as const;
    if (results.payoff.isNeverPayoff) return "bad" as const;
    if (results.payoff.monthsToPayoff >= 60) return "bad" as const;
    if (results.payoff.monthsToPayoff < 24) return "good" as const;
    return "neutral" as const;
  }, [results]);

  const verdictText = useMemo(() => {
    if (!results) return "";
    if (results.payoff.isNeverPayoff) {
      return "Your payment doesn't even cover the monthly interest. Increase your payment to make progress.";
    }
    if (results.payoff.monthsToPayoff >= 60) {
      return `${formatMonths(results.payoff.monthsToPayoff)} to pay off with ${formatINR(results.payoff.totalInterestPaid)} in interest. You need to increase your monthly payment.`;
    }
    if (results.payoff.monthsToPayoff < 24) {
      return `Clear in ${formatMonths(results.payoff.monthsToPayoff)} with ${formatINR(results.payoff.totalInterestPaid)} total interest. Good pace!`;
    }
    return `${formatMonths(results.payoff.monthsToPayoff)} to pay off. Total interest: ${formatINR(results.payoff.totalInterestPaid)}. Consider increasing your payment.`;
  }, [results]);

  const displayedRows = useMemo(() => {
    if (!results || results.payoff.isNeverPayoff) return [];
    const rows = results.payoff.monthlyBreakdown;
    return showAllRows ? rows : rows.slice(0, 24);
  }, [results, showAllRows]);

  return (
    <div className="space-y-6">
      <CalcSection title="Enter Your Credit Card Details">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Outstanding Balance (₹)</Label>
            <NumericInput
              value={outstanding}
              onChange={setOutstanding}
              placeholder="50,000"
              min={0}
              className={CALC_INPUT_CLASS}
            />
          </div>
          <div>
            <Label>Monthly Interest Rate (%)</Label>
            <NumericInput
              value={monthlyRate}
              onChange={setMonthlyRate}
              placeholder="3.5"
              min={0}
              max={10}
              step={0.1}
              className={CALC_INPUT_CLASS}
            />
          </div>
          <div>
            <Label>Monthly Payment (₹)</Label>
            <NumericInput
              value={monthlyPayment}
              onChange={setMonthlyPayment}
              placeholder="3,000"
              min={0}
              className={CALC_INPUT_CLASS}
            />
          </div>
        </div>
      </CalcSection>

      {results && (
        <div className="space-y-4">
          <Verdict type={verdictType}>
            {verdictText}
          </Verdict>

          {!results.payoff.isNeverPayoff && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  label="Months to Payoff"
                  value={formatMonths(results.payoff.monthsToPayoff)}
                  sub={`${Math.ceil(results.payoff.monthsToPayoff / 12)} year${Math.ceil(results.payoff.monthsToPayoff / 12) > 1 ? "s" : ""}`}
                />
                <StatCard
                  label="Total Interest"
                  value={formatLakhs(results.payoff.totalInterestPaid)}
                  valueColor="text-red-600"
                  sub={`${((results.payoff.totalInterestPaid / (outstanding as number)) * 100).toFixed(0)}% of your balance`}
                />
                <StatCard
                  label="Total Amount Paid"
                  value={formatLakhs(results.payoff.totalAmountPaid)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                  <p className="text-sm text-green-700 mb-1">To clear in 12 months</p>
                  <p className="text-xl font-bold text-green-800">
                    {formatINR(results.pay12)}<span className="text-sm font-normal">/mo</span>
                  </p>
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
                  <p className="text-sm text-blue-700 mb-1">To clear in 24 months</p>
                  <p className="text-xl font-bold text-blue-800">
                    {formatINR(results.pay24)}<span className="text-sm font-normal">/mo</span>
                  </p>
                </div>
              </div>

              <TableCard title="Your Payment vs Minimum Due Only">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium">Metric</th>
                      <th className="text-right px-4 py-3 font-medium">Your Payment</th>
                      <th className="text-right px-4 py-3 font-medium">Minimum Due Only</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="px-4 py-3 text-muted-foreground">Months to Payoff</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatMonths(results.payoff.monthsToPayoff)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-red-600">
                        {formatMonths(results.minDueTrap.monthsToPayoff)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-muted-foreground">Total Interest</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatLakhs(results.payoff.totalInterestPaid)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-red-600">
                        {formatLakhs(results.minDueTrap.totalInterestPaid)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-muted-foreground">Total Paid</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatLakhs(results.payoff.totalAmountPaid)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-red-600">
                        {formatLakhs(results.minDueTrap.totalAmountPaid)}
                      </td>
                    </tr>
                    <tr className="bg-muted/50 font-semibold">
                      <td className="px-4 py-3">Extra Interest (Min Due)</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">&mdash;</td>
                      <td className="px-4 py-3 text-right text-red-700">
                        +{formatLakhs(results.minDueTrap.extraInterestVsFixedPayment)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </TableCard>

              <Callout type="warning">
                If you pay even ₹1 less than the full outstanding, interest is charged on the ENTIRE balance from the transaction date &mdash; not just the remaining amount. Always pay the full outstanding to preserve the interest-free period.
              </Callout>

              <TableCard
                title="Month-by-Month Breakdown"
                description={
                  results.payoff.monthlyBreakdown.length > 24
                    ? `Showing ${showAllRows ? "all" : "first 24 of"} ${results.payoff.monthlyBreakdown.length} months`
                    : undefined
                }
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium">Month</th>
                      <th className="text-right px-4 py-3 font-medium">Payment</th>
                      <th className="text-right px-4 py-3 font-medium">Interest</th>
                      <th className="text-right px-4 py-3 font-medium">Principal</th>
                      <th className="text-right px-4 py-3 font-medium">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {displayedRows.map((row) => (
                      <tr key={row.month}>
                        <td className="px-4 py-2 text-muted-foreground">{row.month}</td>
                        <td className="px-4 py-2 text-right">{formatINR(row.payment)}</td>
                        <td className="px-4 py-2 text-right text-red-600">{formatINR(row.interestCharged)}</td>
                        <td className="px-4 py-2 text-right text-green-700">{formatINR(row.principalPaid)}</td>
                        <td className="px-4 py-2 text-right font-medium">{formatINR(row.closingBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {results.payoff.monthlyBreakdown.length > 24 && (
                  <div className="px-4 py-3 text-center border-t">
                    <button
                      onClick={() => setShowAllRows(!showAllRows)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {showAllRows
                        ? "Show first 24 months only"
                        : `Show all ${results.payoff.monthlyBreakdown.length} months`}
                    </button>
                  </div>
                )}
              </TableCard>
            </>
          )}
        </div>
      )}
    </div>
  );
}
