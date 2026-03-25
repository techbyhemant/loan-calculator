"use client";

import { useState, useMemo } from "react";

import { calculateMaxEMI, calculateMaxLoan } from "@/lib/calculations/eligibilityCalcs";
import { formatINR, formatLakhs } from "@/lib/utils/formatters";

import NumericInput from "@/components/ui/NumericInput";
import { Button } from "@/components/ui/button";
import {
  CALC_INPUT_CLASS,
  CalcSection,
  StatCard,
  TableCard,
  Callout,
  Label,
} from "./shared";

const SALARY_PRESETS = [
  { label: "₹30K", value: 30000 },
  { label: "₹50K", value: 50000 },
  { label: "₹75K", value: 75000 },
  { label: "₹1L", value: 100000 },
  { label: "₹1.5L", value: 150000 },
  { label: "₹2L", value: 200000 },
];

export default function SalaryToEmiCalc() {
  const [salary, setSalary] = useState<number | "">(100000);
  const [existingEMIs, setExistingEMIs] = useState<number | "">(0);
  const [rate, setRate] = useState<number | "">(8.5);
  const [tenure, setTenure] = useState<number | "">(20);

  const results = useMemo(() => {
    if (!salary || !rate || !tenure) return null;
    const existing = (existingEMIs as number) || 0;
    const maxEMI = calculateMaxEMI(salary as number, existing);
    if (maxEMI <= 0) return { maxEMI: 0, maxLoan: 0, emiPercent: 0 };
    const maxLoan = calculateMaxLoan(maxEMI, rate as number, tenure as number);
    const emiPercent = Math.round((maxEMI / (salary as number)) * 100);
    return { maxEMI, maxLoan, emiPercent };
  }, [salary, existingEMIs, rate, tenure]);

  return (
    <div className="space-y-6">
      <CalcSection title="Enter Your Salary Details">
        <div className="mb-4">
          <Label>Monthly Net Salary</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {SALARY_PRESETS.map((p) => (
              <Button
                key={p.value}
                type="button"
                variant={salary === p.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSalary(p.value)}
              >
                {p.label}
              </Button>
            ))}
          </div>
          <NumericInput value={salary} onChange={setSalary} placeholder="1,00,000" min={0} className={CALC_INPUT_CLASS} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Existing EMIs (₹)</Label>
            <NumericInput value={existingEMIs} onChange={setExistingEMIs} placeholder="0" min={0} className={CALC_INPUT_CLASS} />
          </div>
          <div>
            <Label>Interest Rate (%)</Label>
            <NumericInput value={rate} onChange={setRate} placeholder="8.5" min={0} max={20} step={0.1} className={CALC_INPUT_CLASS} />
          </div>
          <div>
            <Label>Tenure (Years)</Label>
            <NumericInput value={tenure} onChange={setTenure} placeholder="20" min={1} max={30} className={CALC_INPUT_CLASS} />
          </div>
        </div>
      </CalcSection>

      {results && results.maxEMI > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Max Home Loan" value={formatLakhs(results.maxLoan)} sub={formatINR(results.maxLoan)} valueColor="text-primary" />
            <StatCard label="Max EMI You Can Afford" value={formatINR(results.maxEMI)} sub="per month" valueColor="text-positive" />
            <StatCard label="EMI-to-Salary Ratio" value={`${results.emiPercent}%`} sub="of net salary" valueColor="text-primary" />
          </div>

          <TableCard title="How Much Home Loan on Different Salaries?" description={`At ${rate}% for ${tenure} years, 50% FOIR`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium">Monthly Salary</th>
                  <th className="text-right px-4 py-3 font-medium">Max EMI</th>
                  <th className="text-right px-4 py-3 font-medium">Max Loan</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[30000, 50000, 75000, 100000, 150000, 200000].map((s) => {
                  const emi = calculateMaxEMI(s, 0);
                  const loan = calculateMaxLoan(emi, (rate as number) || 8.5, (tenure as number) || 20);
                  const isCurrentSalary = s === salary;
                  return (
                    <tr key={s} className={isCurrentSalary ? "bg-primary/5" : ""}>
                      <td className="px-4 py-3 font-medium">
                        {formatINR(s)}
                        {isCurrentSalary && <span className="ml-2 text-xs text-primary">← You</span>}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{formatINR(emi)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-primary">{formatLakhs(loan)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableCard>
        </div>
      )}

      {results && results.maxEMI <= 0 && (
        <Callout type="warning">
          Your existing EMIs exceed 50% of your salary. Reduce existing obligations before applying for a home loan.
        </Callout>
      )}
    </div>
  );
}
