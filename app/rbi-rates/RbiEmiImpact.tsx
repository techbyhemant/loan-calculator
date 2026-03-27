"use client";

import { useState, useMemo } from "react";
import NumericInput from "@/components/ui/NumericInput";
import { CALC_INPUT_CLASS } from "@/components/calculators/shared";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function calculateEMI(principal: number, annualRate: number, months: number): number {
  if (annualRate === 0) return principal / months;
  const r = annualRate / 12 / 100;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

export function RbiEmiImpact() {
  const [loanAmount, setLoanAmount] = useState<number | "">(5000000);
  const [currentRate, setCurrentRate] = useState<number | "">(8.5);
  const [tenure, setTenure] = useState<number | "">(240);
  const [rateChange, setRateChange] = useState(-0.25);

  const result = useMemo(() => {
    if (!loanAmount || !currentRate || !tenure) return null;
    const oldEMI = calculateEMI(loanAmount, currentRate, tenure);
    const newEMI = calculateEMI(loanAmount, currentRate + rateChange, tenure);
    const diff = newEMI - oldEMI;
    return { oldEMI: Math.round(oldEMI), newEMI: Math.round(newEMI), diff: Math.round(diff) };
  }, [loanAmount, currentRate, tenure, rateChange]);

  const formatINR = (n: number) => "\u20B9" + Math.round(n).toLocaleString("en-IN");

  return (
    <div className="mt-8 p-5 bg-card border border-border rounded-lg">
      <h2 className="font-medium text-foreground text-base mb-4">
        What does the rate change mean for your loan?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Loan outstanding</label>
          <NumericInput value={loanAmount} onChange={setLoanAmount} className={CALC_INPUT_CLASS} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Current rate (%)</label>
          <NumericInput value={currentRate} onChange={setCurrentRate} step={0.01} className={CALC_INPUT_CLASS} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Rate change</label>
          <Select value={String(rateChange)} onValueChange={(v) => setRateChange(Number(v))}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-0.5">-0.50% (big cut)</SelectItem>
              <SelectItem value="-0.25">-0.25% (standard cut)</SelectItem>
              <SelectItem value="0.25">+0.25% (hike)</SelectItem>
              <SelectItem value="0.5">+0.50% (big hike)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {result && (
        <div className="p-3 rounded-lg bg-muted flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">
            Your EMI changes from {formatINR(result.oldEMI)} to {formatINR(result.newEMI)}
          </span>
          <span className={`text-sm font-semibold font-mono ${result.diff < 0 ? "text-positive" : "text-negative"}`}>
            {result.diff < 0 ? "\u2193" : "\u2191"} {formatINR(Math.abs(result.diff))}/month
          </span>
        </div>
      )}
    </div>
  );
}
