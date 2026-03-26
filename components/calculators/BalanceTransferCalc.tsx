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

export default function BalanceTransferCalc() {
  const [outstanding, setOutstanding] = useState<number | "">(4000000);
  const [currentRate, setCurrentRate] = useState<number | "">(9.0);
  const [newRate, setNewRate] = useState<number | "">(8.5);
  const [remainingTenure, setRemainingTenure] = useState<number | "">(180);
  const [processingFee, setProcessingFee] = useState<number | "">(0.5);
  const [legalCharges, setLegalCharges] = useState<number | "">(15000);

  const results = useMemo(() => {
    if (!outstanding || !currentRate || !newRate || !remainingTenure)
      return null;
    const principal = outstanding as number;
    const months = remainingTenure as number;
    const feePercent = (processingFee as number) || 0;
    const legal = (legalCharges as number) || 0;

    const oldR = (currentRate as number) / 12 / 100;
    const newR = (newRate as number) / 12 / 100;
    const oldEMI =
      oldR === 0
        ? principal / months
        : (principal * oldR * Math.pow(1 + oldR, months)) /
          (Math.pow(1 + oldR, months) - 1);
    const newEMI =
      newR === 0
        ? principal / months
        : (principal * newR * Math.pow(1 + newR, months)) /
          (Math.pow(1 + newR, months) - 1);

    const oldTotalInterest = oldEMI * months - principal;
    const newTotalInterest = newEMI * months - principal;
    const processingFeeAmount = principal * (feePercent / 100);
    const totalTransferCost = processingFeeAmount + legal;
    const interestSaved = oldTotalInterest - newTotalInterest;
    const netSaving = interestSaved - totalTransferCost;
    const monthlySaving = oldEMI - newEMI;
    const breakEvenMonths =
      monthlySaving > 0 ? Math.ceil(totalTransferCost / monthlySaving) : 0;
    const worthIt = netSaving > 25000;

    return {
      oldEMI,
      newEMI,
      oldTotalInterest,
      newTotalInterest,
      interestSaved,
      totalTransferCost,
      netSaving,
      monthlySaving,
      breakEvenMonths,
      worthIt,
    };
  }, [
    outstanding,
    currentRate,
    newRate,
    remainingTenure,
    processingFee,
    legalCharges,
  ]);

  return (
    <div className="space-y-6">
      <CalcSection title="Current Loan">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Outstanding Loan Amount (₹)</Label>
            <NumericInput
              value={outstanding}
              onChange={setOutstanding}
              placeholder="40,00,000"
              min={0}
              className={CALC_INPUT_CLASS}
            />
          </div>
          <div>
            <Label>Remaining Tenure (Months)</Label>
            <NumericInput
              value={remainingTenure}
              onChange={setRemainingTenure}
              placeholder="180"
              min={1}
              max={360}
              className={CALC_INPUT_CLASS}
            />
          </div>
          <div>
            <Label>Current Interest Rate (%)</Label>
            <NumericInput
              value={currentRate}
              onChange={setCurrentRate}
              placeholder="9.0"
              min={0}
              max={20}
              step={0.1}
              className={CALC_INPUT_CLASS}
            />
          </div>
        </div>
      </CalcSection>

      <CalcSection title="New Loan Offer">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>New Bank Rate (%)</Label>
            <NumericInput
              value={newRate}
              onChange={setNewRate}
              placeholder="8.5"
              min={0}
              max={20}
              step={0.1}
              className={CALC_INPUT_CLASS}
            />
          </div>
          <div>
            <Label>Processing Fee (%)</Label>
            <NumericInput
              value={processingFee}
              onChange={setProcessingFee}
              placeholder="0.5"
              min={0}
              max={3}
              step={0.1}
              className={CALC_INPUT_CLASS}
            />
          </div>
          <div>
            <Label>Legal/Valuation Charges (₹)</Label>
            <NumericInput
              value={legalCharges}
              onChange={setLegalCharges}
              placeholder="15,000"
              min={0}
              className={CALC_INPUT_CLASS}
            />
          </div>
        </div>
      </CalcSection>

      {results && (
        <div className="space-y-4">
          <Verdict
            type={
              results.worthIt
                ? "good"
                : results.netSaving > 0
                  ? "neutral"
                  : "bad"
            }
          >
            {results.worthIt
              ? `Yes, transfer! Net saving: ${formatLakhs(results.netSaving)}`
              : results.netSaving > 0
                ? `Marginal saving of ${formatINR(results.netSaving)} — probably not worth the hassle`
                : `Not worth it. You'd lose ${formatINR(Math.abs(results.netSaving))}`}
            {results.breakEvenMonths > 0 && results.netSaving > 0 && (
              <span className="block text-sm font-normal mt-1">
                Break-even after {formatMonths(results.breakEvenMonths)}
              </span>
            )}
          </Verdict>

          {results && (
            <div className="mt-4 p-4 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-sm font-medium text-foreground mb-1">
                Before you start the transfer paperwork:
              </p>
              <p className="text-sm text-muted-foreground">
                Call your current bank and show them the new offer. Ask for a rate match.
                Banks often reduce rates by 0.25–0.5% for CIBIL 750+ customers — especially
                those with good repayment history. This saves 2–4 weeks of paperwork.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Only proceed with the transfer if your bank refuses to negotiate.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Net Saving"
              value={
                results.netSaving > 0
                  ? `+${formatLakhs(results.netSaving)}`
                  : formatLakhs(results.netSaving)
              }
              valueColor={
                results.netSaving > 0 ? "text-positive" : "text-negative"
              }
              sub="After all transfer costs"
            />
            <StatCard
              label="Monthly EMI Difference"
              value={
                results.monthlySaving > 0
                  ? `-${formatINR(results.monthlySaving)}`
                  : `+${formatINR(Math.abs(results.monthlySaving))}`
              }
              valueColor={
                results.monthlySaving > 0 ? "text-positive" : "text-negative"
              }
              sub={
                results.monthlySaving > 0
                  ? "You save per month"
                  : "You pay extra per month"
              }
            />
            <StatCard
              label="Break-even Month"
              value={
                results.breakEvenMonths > 0
                  ? formatMonths(results.breakEvenMonths)
                  : "N/A"
              }
              sub={
                results.breakEvenMonths > 0
                  ? "When savings cover transfer costs"
                  : "No break-even point"
              }
            />
          </div>

          <TableCard>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium">Metric</th>
                  <th className="text-right px-4 py-3 font-medium">
                    Current Bank
                  </th>
                  <th className="text-right px-4 py-3 font-medium">
                    New Bank
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">
                    Interest Rate
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {currentRate}%
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-positive">
                    {newRate}%
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">
                    Monthly EMI
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatINR(results.oldEMI)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatINR(results.newEMI)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">
                    Total Interest
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatLakhs(results.oldTotalInterest)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatLakhs(results.newTotalInterest)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">
                    Transfer Costs
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    —
                  </td>
                  <td className="px-4 py-3 text-right text-negative">
                    -{formatINR(results.totalTransferCost)}
                  </td>
                </tr>
                <tr className="bg-muted/50 font-semibold">
                  <td className="px-4 py-3">Net Saving</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    —
                  </td>
                  <td
                    className={`px-4 py-3 text-right ${results.netSaving > 0 ? "text-positive" : "text-negative"}`}
                  >
                    {results.netSaving > 0 ? "+" : ""}
                    {formatLakhs(results.netSaving)}
                  </td>
                </tr>
              </tbody>
            </table>
          </TableCard>

          {results && results.breakEvenMonths > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-foreground mb-3">
                When does the transfer break even?
              </h3>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min(100, (results.breakEvenMonths / (remainingTenure as number)) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {remainingTenure} months total
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <div>
                    <p className="text-negative font-medium">Transfer costs</p>
                    <p className="text-muted-foreground">{formatINR(results.totalTransferCost)} upfront</p>
                  </div>
                  <div className="text-center">
                    <p className="text-primary font-medium">Break-even</p>
                    <p className="text-muted-foreground">Month {results.breakEvenMonths}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-positive font-medium">Net saving</p>
                    <p className="text-muted-foreground">{formatLakhs(results.netSaving)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Callout type="info">
            RBI mandates zero prepayment penalty on floating rate home loans.
            Your current bank cannot charge you for closing the loan before
            transfer.
          </Callout>
        </div>
      )}
    </div>
  );
}
