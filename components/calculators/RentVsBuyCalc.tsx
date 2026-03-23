"use client";

import { useState, useMemo } from "react";

import { formatINR, formatLakhs } from "@/lib/utils/formatters";

import NumericInput from "@/components/ui/NumericInput";
import { CALC_STYLES } from "./shared";

export default function RentVsBuyCalc() {
  const [propertyPrice, setPropertyPrice] = useState<number | "">(7500000);
  const [monthlyRent, setMonthlyRent] = useState<number | "">(25000);
  const [downPayment, setDownPayment] = useState<number | "">(1500000);
  const [loanRate, setLoanRate] = useState<number | "">(8.5);
  const [loanTenure, setLoanTenure] = useState<number | "">(20);
  const [rentIncrease, setRentIncrease] = useState<number | "">(5);
  const [propertyAppreciation, setPropertyAppreciation] = useState<number | "">(6);

  const results = useMemo(() => {
    if (!propertyPrice || !monthlyRent || !downPayment || !loanRate || !loanTenure)
      return null;

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
    const emi = r === 0
      ? loanAmount / n
      : (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    // Total cost of buying over tenure
    const totalEMI = emi * n;
    const totalInterest = totalEMI - loanAmount;
    const registration = price * 0.07; // ~7% stamp duty + registration
    const maintenance = price * 0.01 * years; // ~1% per year maintenance
    const totalBuyCost = dp + totalEMI + registration + maintenance;
    const propertyValueAtEnd = price * Math.pow(1 + propApp, years);
    const netBuyCost = totalBuyCost - propertyValueAtEnd;

    // Total cost of renting over same period
    let totalRent = 0;
    let currentRent = rent;
    for (let y = 0; y < years; y++) {
      totalRent += currentRent * 12;
      currentRent *= 1 + rentInc;
    }

    // Opportunity cost: invest down payment + monthly savings (EMI - rent) at 10%
    const investReturn = 0.10;
    let investmentCorpus = dp;
    currentRent = rent;
    for (let y = 0; y < years; y++) {
      investmentCorpus *= 1 + investReturn;
      const monthlySaving = Math.max(0, emi - currentRent);
      // Simplified annual SIP of monthly savings
      investmentCorpus += monthlySaving * 12;
      currentRent *= 1 + rentInc;
    }
    const netRentCost = totalRent - investmentCorpus + dp;

    const buyBetter = netBuyCost < netRentCost;
    const difference = Math.abs(netBuyCost - netRentCost);

    return {
      emi,
      loanAmount,
      totalInterest,
      registration,
      totalBuyCost,
      propertyValueAtEnd,
      netBuyCost,
      totalRent,
      investmentCorpus,
      netRentCost,
      buyBetter,
      difference,
      finalRent: rent * Math.pow(1 + rentInc, years),
    };
  }, [propertyPrice, monthlyRent, downPayment, loanRate, loanTenure, rentIncrease, propertyAppreciation]);

  const inputClass = CALC_STYLES.input;

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Enter Your Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Price (₹)
            </label>
            <NumericInput value={propertyPrice} onChange={setPropertyPrice} placeholder="75,00,000" min={0} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Monthly Rent (₹)
            </label>
            <NumericInput value={monthlyRent} onChange={setMonthlyRent} placeholder="25,000" min={0} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Down Payment (₹)
            </label>
            <NumericInput value={downPayment} onChange={setDownPayment} placeholder="15,00,000" min={0} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loan Interest Rate (%)
            </label>
            <NumericInput value={loanRate} onChange={setLoanRate} placeholder="8.5" min={0} max={20} step={0.1} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loan Tenure (Years)
            </label>
            <NumericInput value={loanTenure} onChange={setLoanTenure} placeholder="20" min={1} max={30} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Rent Increase (%)
            </label>
            <NumericInput value={rentIncrease} onChange={setRentIncrease} placeholder="5" min={0} max={20} step={0.5} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Property Appreciation (% p.a.)
            </label>
            <NumericInput value={propertyAppreciation} onChange={setPropertyAppreciation} placeholder="6" min={0} max={20} step={0.5} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          {/* Verdict */}
          <div
            className={`rounded-xl p-4 text-center font-semibold text-lg border ${
              results.buyBetter
                ? "bg-green-50 text-green-800 border-green-200"
                : "bg-blue-50 text-blue-800 border-blue-200"
            }`}
          >
            {results.buyBetter
              ? `Buying is better by ${formatLakhs(results.difference)} over ${loanTenure} years`
              : `Renting + investing is better by ${formatLakhs(results.difference)} over ${loanTenure} years`}
          </div>

          {/* Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`bg-white border rounded-xl shadow-sm p-4 ${results.buyBetter ? "border-green-300 ring-2 ring-green-100" : "border-gray-100"}`}>
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                Buy {results.buyBetter && <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full ml-1">Better</span>}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Monthly EMI</span><span className="font-medium">{formatINR(results.emi)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Total Interest</span><span className="font-medium text-red-600">{formatLakhs(results.totalInterest)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Registration + Stamp</span><span className="font-medium">{formatLakhs(results.registration)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Property Value ({loanTenure}yr)</span><span className="font-medium text-green-700">{formatLakhs(results.propertyValueAtEnd)}</span></div>
                <div className="border-t pt-2 flex justify-between font-semibold"><span>Net Cost</span><span>{formatLakhs(results.netBuyCost)}</span></div>
              </div>
            </div>

            <div className={`bg-white border rounded-xl shadow-sm p-4 ${!results.buyBetter ? "border-blue-300 ring-2 ring-blue-100" : "border-gray-100"}`}>
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                Rent + Invest {!results.buyBetter && <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full ml-1">Better</span>}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Total Rent ({loanTenure}yr)</span><span className="font-medium">{formatLakhs(results.totalRent)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Rent in Year {loanTenure}</span><span className="font-medium">{formatINR(results.finalRent)}/mo</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Investment Corpus</span><span className="font-medium text-green-700">{formatLakhs(results.investmentCorpus)}</span></div>
                <div className="border-t pt-2 flex justify-between font-semibold"><span>Net Cost</span><span>{formatLakhs(results.netRentCost)}</span></div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
            Note: This is a simplified comparison. Actual results depend on location-specific property appreciation, tax benefits (Section 24b/80C), and your investment returns. Use this as a directional guide, not a precise forecast.
          </div>
        </div>
      )}
    </div>
  );
}
