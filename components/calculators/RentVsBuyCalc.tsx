"use client";

import { useState, useMemo } from "react";

import { formatINR, formatLakhs } from "@/lib/utils/formatters";

import NumericInput from "@/components/ui/NumericInput";
import {
  CALC_INPUT_CLASS,
  CalcSection,
  CalcCard,
  Verdict,
  Callout,
  Label,
} from "./shared";

export default function RentVsBuyCalc() {
  const [propertyPrice, setPropertyPrice] = useState<number | "">(7500000);
  const [monthlyRent, setMonthlyRent] = useState<number | "">(25000);
  const [downPayment, setDownPayment] = useState<number | "">(1500000);
  const [loanRate, setLoanRate] = useState<number | "">(8.5);
  const [loanTenure, setLoanTenure] = useState<number | "">(20);
  const [rentIncrease, setRentIncrease] = useState<number | "">(5);
  const [propertyAppreciation, setPropertyAppreciation] = useState<number | "">(6);

  const results = useMemo(() => {
    if (!propertyPrice || !monthlyRent || !downPayment || !loanRate || !loanTenure) return null;
    const price = propertyPrice as number;
    const rent = monthlyRent as number;
    const dp = downPayment as number;
    const rate = loanRate as number;
    const years = loanTenure as number;
    const rentInc = ((rentIncrease as number) || 0) / 100;
    const propApp = ((propertyAppreciation as number) || 0) / 100;

    const loanAmount = price - dp;
    const r = rate / 12 / 100;
    const n = years * 12;
    const emi = r === 0 ? loanAmount / n : (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    const totalEMI = emi * n;
    const totalInterest = totalEMI - loanAmount;
    const registration = price * 0.07;
    const maintenance = price * 0.01 * years;
    const totalBuyCost = dp + totalEMI + registration + maintenance;
    const propertyValueAtEnd = price * Math.pow(1 + propApp, years);
    const netBuyCost = totalBuyCost - propertyValueAtEnd;

    let totalRent = 0;
    let currentRent = rent;
    for (let y = 0; y < years; y++) { totalRent += currentRent * 12; currentRent *= 1 + rentInc; }

    const investReturn = 0.10;
    let investmentCorpus = dp;
    currentRent = rent;
    for (let y = 0; y < years; y++) {
      investmentCorpus *= 1 + investReturn;
      investmentCorpus += Math.max(0, emi - currentRent) * 12;
      currentRent *= 1 + rentInc;
    }
    const netRentCost = totalRent - investmentCorpus + dp;

    const buyBetter = netBuyCost < netRentCost;
    const difference = Math.abs(netBuyCost - netRentCost);

    return { emi, totalInterest, registration, totalBuyCost, propertyValueAtEnd, netBuyCost, totalRent, investmentCorpus, netRentCost, buyBetter, difference, finalRent: rent * Math.pow(1 + rentInc, years) };
  }, [propertyPrice, monthlyRent, downPayment, loanRate, loanTenure, rentIncrease, propertyAppreciation]);

  return (
    <div className="space-y-6">
      <CalcSection title="Enter Your Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><Label>Property Price (₹)</Label><NumericInput value={propertyPrice} onChange={setPropertyPrice} placeholder="75,00,000" min={0} className={CALC_INPUT_CLASS} /></div>
          <div><Label>Current Monthly Rent (₹)</Label><NumericInput value={monthlyRent} onChange={setMonthlyRent} placeholder="25,000" min={0} className={CALC_INPUT_CLASS} /></div>
          <div><Label>Down Payment (₹)</Label><NumericInput value={downPayment} onChange={setDownPayment} placeholder="15,00,000" min={0} className={CALC_INPUT_CLASS} /></div>
          <div><Label>Loan Interest Rate (%)</Label><NumericInput value={loanRate} onChange={setLoanRate} placeholder="8.5" min={0} max={20} step={0.1} className={CALC_INPUT_CLASS} /></div>
          <div><Label>Loan Tenure (Years)</Label><NumericInput value={loanTenure} onChange={setLoanTenure} placeholder="20" min={1} max={30} className={CALC_INPUT_CLASS} /></div>
          <div><Label>Annual Rent Increase (%)</Label><NumericInput value={rentIncrease} onChange={setRentIncrease} placeholder="5" min={0} max={20} step={0.5} className={CALC_INPUT_CLASS} /></div>
          <div className="sm:col-span-2"><Label>Expected Property Appreciation (% p.a.)</Label><NumericInput value={propertyAppreciation} onChange={setPropertyAppreciation} placeholder="6" min={0} max={20} step={0.5} className={CALC_INPUT_CLASS} /></div>
        </div>
      </CalcSection>

      {results && (
        <div className="space-y-4">
          <Verdict type={results.buyBetter ? "good" : "neutral"}>
            {results.buyBetter
              ? `Buying is better by ${formatLakhs(results.difference)} over ${loanTenure} years`
              : `Renting + investing is better by ${formatLakhs(results.difference)} over ${loanTenure} years`}
          </Verdict>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CalcCard className={results.buyBetter ? "ring-2 ring-positive/20" : ""}>
              <h2 className="text-base font-semibold mb-3">Buy</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Monthly EMI</span><span className="font-medium">{formatINR(results.emi)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total Interest</span><span className="font-medium text-negative">{formatLakhs(results.totalInterest)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Registration + Stamp</span><span className="font-medium">{formatLakhs(results.registration)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Property Value ({loanTenure}yr)</span><span className="font-medium text-positive">{formatLakhs(results.propertyValueAtEnd)}</span></div>
                <div className="border-t pt-2 flex justify-between font-semibold"><span>Net Cost</span><span>{formatLakhs(results.netBuyCost)}</span></div>
              </div>
            </CalcCard>

            <CalcCard className={!results.buyBetter ? "ring-2 ring-primary/20" : ""}>
              <h2 className="text-base font-semibold mb-3">Rent + Invest</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Total Rent ({loanTenure}yr)</span><span className="font-medium">{formatLakhs(results.totalRent)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Rent in Year {loanTenure}</span><span className="font-medium">{formatINR(results.finalRent)}/mo</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Investment Corpus</span><span className="font-medium text-positive">{formatLakhs(results.investmentCorpus)}</span></div>
                <div className="border-t pt-2 flex justify-between font-semibold"><span>Net Cost</span><span>{formatLakhs(results.netRentCost)}</span></div>
              </div>
            </CalcCard>
          </div>

          <Callout type="warning">
            Note: This is a simplified comparison. Actual results depend on location-specific property appreciation, tax benefits (Section 24b/80C), and your investment returns.
          </Callout>
        </div>
      )}
    </div>
  );
}
