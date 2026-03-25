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

import { compareCCVsPersonalLoan } from "@/lib/calculations/creditCardCalcs";

export default function CCvsPLCalc() {
  const [ccOutstanding, setCcOutstanding] = useState<number | "">(100000);
  const [ccMonthlyRate, setCcMonthlyRate] = useState<number | "">(3.5);
  const [plRate, setPlRate] = useState<number | "">(14);
  const [plTenure, setPlTenure] = useState<number | "">(24);
  const [plProcessingFee, setPlProcessingFee] = useState<number | "">(2);
  const [includeGST, setIncludeGST] = useState(true);

  const results = useMemo(() => {
    if (!ccOutstanding || !ccMonthlyRate || !plRate || !plTenure) return null;

    return compareCCVsPersonalLoan(
      {
        outstanding: ccOutstanding as number,
        monthlyRate: (ccMonthlyRate as number) / 100,
      },
      {
        amount: ccOutstanding as number,
        annualRate: (plRate as number) / 100,
        tenureMonths: plTenure as number,
        processingFeePercent: ((plProcessingFee as number) || 0) / 100,
      },
      includeGST
    );
  }, [ccOutstanding, ccMonthlyRate, plRate, plTenure, plProcessingFee, includeGST]);

  const verdictType =
    results?.recommendation === "PERSONAL_LOAN"
      ? "good"
      : results?.recommendation === "MARGINAL"
        ? "neutral"
        : "bad";

  return (
    <div className="space-y-6">
      <CalcSection title="Credit Card Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Outstanding Balance (&#8377;)</Label>
            <NumericInput
              value={ccOutstanding}
              onChange={setCcOutstanding}
              placeholder="1,00,000"
              min={0}
              className={CALC_INPUT_CLASS}
            />
          </div>
          <div>
            <Label>Monthly Interest Rate (%)</Label>
            <NumericInput
              value={ccMonthlyRate}
              onChange={setCcMonthlyRate}
              placeholder="3.5"
              min={0}
              max={10}
              step={0.1}
              className={CALC_INPUT_CLASS}
            />
            {typeof ccMonthlyRate === "number" && ccMonthlyRate > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                ({(ccMonthlyRate * 12).toFixed(1)}% per year)
              </p>
            )}
          </div>
        </div>
      </CalcSection>

      <CalcSection title="Personal Loan Option">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Annual Interest Rate (%)</Label>
            <NumericInput
              value={plRate}
              onChange={setPlRate}
              placeholder="14"
              min={0}
              max={40}
              step={0.1}
              className={CALC_INPUT_CLASS}
            />
          </div>
          <div>
            <Label>Tenure (Months)</Label>
            <NumericInput
              value={plTenure}
              onChange={setPlTenure}
              placeholder="24"
              min={1}
              max={84}
              className={CALC_INPUT_CLASS}
            />
          </div>
          <div>
            <Label>Processing Fee (%)</Label>
            <NumericInput
              value={plProcessingFee}
              onChange={setPlProcessingFee}
              placeholder="2"
              min={0}
              max={10}
              step={0.1}
              className={CALC_INPUT_CLASS}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            type="button"
            role="switch"
            aria-checked={includeGST}
            aria-label="Include 18% GST on interest and fees"
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
          <Label className="mb-0">Include 18% GST on interest &amp; fees</Label>
        </div>
      </CalcSection>

      {results && (
        <div className="space-y-4">
          <Verdict type={verdictType}>
            {results.recommendationReason}
          </Verdict>

          <TableCard title={`Side-by-Side Comparison${includeGST ? " (GST-inclusive)" : ""}`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium">Metric</th>
                  <th className="text-right px-4 py-3 font-medium">Credit Card</th>
                  <th className="text-right px-4 py-3 font-medium">Personal Loan</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">Monthly Payment</td>
                  <td className="px-4 py-3 text-right font-medium">{formatINR(results.ccMonthlyPayment)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatINR(results.plMonthlyEMI)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">Base Interest</td>
                  <td className="px-4 py-3 text-right text-negative">{formatINR(results.ccTotalInterest)}</td>
                  <td className="px-4 py-3 text-right">{formatINR(results.plTotalInterest)}</td>
                </tr>
                {includeGST && (
                  <tr>
                    <td className="px-4 py-3 text-muted-foreground">GST on Interest (18%)</td>
                    <td className="px-4 py-3 text-right text-negative">{formatINR(results.ccTotalGST)}</td>
                    <td className="px-4 py-3 text-right">{formatINR(results.plTotalGST)}</td>
                  </tr>
                )}
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">Processing Fee</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">&#8377;0</td>
                  <td className="px-4 py-3 text-right text-negative">-{formatINR(results.plProcessingFee)}</td>
                </tr>
                {includeGST && results.plProcessingFeeGST > 0 && (
                  <tr>
                    <td className="px-4 py-3 text-muted-foreground">GST on Processing Fee</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">&#8377;0</td>
                    <td className="px-4 py-3 text-right text-negative">-{formatINR(results.plProcessingFeeGST)}</td>
                  </tr>
                )}
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">Total Cost</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatINR(results.ccTotalInterest + results.ccTotalGST)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatINR(results.plTotalInterest + results.plTotalGST + results.plProcessingFee + results.plProcessingFeeGST)}
                  </td>
                </tr>
                <tr className="bg-muted/50 font-semibold">
                  <td className="px-4 py-3">Net Saving</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">&mdash;</td>
                  <td className={`px-4 py-3 text-right ${results.plNetSaving > 0 ? "text-positive" : "text-negative"}`}>
                    {results.plNetSaving > 0 ? "+" : ""}{formatLakhs(results.plNetSaving)}
                  </td>
                </tr>
              </tbody>
            </table>
          </TableCard>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Break-even Month"
              value={results.plBreakEvenMonths > 0 ? `Month ${results.plBreakEvenMonths}` : "N/A"}
              sub={results.plBreakEvenMonths > 0 ? "PL starts saving after this" : "PL does not save money"}
            />
            <StatCard
              label="Net Saving"
              value={formatINR(Math.abs(results.plNetSaving))}
              valueColor={results.plNetSaving > 0 ? "text-positive" : "text-negative"}
              sub={results.plNetSaving > 0 ? "saved by switching to PL" : "lost by switching to PL"}
            />
            <StatCard
              label="Monthly EMI Difference"
              value={formatINR(Math.abs(results.ccMonthlyPayment - results.plMonthlyEMI))}
              sub={
                results.plMonthlyEMI < results.ccMonthlyPayment
                  ? "lower with PL"
                  : results.plMonthlyEMI > results.ccMonthlyPayment
                    ? "higher with PL"
                    : "same"
              }
            />
          </div>

          {includeGST && (
            <Callout type="warning">
              18% GST is charged on both credit card interest AND personal loan interest and processing fees. This comparison includes GST on both sides for a true apples-to-apples comparison.
            </Callout>
          )}

          <Callout type="info">
            A personal loan replaces revolving 42% debt with fixed-rate structured EMIs. But after processing fees{includeGST ? " and GST" : ""}, it&apos;s not always better for small amounts. We recommend PL only when net saving exceeds &#8377;5,000.
          </Callout>
        </div>
      )}
    </div>
  );
}
