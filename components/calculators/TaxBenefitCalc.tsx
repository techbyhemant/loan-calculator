"use client";

import { useState, useMemo } from "react";

import { calculateTaxBenefit } from "@/lib/calculations/taxBenefitCalcs";
import { formatINR } from "@/lib/utils/formatters";

import NumericInput from "@/components/ui/NumericInput";
import {
  CALC_INPUT_CLASS,
  CalcSection,
  StatCard,
  TableCard,
  ToggleGroup,
  Verdict,
  Label,
} from "./shared";

export default function TaxBenefitCalc() {
  const [annualPrincipal, setAnnualPrincipal] = useState<number | "">(180000);
  const [annualInterest, setAnnualInterest] = useState<number | "">(350000);
  const [grossIncome, setGrossIncome] = useState<number | "">(1500000);
  const [other80C, setOther80C] = useState<number | "">(50000);
  const [loanType, setLoanType] = useState<"self-occupied" | "rented-out">("self-occupied");

  const results = useMemo(() => {
    if (!annualPrincipal || !annualInterest || !grossIncome) return null;
    return calculateTaxBenefit(annualPrincipal, annualInterest, grossIncome, other80C || 0, loanType);
  }, [annualPrincipal, annualInterest, grossIncome, other80C, loanType]);

  return (
    <div className="space-y-6">
      <CalcSection title="Enter Your Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Annual Principal Repaid (₹)</Label>
            <NumericInput value={annualPrincipal} onChange={setAnnualPrincipal} placeholder="1,80,000" min={0} className={CALC_INPUT_CLASS} />
          </div>
          <div>
            <Label>Annual Interest Paid (₹)</Label>
            <NumericInput value={annualInterest} onChange={setAnnualInterest} placeholder="3,50,000" min={0} className={CALC_INPUT_CLASS} />
          </div>
          <div>
            <Label>Gross Annual Income (₹)</Label>
            <NumericInput value={grossIncome} onChange={setGrossIncome} placeholder="15,00,000" min={0} className={CALC_INPUT_CLASS} />
          </div>
          <div>
            <Label>Other 80C Investments (₹)</Label>
            <NumericInput value={other80C} onChange={setOther80C} placeholder="50,000" min={0} className={CALC_INPUT_CLASS} />
            <p className="text-xs text-muted-foreground mt-1">EPF + ELSS + LIC + school fees</p>
          </div>
          <div className="sm:col-span-2">
            <Label>Property Type</Label>
            <ToggleGroup
              value={loanType}
              onChange={setLoanType}
              options={[
                { value: "self-occupied", label: "Self-Occupied" },
                { value: "rented-out", label: "Rented Out" },
              ]}
            />
          </div>
        </div>
      </CalcSection>

      {results && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Section 24(b) Deduction" value={formatINR(results.sec24Deduction)} sub={`Interest — ${loanType === "self-occupied" ? "max ₹2L" : "no cap"}`} valueColor="text-primary" />
            <StatCard label="Section 80C Deduction" value={formatINR(results.sec80CDeduction)} sub="Principal — shared ₹1.5L limit" valueColor="text-positive" />
            <StatCard label="Total Deduction" value={formatINR(results.totalDeduction)} sub="24(b) + 80C combined" valueColor="text-primary" />
          </div>

          <TableCard title="Tax Saved by Bracket">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium">Tax Bracket</th>
                  <th className="text-right px-4 py-3 font-medium">Old Regime</th>
                  <th className="text-right px-4 py-3 font-medium">New Regime</th>
                  <th className="text-right px-4 py-3 font-medium">Better Option</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { label: "10% bracket", old: results.oldRegimeTax.at10, newR: results.newRegimeTax.at10 },
                  { label: "20% bracket", old: results.oldRegimeTax.at20, newR: results.newRegimeTax.at20 },
                  { label: "30% bracket", old: results.oldRegimeTax.at30, newR: results.newRegimeTax.at30 },
                ].map((row) => (
                  <tr key={row.label}>
                    <td className="px-4 py-3 font-medium">{row.label}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${row.old >= row.newR ? "text-positive" : "text-muted-foreground"}`}>{formatINR(row.old)}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${row.newR > row.old ? "text-positive" : "text-muted-foreground"}`}>{formatINR(row.newR)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${row.old >= row.newR ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"}`}>
                        {row.old >= row.newR ? "Old Regime" : "New Regime"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>

          <Verdict type={results.recommendedRegime === "old" ? "neutral" : "good"}>
            Based on your income of {formatINR(grossIncome as number)}, the{" "}
            <strong>{results.recommendedRegime === "old" ? "Old Regime" : "New Regime"}</strong>{" "}
            saves you more. Estimated tax saved: <strong>{formatINR(Math.max(results.oldRegimeSaved, results.newRegimeSaved))}</strong>
          </Verdict>
        </div>
      )}
    </div>
  );
}
