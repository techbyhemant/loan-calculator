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
  ToggleGroup,
} from "./shared";
import { calculateEMI } from "@/lib/calculations/loanCalcs";

type TaxBracketPercent = 0 | 10 | 20 | 30;

const TAX_BRACKET_OPTIONS: Array<{
  value: string;
  label: string;
}> = [
  { value: "0", label: "0%" },
  { value: "10", label: "10%" },
  { value: "20", label: "20%" },
  { value: "30", label: "30%" },
];

export default function EducationLoan80ECalc() {
  const [loanAmount, setLoanAmount] = useState<number | "">(1000000);
  const [ratePA, setRatePA] = useState<number | "">(10.5);
  const [moratoriumMonths, setMoratoriumMonths] = useState<number | "">(24);
  const [tenureAfterMoratorium, setTenureAfterMoratorium] = useState<
    number | ""
  >(120);
  const [taxBracket, setTaxBracket] = useState<TaxBracketPercent>(30);

  const results = useMemo(() => {
    if (!loanAmount || !ratePA || !tenureAfterMoratorium) return null;

    const principal = loanAmount as number;
    const rate = ratePA as number;
    const moratMonths = (moratoriumMonths as number) || 0;
    const tenure = tenureAfterMoratorium as number;
    const bracket = taxBracket / 100;

    // Annual interest on original principal (first year, for 80E calculation)
    const annualInterest = principal * (rate / 100);

    // Section 80E has NO upper limit
    const deduction80E = annualInterest;
    const taxSaved = deduction80E * bracket;
    const effectiveRate = rate * (1 - bracket);

    // Interest during moratorium (simple interest accrual)
    const monthlyInterest = principal * (rate / 100 / 12);
    const interestDuringMoratorium = monthlyInterest * moratMonths;
    const outstandingAfterMoratorium = principal + interestDuringMoratorium;

    // EMI after moratorium on the capitalised amount
    const emiAfterMoratorium = calculateEMI(
      outstandingAfterMoratorium,
      rate,
      tenure
    );

    // Year-by-year breakdown for first 5 years of repayment
    const yearlyBreakdown: Array<{
      year: number;
      annualInterestPaid: number;
      deduction80E: number;
      taxSavedYear: number;
      netInterestCost: number;
    }> = [];

    let balanceForTable = outstandingAfterMoratorium;
    const monthlyRate = rate / 100 / 12;

    for (let year = 1; year <= 5; year++) {
      let yearInterest = 0;
      for (let m = 0; m < 12; m++) {
        if (balanceForTable <= 0.01) break;
        const interest = balanceForTable * monthlyRate;
        const principalPaid = Math.min(
          emiAfterMoratorium - interest,
          balanceForTable
        );
        yearInterest += interest;
        balanceForTable = Math.max(0, balanceForTable - principalPaid);
      }

      // 80E deduction — entire interest paid, no cap, for up to 8 years
      const yearDeduction = yearInterest;
      const yearTaxSaved = yearDeduction * bracket;

      yearlyBreakdown.push({
        year,
        annualInterestPaid: yearInterest,
        deduction80E: yearDeduction,
        taxSavedYear: yearTaxSaved,
        netInterestCost: yearInterest - yearTaxSaved,
      });
    }

    return {
      annualInterest,
      deduction80E,
      taxSaved,
      effectiveRate,
      monthlyInterest,
      interestDuringMoratorium,
      outstandingAfterMoratorium,
      emiAfterMoratorium,
      yearlyBreakdown,
      moratMonths,
      principal,
      rate,
    };
  }, [loanAmount, ratePA, moratoriumMonths, tenureAfterMoratorium, taxBracket]);

  return (
    <div className="space-y-6">
      <CalcSection title="Enter Your Education Loan Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Loan Amount (&#8377;)</Label>
            <NumericInput
              value={loanAmount}
              onChange={setLoanAmount}
              placeholder="10,00,000"
              min={0}
              className={CALC_INPUT_CLASS}
            />
          </div>
          <div>
            <Label>Interest Rate (% p.a.)</Label>
            <NumericInput
              value={ratePA}
              onChange={setRatePA}
              placeholder="10.5"
              min={0}
              max={20}
              step={0.1}
              className={CALC_INPUT_CLASS}
            />
          </div>
          <div>
            <Label>Moratorium Period (Months)</Label>
            <NumericInput
              value={moratoriumMonths}
              onChange={setMoratoriumMonths}
              placeholder="24"
              min={0}
              max={84}
              className={CALC_INPUT_CLASS}
            />
          </div>
          <div>
            <Label>Repayment Tenure (Months)</Label>
            <NumericInput
              value={tenureAfterMoratorium}
              onChange={setTenureAfterMoratorium}
              placeholder="120"
              min={1}
              max={180}
              className={CALC_INPUT_CLASS}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Your Tax Bracket</Label>
            <ToggleGroup
              value={String(taxBracket)}
              onChange={(val) =>
                setTaxBracket(Number(val) as TaxBracketPercent)
              }
              options={TAX_BRACKET_OPTIONS}
            />
          </div>
        </div>
      </CalcSection>

      {results && (
        <div className="space-y-4">
          <Verdict type="good">
            Your {results.rate}% loan effectively costs only{" "}
            {results.effectiveRate.toFixed(1)}% after Section 80E
            {taxBracket === 0 && (
              <span className="block text-sm font-normal mt-1">
                Select a tax bracket above to see the benefit
              </span>
            )}
          </Verdict>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="Annual 80E Deduction"
              value={formatLakhs(results.deduction80E)}
              sub="No upper limit"
              valueColor="text-green-700"
            />
            <StatCard
              label="Tax Saved Per Year"
              value={formatINR(results.taxSaved)}
              sub={`At ${taxBracket}% bracket`}
              valueColor="text-green-700"
            />
            <StatCard
              label="Effective Rate"
              value={`${results.effectiveRate.toFixed(1)}%`}
              sub={`Down from ${results.rate}%`}
              valueColor="text-blue-700"
            />
            <StatCard
              label="Interest During Moratorium"
              value={formatLakhs(results.interestDuringMoratorium)}
              sub={`${results.moratMonths} months`}
              valueColor="text-amber-700"
            />
          </div>

          {results.moratMonths > 0 && (
            <Callout type="warning">
              During the {results.moratMonths}-month moratorium,{" "}
              {formatINR(results.monthlyInterest)}/month in interest accrues.
              Your outstanding grows from {formatLakhs(results.principal)} to{" "}
              {formatLakhs(results.outstandingAfterMoratorium)} before your
              first EMI of {formatINR(results.emiAfterMoratorium)}.
            </Callout>
          )}

          <Callout type="info">
            Section 80E allows deduction of the <strong>entire</strong> interest
            paid (no upper limit) for up to 8 years from when you start
            repaying. This makes education loans one of the most tax-efficient
            forms of debt.
          </Callout>

          <TableCard
            title="Year-by-Year Tax Benefit (First 5 Years of Repayment)"
            description="80E deduction available for up to 8 years from start of repayment"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium">Year</th>
                  <th className="text-right px-4 py-3 font-medium">
                    Interest Paid
                  </th>
                  <th className="text-right px-4 py-3 font-medium">
                    80E Deduction
                  </th>
                  <th className="text-right px-4 py-3 font-medium">
                    Tax Saved
                  </th>
                  <th className="text-right px-4 py-3 font-medium">
                    Net Interest
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {results.yearlyBreakdown.map((row) => (
                  <tr key={row.year}>
                    <td className="px-4 py-3 text-muted-foreground">
                      Year {row.year}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatINR(row.annualInterestPaid)}
                    </td>
                    <td className="px-4 py-3 text-right text-green-700">
                      {formatINR(row.deduction80E)}
                    </td>
                    <td className="px-4 py-3 text-right text-green-700 font-medium">
                      {formatINR(row.taxSavedYear)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatINR(row.netInterestCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>

          <TableCard title="Quick Comparison">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium">Metric</th>
                  <th className="text-right px-4 py-3 font-medium">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">
                    PPF Return Rate
                  </td>
                  <td className="px-4 py-3 text-right font-medium">7.1%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">
                    Your Effective Loan Rate
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-green-700">
                    {results.effectiveRate.toFixed(1)}%
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">
                    EMI After Moratorium
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatINR(results.emiAfterMoratorium)}
                  </td>
                </tr>
                <tr className="bg-muted/50 font-semibold">
                  <td className="px-4 py-3">Verdict</td>
                  <td className="px-4 py-3 text-right">
                    {results.effectiveRate > 7.1
                      ? "Loan rate higher than PPF — prepay surplus"
                      : "Effective rate below PPF — invest surplus in PPF"}
                  </td>
                </tr>
              </tbody>
            </table>
          </TableCard>
        </div>
      )}
    </div>
  );
}
