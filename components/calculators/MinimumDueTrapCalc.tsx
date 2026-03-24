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

  const results = useMemo(() => {
    if (!outstanding || !monthlyRate) return null;

    const input = {
      outstanding: outstanding as number,
      monthlyRate: (monthlyRate as number) / 100,
    };

    const trap = calculateMinimumDueTrap(input);

    // Fixed payment scenarios
    const scenarios = [2000, 3000, 5000].map((payment) => {
      const result = calculateCCPayoff(input, payment);
      return { payment, ...result };
    });

    // Recommended amounts to clear in 12 and 24 months
    const payment12 = calculateFixedPaymentForTarget(input, 12);
    const payment24 = calculateFixedPaymentForTarget(input, 24);
    const result12 = calculateCCPayoff(input, payment12);
    const result24 = calculateCCPayoff(input, payment24);

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
  }, [outstanding, monthlyRate]);

  return (
    <div className="space-y-6">
      <CalcSection title="Enter Your Credit Card Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Outstanding Balance (₹)</Label>
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
          </div>
        </div>
      </CalcSection>

      {results && (
        <div className="space-y-4">
          <Verdict type="bad">
            Paying only minimum due on {formatINR(outstanding as number)} means{" "}
            {results.trap.yearsToPayoff} years of payments and{" "}
            {formatLakhs(results.trap.totalInterestPaid)} in interest
          </Verdict>

          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Years to Pay Off"
              value={`${results.trap.yearsToPayoff}`}
              sub={`${results.trap.monthsToPayoff} months`}
              valueColor="text-red-700"
            />
            <StatCard
              label="Total Interest Paid"
              value={formatLakhs(results.trap.totalInterestPaid)}
              sub="just in interest"
              valueColor="text-red-700"
            />
            <StatCard
              label="Total Amount Paid"
              value={formatLakhs(results.trap.totalAmountPaid)}
              sub={`on ${formatINR(outstanding as number)} balance`}
              valueColor="text-red-700"
            />
            <StatCard
              label="You Pay X Times More"
              value={`${results.multiplier.toFixed(1)}x`}
              sub="your original balance"
              valueColor="text-red-700"
            />
          </div>

          <TableCard
            title="Payment Strategy Comparison"
            description="See how different monthly payments change your payoff timeline"
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
                    Total Interest
                  </th>
                  <th className="text-right px-4 py-3 font-medium">
                    Total Paid
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {/* Minimum Due Only — highlighted red */}
                <tr className="bg-red-50">
                  <td className="px-4 py-3 font-medium text-red-700">
                    Minimum Due Only (5%)
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-red-700">
                    {results.trap.monthsToPayoff}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-red-700">
                    {formatLakhs(results.trap.totalInterestPaid)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-red-700">
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
                        ? "∞"
                        : formatLakhs(s.totalInterestPaid)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {s.isNeverPayoff
                        ? "∞"
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
                    {formatLakhs(results.result24.totalInterestPaid)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatLakhs(results.result24.totalAmountPaid)}
                  </td>
                </tr>

                {/* Clear in 12 months — highlighted green */}
                <tr className="bg-green-50">
                  <td className="px-4 py-3 font-medium text-green-700">
                    Clear in 12 months ({formatINR(results.payment12)}/mo)
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-green-700">
                    {results.result12.monthsToPayoff}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-green-700">
                    {formatLakhs(results.result12.totalInterestPaid)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-green-700">
                    {formatLakhs(results.result12.totalAmountPaid)}
                  </td>
                </tr>
              </tbody>
            </table>
          </TableCard>

          <Callout type="warning">
            <strong>The interest-free period trap:</strong> If you pay anything
            less than your full outstanding balance, the bank charges interest on
            the <strong>entire balance</strong> from the <strong>transaction date</strong> — not
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
