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
  const [includeGST, setIncludeGST] = useState(true);

  const [showAllRows, setShowAllRows] = useState(false);

  const results = useMemo(() => {
    if (!outstanding || !monthlyRate || !monthlyPayment) return null;

    const input = {
      outstanding: outstanding as number,
      monthlyRate: (monthlyRate as number) / 100,
    };

    const payoff = calculateCCPayoff(input, monthlyPayment as number, includeGST);
    const minDueTrap = calculateMinimumDueTrap(input, includeGST);
    const pay12 = calculateFixedPaymentForTarget(input, 12, includeGST);
    const pay24 = calculateFixedPaymentForTarget(input, 24, includeGST);

    return { payoff, minDueTrap, pay12, pay24 };
  }, [outstanding, monthlyRate, monthlyPayment, includeGST]);

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
    const totalCost = results.payoff.totalInterestPaid + results.payoff.totalGSTPaid;
    if (results.payoff.monthsToPayoff >= 60) {
      return `${formatMonths(results.payoff.monthsToPayoff)} to pay off with ${formatINR(totalCost)} in interest${includeGST ? " + GST" : ""}. You need to increase your monthly payment.`;
    }
    if (results.payoff.monthsToPayoff < 24) {
      return `Clear in ${formatMonths(results.payoff.monthsToPayoff)} with ${formatINR(totalCost)} total interest${includeGST ? " (incl. GST)" : ""}. Good pace!`;
    }
    return `${formatMonths(results.payoff.monthsToPayoff)} to pay off. Total interest: ${formatINR(totalCost)}${includeGST ? " (incl. GST)" : ""}. Consider increasing your payment.`;
  }, [results, includeGST]);

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
            <Label>Outstanding Balance (&#8377;)</Label>
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
            {typeof monthlyRate === "number" && monthlyRate > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                ({(monthlyRate * 12).toFixed(1)}% per year)
              </p>
            )}
          </div>
          <div>
            <Label>Monthly Payment (&#8377;)</Label>
            <NumericInput
              value={monthlyPayment}
              onChange={setMonthlyPayment}
              placeholder="3,000"
              min={0}
              className={CALC_INPUT_CLASS}
            />
            {outstanding && monthlyRate && (
              <div className="mt-2">
                <input
                  type="range"
                  min={Math.max(200, Math.round((outstanding as number) * 0.05))}
                  max={Math.round(calculateFixedPaymentForTarget({ outstanding: outstanding as number, monthlyRate: (monthlyRate as number) / 100 }, 6))}
                  step={100}
                  value={monthlyPayment || 0}
                  onChange={(e) => setMonthlyPayment(Number(e.target.value))}
                  className="w-full h-2 rounded-full bg-muted focus:outline-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>Min due</span>
                  <span>Clear in 6 mo</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            type="button"
            role="switch"
            aria-checked={includeGST}
            aria-label="Include 18% GST on interest"
            onClick={() => setIncludeGST(!includeGST)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
              includeGST ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                includeGST ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <Label className="mb-0">Include 18% GST on interest</Label>
        </div>
      </CalcSection>

      {results && (
        <div className="space-y-4">
          <Verdict type={verdictType}>
            {verdictText}
          </Verdict>

          {!results.payoff.isNeverPayoff && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Months to Payoff"
                  value={formatMonths(results.payoff.monthsToPayoff)}
                  sub={`${Math.ceil(results.payoff.monthsToPayoff / 12)} year${Math.ceil(results.payoff.monthsToPayoff / 12) > 1 ? "s" : ""}`}
                />
                <StatCard
                  label="Base Interest"
                  value={formatLakhs(results.payoff.totalInterestPaid)}
                  valueColor="text-negative"
                  sub={`${((results.payoff.totalInterestPaid / (outstanding as number)) * 100).toFixed(0)}% of your balance`}
                />
                {includeGST && results.payoff.totalGSTPaid > 0 && (
                  <StatCard
                    label="GST on Interest (18%)"
                    value={formatLakhs(results.payoff.totalGSTPaid)}
                    valueColor="text-negative"
                    sub="charged by the bank"
                  />
                )}
                <StatCard
                  label="Total Cost"
                  value={formatLakhs(results.payoff.totalInterestPaid + results.payoff.totalGSTPaid)}
                  valueColor="text-negative"
                  sub={includeGST ? "interest + GST" : "interest only"}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-positive/20 bg-positive/10 p-4 text-center">
                  <p className="text-sm text-positive mb-1">To clear in 12 months</p>
                  <p className="text-xl font-bold text-positive">
                    {formatINR(results.pay12)}<span className="text-sm font-normal">/mo</span>
                  </p>
                </div>
                <div className="rounded-lg border border-primary/20 bg-accent p-4 text-center">
                  <p className="text-sm text-primary mb-1">To clear in 24 months</p>
                  <p className="text-xl font-bold text-primary">
                    {formatINR(results.pay24)}<span className="text-sm font-normal">/mo</span>
                  </p>
                </div>
              </div>

              {results && !results.payoff.isNeverPayoff && monthlyPayment && (
                (() => {
                  const increased = calculateCCPayoff(
                    { outstanding: outstanding as number, monthlyRate: (monthlyRate as number) / 100 },
                    (monthlyPayment as number) + 500,
                    includeGST
                  );
                  const monthsSaved = results.payoff.monthsToPayoff - increased.monthsToPayoff;
                  const interestSaved = results.payoff.totalInterestPaid - increased.totalInterestPaid;
                  if (monthsSaved <= 0) return null;
                  return (
                    <p className="text-xs text-muted-foreground mt-3">
                      Tip: Pay ₹500 more/month →{" "}
                      <span className="text-positive font-medium">saves {monthsSaved} months</span>{" "}
                      and{" "}
                      <span className="text-positive font-mono">₹{formatINR(Math.round(interestSaved))}</span>{" "}
                      in interest + GST.
                    </p>
                  );
                })()
              )}

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
                      <td className="px-4 py-3 text-right font-medium text-negative">
                        {formatMonths(results.minDueTrap.monthsToPayoff)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-muted-foreground">Base Interest</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatLakhs(results.payoff.totalInterestPaid)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-negative">
                        {formatLakhs(results.minDueTrap.totalInterestPaid)}
                      </td>
                    </tr>
                    {includeGST && (
                      <tr>
                        <td className="px-4 py-3 text-muted-foreground">GST on Interest (18%)</td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatLakhs(results.payoff.totalGSTPaid)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-negative">
                          {formatLakhs(results.minDueTrap.totalGSTPaid)}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td className="px-4 py-3 text-muted-foreground">Total Paid</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatLakhs(results.payoff.totalAmountPaid)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-negative">
                        {formatLakhs(results.minDueTrap.totalAmountPaid)}
                      </td>
                    </tr>
                    <tr className="bg-muted/50 font-semibold">
                      <td className="px-4 py-3">Extra Interest (Min Due)</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">&mdash;</td>
                      <td className="px-4 py-3 text-right text-negative">
                        +{formatLakhs(results.minDueTrap.extraInterestVsFixedPayment)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </TableCard>

              <Callout type="warning">
                Banks charge 18% GST on all credit card interest and fees. This is NOT optional &mdash; it is added to every billing cycle automatically, making the effective cost of carrying a balance even higher than the stated interest rate.
              </Callout>

              <Callout type="warning">
                If you pay even &#8377;1 less than the full outstanding, interest is charged on the ENTIRE balance from the transaction date &mdash; not just the remaining amount. Always pay the full outstanding to preserve the interest-free period.
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
                      {includeGST && (
                        <th className="text-right px-4 py-3 font-medium">GST</th>
                      )}
                      <th className="text-right px-4 py-3 font-medium">Principal</th>
                      <th className="text-right px-4 py-3 font-medium">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {displayedRows.map((row) => (
                      <tr key={row.month}>
                        <td className="px-4 py-2 text-muted-foreground">{row.month}</td>
                        <td className="px-4 py-2 text-right">{formatINR(row.payment)}</td>
                        <td className="px-4 py-2 text-right text-negative">{formatINR(row.interestCharged)}</td>
                        {includeGST && (
                          <td className="px-4 py-2 text-right text-negative">{formatINR(row.gstOnInterest)}</td>
                        )}
                        <td className="px-4 py-2 text-right text-positive">{formatINR(row.principalPaid)}</td>
                        <td className="px-4 py-2 text-right font-medium">{formatINR(row.closingBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {results.payoff.monthlyBreakdown.length > 24 && (
                  <div className="px-4 py-3 text-center border-t">
                    <button
                      onClick={() => setShowAllRows(!showAllRows)}
                      className="text-sm text-primary hover:text-primary font-medium"
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
