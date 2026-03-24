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
      }
    );
  }, [ccOutstanding, ccMonthlyRate, plRate, plTenure, plProcessingFee]);

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
            <Label>Outstanding Balance (₹)</Label>
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
      </CalcSection>

      {results && (
        <div className="space-y-4">
          <Verdict type={verdictType}>
            {results.recommendationReason}
          </Verdict>

          <TableCard title="Side-by-Side Comparison">
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
                  <td className="px-4 py-3 text-muted-foreground">Total Interest</td>
                  <td className="px-4 py-3 text-right text-red-600">{formatINR(results.ccTotalInterest)}</td>
                  <td className="px-4 py-3 text-right">{formatINR(results.plTotalInterest)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">Processing Fee</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">₹0</td>
                  <td className="px-4 py-3 text-right text-red-600">-{formatINR(results.plProcessingFee)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">Total Cost</td>
                  <td className="px-4 py-3 text-right font-medium">{formatINR(results.ccTotalInterest)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatINR(results.plTotalInterest + results.plProcessingFee)}</td>
                </tr>
                <tr className="bg-muted/50 font-semibold">
                  <td className="px-4 py-3">Net Saving</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">&mdash;</td>
                  <td className={`px-4 py-3 text-right ${results.plNetSaving > 0 ? "text-green-700" : "text-red-700"}`}>
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
              valueColor={results.plNetSaving > 0 ? "text-green-700" : "text-red-700"}
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

          <Callout type="info">
            A personal loan replaces revolving 42% debt with fixed-rate structured EMIs. But after processing fees, it&apos;s not always better for small amounts. We recommend PL only when net saving exceeds ₹5,000.
          </Callout>
        </div>
      )}
    </div>
  );
}
