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
  const [foirPercent, setFoirPercent] = useState<number>(50);
  const [hasCoApplicant, setHasCoApplicant] = useState(false);
  const [coApplicantSalary, setCoApplicantSalary] = useState<number | "">(0);

  const results = useMemo(() => {
    if (!salary || !rate || !tenure) return null;
    const existing = (existingEMIs as number) || 0;
    const totalIncome = (salary as number) + (hasCoApplicant ? (coApplicantSalary as number) || 0 : 0);
    const foirRatio = foirPercent / 100;
    const maxEMI = calculateMaxEMI(totalIncome, existing, foirRatio);
    if (maxEMI <= 0) return { maxEMI: 0, maxLoan: 0, emiPercent: 0 };
    const maxLoan = calculateMaxLoan(maxEMI, rate as number, tenure as number);
    const emiPercent = Math.round((maxEMI / totalIncome) * 100);
    return { maxEMI, maxLoan, emiPercent };
  }, [salary, existingEMIs, rate, tenure, foirPercent, hasCoApplicant, coApplicantSalary]);

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

        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <Label>FOIR (bank income limit)</Label>
            <span className="text-sm font-mono font-medium text-primary">{foirPercent}%</span>
          </div>
          <input
            type="range"
            min={40}
            max={65}
            step={5}
            value={foirPercent}
            onChange={(e) => setFoirPercent(Number(e.target.value))}
            className="w-full h-2 rounded-full bg-muted focus:outline-none cursor-pointer"
            style={{ '--slider-progress': `${((foirPercent - 40) / 25) * 100}%` } as React.CSSProperties}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>40% conservative</span>
            <span>50% standard</span>
            <span>65% high-income</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="coApplicant"
              checked={hasCoApplicant}
              onChange={(e) => setHasCoApplicant(e.target.checked)}
              className="rounded border-border"
            />
            <label htmlFor="coApplicant" className="text-sm text-foreground cursor-pointer">
              Add co-applicant (spouse / family)
            </label>
          </div>
          {hasCoApplicant && (
            <div className="ml-6">
              <Label>Co-applicant monthly salary</Label>
              <NumericInput
                value={coApplicantSalary}
                onChange={setCoApplicantSalary}
                placeholder="e.g. 50,000"
                className={CALC_INPUT_CLASS}
              />
              {coApplicantSalary && Number(coApplicantSalary) > 0 && (
                <p className="text-xs text-positive mt-1">
                  Combined: {formatINR(Number(salary || 0) + Number(coApplicantSalary))}/mo
                </p>
              )}
            </div>
          )}
        </div>
      </CalcSection>

      {results && results.maxEMI > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Max Home Loan" value={formatLakhs(results.maxLoan)} sub={formatINR(results.maxLoan)} valueColor="text-primary" />
            <StatCard label="Max EMI You Can Afford" value={formatINR(results.maxEMI)} sub="per month" valueColor="text-positive" />
            <StatCard label="EMI-to-Salary Ratio" value={`${results.emiPercent}%`} sub="of net salary" valueColor="text-primary" />
          </div>

          <TableCard title="How Much Home Loan on Different Salaries?" description={`At ${rate}% for ${tenure} years, ${foirPercent}% FOIR`}>
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
                  const emi = calculateMaxEMI(s, 0, foirPercent / 100);
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
          Your existing EMIs exceed {foirPercent}% of your {hasCoApplicant ? "combined " : ""}income. Reduce existing obligations before applying for a home loan.
        </Callout>
      )}
    </div>
  );
}
