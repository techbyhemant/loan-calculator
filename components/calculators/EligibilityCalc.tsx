"use client";

import { useState, useMemo } from "react";

import { calculateMaxEMI, calculateMaxLoan } from "@/lib/calculations/eligibilityCalcs";
import { formatINR, formatLakhs } from "@/lib/utils/formatters";

import NumericInput from "@/components/ui/NumericInput";
import {
  CALC_INPUT_CLASS,
  CalcSection,
  StatCard,
  TableCard,
  Callout,
  Label,
} from "./shared";

const LENDERS = [
  { name: "SBI", rate: 8.5 },
  { name: "HDFC", rate: 8.75 },
  { name: "ICICI", rate: 8.75 },
  { name: "Kotak", rate: 8.7 },
] as const;

export default function EligibilityCalc() {
  const [monthlyIncome, setMonthlyIncome] = useState<number | "">(100000);
  const [existingEMIs, setExistingEMIs] = useState<number | "">(0);
  const [interestRate, setInterestRate] = useState<number | "">(8.5);
  const [tenureYears, setTenureYears] = useState<number | "">(20);

  const results = useMemo(() => {
    if (!monthlyIncome || !interestRate || !tenureYears) return null;
    const existing = existingEMIs || 0;
    const maxEMI = calculateMaxEMI(monthlyIncome, existing);
    if (maxEMI <= 0) return { maxEMI: 0, maxLoan: 0, lenderResults: [] };
    const maxLoan = calculateMaxLoan(maxEMI, interestRate, tenureYears);
    const lenderResults = LENDERS.map((lender) => ({
      name: lender.name,
      rate: lender.rate,
      maxLoan: calculateMaxLoan(maxEMI, lender.rate, tenureYears),
    }));
    return { maxEMI, maxLoan, lenderResults };
  }, [monthlyIncome, existingEMIs, interestRate, tenureYears]);

  return (
    <div className="space-y-6">
      <CalcSection title="Enter Your Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Monthly Net Income (₹)</Label>
            <NumericInput value={monthlyIncome} onChange={setMonthlyIncome} placeholder="1,00,000" min={0} className={CALC_INPUT_CLASS} />
          </div>
          <div>
            <Label>Existing Monthly EMIs (₹)</Label>
            <NumericInput value={existingEMIs} onChange={setExistingEMIs} placeholder="0" min={0} className={CALC_INPUT_CLASS} />
          </div>
          <div>
            <Label>Interest Rate (%)</Label>
            <NumericInput value={interestRate} onChange={setInterestRate} placeholder="8.5" min={0} max={20} step={0.1} className={CALC_INPUT_CLASS} />
          </div>
          <div>
            <Label>Loan Tenure (Years)</Label>
            <NumericInput value={tenureYears} onChange={setTenureYears} placeholder="20" min={1} max={30} className={CALC_INPUT_CLASS} />
          </div>
        </div>
      </CalcSection>

      {results && results.maxEMI > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard label="Maximum Eligible Loan" value={formatLakhs(results.maxLoan)} sub={formatINR(results.maxLoan)} valueColor="text-blue-700" />
            <StatCard label="Maximum EMI Capacity" value={formatINR(results.maxEMI)} sub="50% of net income minus existing EMIs" valueColor="text-green-700" />
          </div>

          <TableCard
            title="Lender-wise Eligibility Estimate"
            description="Based on your income and existing EMIs"
            footer="* Rates are indicative. Actual rates vary based on credit score, employment type, and property location."
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium">Lender</th>
                  <th className="text-right px-4 py-3 font-medium">Rate</th>
                  <th className="text-right px-4 py-3 font-medium">Max Loan</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {results.lenderResults.map((lender) => (
                  <tr key={lender.name}>
                    <td className="px-4 py-3 font-medium">{lender.name}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{lender.rate}%</td>
                    <td className="px-4 py-3 text-right font-semibold text-blue-700">{formatLakhs(lender.maxLoan)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>
        </div>
      )}

      {results && results.maxEMI <= 0 && (
        <Callout type="warning">
          Your existing EMIs exceed 50% of your net income. Consider reducing existing obligations before applying for a new loan.
        </Callout>
      )}
    </div>
  );
}
