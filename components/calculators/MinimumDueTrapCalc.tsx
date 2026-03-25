"use client";

import { useState, useMemo } from "react";

import { formatINR, formatLakhs } from "@/lib/utils/formatters";

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
  calculateMinimumDueTrap,
  calculateCCPayoff,
  calculateFixedPaymentForTarget,
  CC_DEFAULTS,
} from "@/lib/calculations/creditCardCalcs";

export default function MinimumDueTrapCalc() {
  const [outstanding, setOutstanding] = useState<number | "">(30000);
  const [monthlyRate, setMonthlyRate] = useState<number | "">(3.5);
  const [includeGST, setIncludeGST] = useState(true);

  const results = useMemo(() => {
    if (!outstanding || !monthlyRate) return null;

    const input = {
      outstanding: outstanding as number,
      monthlyRate: (monthlyRate as number) / 100,
    };

    const trap = calculateMinimumDueTrap(input, includeGST);

    // Fixed payment scenarios
    const scenarios = [2000, 3000, 5000].map((payment) => {
      const result = calculateCCPayoff(input, payment, includeGST);
      return { payment, ...result };
    });

    // Recommended amounts to clear in 12 and 24 months
    const payment12 = calculateFixedPaymentForTarget(input, 12, includeGST);
    const payment24 = calculateFixedPaymentForTarget(input, 24, includeGST);
    const result12 = calculateCCPayoff(input, payment12, includeGST);
    const result24 = calculateCCPayoff(input, payment24, includeGST);

    const multiplier = trap.totalAmountPaid / (outstanding as number);

    return {
      trap,
      scenarios,
      payment12: Math.ceil(payment12),
      payment24: Math.ceil(payment24),
      result12,
      result24,
      multiplier,
    };
  }, [outstanding, monthlyRate, includeGST]);

  return (
    <div className="space-y-6">
      <CalcSection title="Enter Your Credit Card Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Outstanding Balance (&#8377;)</Label>
            <NumericInput
              value={outstanding}
              onChange={setOutstanding}
              placeholder="30,000"
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
          <Verdict type="bad">
            Paying only minimum due on {formatINR(outstanding as number)} means{" "}
            {results.trap.yearsToPayoff} years of payments and{" "}
            {formatLakhs(results.trap.totalInterestPaid + results.trap.totalGSTPaid)} in interest{includeGST ? " + GST" : ""}
          </Verdict>

          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Years to Pay Off"
              value={`${results.trap.yearsToPayoff}`}
              sub={`${results.trap.monthsToPayoff} months`}
              valueColor="text-negative"
            />
            <StatCard
              label="Total Interest Paid"
              value={formatLakhs(results.trap.totalInterestPaid)}
              sub={includeGST ? `+ ${formatINR(results.trap.totalGSTPaid)} GST` : "base interest"}
              valueColor="text-negative"
            />
            <StatCard
              label="Total Amount Paid"
              value={formatLakhs(results.trap.totalAmountPaid)}
              sub={`on ${formatINR(outstanding as number)} balance`}
              valueColor="text-negative"
            />
            <StatCard
              label="You Pay X Times More"
              value={`${results.multiplier.toFixed(1)}x`}
              sub="your original balance"
              valueColor="text-negative"
            />
          </div>

          <TableCard
            title="Payment Strategy Comparison"
            description={`See how different monthly payments change your payoff timeline${includeGST ? " (all figures include 18% GST)" : ""}`}
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium">
                    Monthly Payment
                  </th>
                  <th className="text-right px-4 py-3 font-medium">
                    Months to Clear
                  </th>
                  <th className="text-right px-4 py-3 font-medium">
                    Total Interest{includeGST ? " + GST" : ""}
                  </th>
                  <th className="text-right px-4 py-3 font-medium">
                    Total Paid
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {/* Minimum Due Only -- highlighted red */}
                <tr className="bg-negative/10">
                  <td className="px-4 py-3 font-medium text-negative">
                    Minimum Due Only (5%)
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-negative">
                    {results.trap.monthsToPayoff}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-negative">
                    {formatLakhs(results.trap.totalInterestPaid + results.trap.totalGSTPaid)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-negative">
                    {formatLakhs(results.trap.totalAmountPaid)}
                  </td>
                </tr>

                {/* Fixed payment scenarios */}
                {results.scenarios.map((s) => (
                  <tr key={s.payment}>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatINR(s.payment)}/mo
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {s.isNeverPayoff ? "Never" : s.monthsToPayoff}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {s.isNeverPayoff
                        ? "\u221E"
                        : formatLakhs(s.totalInterestPaid + s.totalGSTPaid)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {s.isNeverPayoff
                        ? "\u221E"
                        : formatLakhs(s.totalAmountPaid)}
                    </td>
                  </tr>
                ))}

                {/* Clear in 24 months */}
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">
                    Clear in 24 months ({formatINR(results.payment24)}/mo)
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {results.result24.monthsToPayoff}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatLakhs(results.result24.totalInterestPaid + results.result24.totalGSTPaid)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatLakhs(results.result24.totalAmountPaid)}
                  </td>
                </tr>

                {/* Clear in 12 months -- highlighted green */}
                <tr className="bg-positive/10">
                  <td className="px-4 py-3 font-medium text-positive">
                    Clear in 12 months ({formatINR(results.payment12)}/mo)
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-positive">
                    {results.result12.monthsToPayoff}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-positive">
                    {formatLakhs(results.result12.totalInterestPaid + results.result12.totalGSTPaid)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-positive">
                    {formatLakhs(results.result12.totalAmountPaid)}
                  </td>
                </tr>
              </tbody>
            </table>
          </TableCard>

          {includeGST && (
            <Callout type="warning">
              <strong>GST makes the trap even worse:</strong> Banks charge 18% GST
              on all credit card interest. With minimum due payments, the interest
              compounds month after month &mdash; and GST is charged on that growing
              interest every single cycle. This is money you never get back.
            </Callout>
          )}

          <Callout type="warning">
            <strong>The interest-free period trap:</strong> If you pay anything
            less than your full outstanding balance, the bank charges interest on
            the <strong>entire balance</strong> from the <strong>transaction date</strong> &mdash; not
            just the remaining unpaid amount. So even paying 95% of your bill means
            interest is calculated on 100% of your spending from day one. The only
            way to avoid credit card interest is to pay the full outstanding every
            month.
          </Callout>
        </div>
      )}
    </div>
  );
}
