"use client";

import { useState, useMemo } from "react";

import { formatINR } from "@/lib/utils/formatters";

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

import { calculateConsumerEMITrueCost } from "@/lib/calculations/loanTypeConfig";

const TENURE_OPTIONS = [3, 6, 9, 12, 18, 24] as const;

export default function ConsumerEMITrueCostCalc() {
  const [purchasePrice, setPurchasePrice] = useState<number | "">(40000);
  const [tenureMonths, setTenureMonths] = useState<number | "">(12);
  const [processingFeePercent, setProcessingFeePercent] = useState<number | "">(
    2
  );
  const [includeGST, setIncludeGST] = useState(true);

  const results = useMemo(() => {
    if (!purchasePrice || !tenureMonths) return null;

    const feePercent = ((processingFeePercent as number) || 0) / 100;

    const calc = calculateConsumerEMITrueCost({
      purchasePrice: purchasePrice as number,
      tenureMonths: tenureMonths as number,
      processingFeePercent: feePercent,
    });

    const gstOnFee = includeGST ? calc.processingFee * 0.18 : 0;
    const totalExtraCost = calc.processingFee + gstOnFee;
    const monthlyEMI = (purchasePrice as number) / (tenureMonths as number);
    const effectiveRatePA = calc.effectiveAnnualRate * 100;

    // Opportunity cost: liquid fund at 7% PA for the tenure
    const liquidFundReturn =
      (purchasePrice as number) *
      (0.07 / 12) *
      (tenureMonths as number);

    return {
      ...calc,
      gstOnFee,
      totalExtraCost,
      monthlyEMI,
      effectiveRatePA,
      liquidFundReturn,
    };
  }, [purchasePrice, tenureMonths, processingFeePercent, includeGST]);

  return (
    <div className="space-y-6">
      <CalcSection title="Purchase Details">
        <div className="space-y-4">
          <div>
            <Label>Purchase Price (₹)</Label>
            <NumericInput
              value={purchasePrice}
              onChange={setPurchasePrice}
              placeholder="40,000"
              min={0}
              className={CALC_INPUT_CLASS}
            />
          </div>

          <div>
            <Label>EMI Tenure (Months)</Label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-1">
              {TENURE_OPTIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTenureMonths(m)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    tenureMonths === m
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-input hover:bg-muted"
                  }`}
                >
                  {m} mo
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Processing Fee (%)</Label>
            <NumericInput
              value={processingFeePercent}
              onChange={setProcessingFeePercent}
              placeholder="2"
              min={0}
              max={10}
              step={0.1}
              className={CALC_INPUT_CLASS}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={includeGST}
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
            <Label className="mb-0">Include 18% GST on processing fee</Label>
          </div>
        </div>
      </CalcSection>

      {results && (
        <div className="space-y-4">
          <Verdict type={results.isTrulyCostFree ? "good" : "bad"}>
            {results.isTrulyCostFree
              ? "This is genuinely cost-free — no processing fee, no hidden charges."
              : `This '0% EMI' actually costs you ${formatINR(results.totalExtraCost)} — an effective rate of ${results.effectiveRatePA.toFixed(1)}% PA`}
          </Verdict>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Processing Fee"
              value={formatINR(results.processingFee)}
              valueColor={
                results.processingFee > 0 ? "text-red-600" : "text-green-700"
              }
            />
            <StatCard
              label="Effective Annual Rate"
              value={`${results.effectiveRatePA.toFixed(1)}%`}
              valueColor={
                results.effectiveRatePA > 0 ? "text-red-600" : "text-green-700"
              }
              sub="What 0% EMI actually costs"
            />
            <StatCard
              label="Total Extra Cost"
              value={formatINR(results.totalExtraCost)}
              valueColor={
                results.totalExtraCost > 0 ? "text-red-600" : "text-green-700"
              }
              sub={includeGST && results.gstOnFee > 0 ? `Incl. ${formatINR(results.gstOnFee)} GST` : undefined}
            />
            <StatCard
              label="Monthly EMI"
              value={formatINR(results.monthlyEMI)}
              sub={`${purchasePrice ? formatINR(purchasePrice as number) : ""} / ${tenureMonths} months`}
            />
          </div>

          {includeGST && results.gstOnFee > 0 && (
            <Callout type="info">
              +{formatINR(results.gstOnFee)} GST (18%) charged on the
              processing fee of {formatINR(results.processingFee)}. This is
              often buried in the fine print.
            </Callout>
          )}

          <TableCard title="Cash vs EMI Comparison">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium">Item</th>
                  <th className="text-right px-4 py-3 font-medium">
                    Pay Cash
                  </th>
                  <th className="text-right px-4 py-3 font-medium">
                    0% EMI
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">
                    Purchase Price
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatINR(purchasePrice as number)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatINR(purchasePrice as number)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">
                    Processing Fee
                  </td>
                  <td className="px-4 py-3 text-right text-green-700">
                    {formatINR(0)}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600">
                    +{formatINR(results.processingFee)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">
                    GST on Fee
                  </td>
                  <td className="px-4 py-3 text-right text-green-700">
                    {formatINR(0)}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600">
                    {includeGST && results.gstOnFee > 0
                      ? `+${formatINR(results.gstOnFee)}`
                      : formatINR(0)}
                  </td>
                </tr>
                <tr className="bg-muted/50 font-semibold">
                  <td className="px-4 py-3">Total Cost</td>
                  <td className="px-4 py-3 text-right">
                    {formatINR(purchasePrice as number)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatINR(
                      (purchasePrice as number) + results.totalExtraCost
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">
                    Extra Cost vs Cash
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    —
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-medium ${
                      results.totalExtraCost > 0
                        ? "text-red-600"
                        : "text-green-700"
                    }`}
                  >
                    {results.totalExtraCost > 0 ? "+" : ""}
                    {formatINR(results.totalExtraCost)}
                  </td>
                </tr>
              </tbody>
            </table>
          </TableCard>

          <Callout type="warning">
            The processing fee IS the interest — just renamed. Banks are not
            legally required to call it &quot;interest&quot;, which is why
            &quot;0% EMI&quot; is technically accurate but misleading.
          </Callout>

          <Callout type="info">
            If you had invested {formatINR(purchasePrice as number)} in a liquid
            fund at 7% for {tenureMonths} months instead, you&apos;d earn ~
            {formatINR(results.liquidFundReturn)}. The true opportunity cost of
            the EMI is the processing fee PLUS the lost returns.
          </Callout>
        </div>
      )}
    </div>
  );
}
