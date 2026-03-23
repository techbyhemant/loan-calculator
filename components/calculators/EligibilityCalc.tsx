"use client";

import { useState, useMemo } from "react";

import { calculateMaxEMI, calculateMaxLoan } from "@/lib/calculations/eligibilityCalcs";
import { formatINR, formatLakhs } from "@/lib/utils/formatters";

import NumericInput from "@/components/ui/NumericInput";
import { CALC_STYLES } from "./shared";

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

  const inputClass = CALC_STYLES.input;

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Enter Your Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Net Income (&rupee;)
            </label>
            <NumericInput
              value={monthlyIncome}
              onChange={setMonthlyIncome}
              placeholder="1,00,000"
              min={0}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Existing Monthly EMIs (&rupee;)
            </label>
            <NumericInput
              value={existingEMIs}
              onChange={setExistingEMIs}
              placeholder="0"
              min={0}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interest Rate (%)
            </label>
            <NumericInput
              value={interestRate}
              onChange={setInterestRate}
              placeholder="8.5"
              min={0}
              max={20}
              step={0.1}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loan Tenure (Years)
            </label>
            <NumericInput
              value={tenureYears}
              onChange={setTenureYears}
              placeholder="20"
              min={1}
              max={30}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Results Section */}
      {results && results.maxEMI > 0 && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 sm:p-6 text-center">
              <p className="text-sm text-gray-600 mb-1">Maximum Eligible Loan</p>
              <p className="text-2xl font-bold text-blue-700">{formatLakhs(results.maxLoan)}</p>
              <p className="text-xs text-gray-500 mt-1">{formatINR(results.maxLoan)}</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 sm:p-6 text-center">
              <p className="text-sm text-gray-600 mb-1">Maximum EMI Capacity</p>
              <p className="text-2xl font-bold text-green-700">{formatINR(results.maxEMI)}</p>
              <p className="text-xs text-gray-500 mt-1">50% of net income minus existing EMIs</p>
            </div>
          </div>

          {/* Lender Comparison Table */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Lender-wise Eligibility Estimate</h3>
              <p className="text-xs text-gray-500 mt-0.5">Based on your income and existing EMIs</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-700">Lender</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-700">Rate</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-700">Max Loan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.lenderResults.map((lender) => (
                    <tr key={lender.name}>
                      <td className="px-4 py-3 font-medium text-gray-900">{lender.name}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{lender.rate}%</td>
                      <td className="px-4 py-3 text-right font-semibold text-blue-700">
                        {formatLakhs(lender.maxLoan)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                * Rates are indicative. Actual rates vary based on credit score, employment type, and property location.
              </p>
            </div>
          </div>
        </div>
      )}

      {results && results.maxEMI <= 0 && (
        <div className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
          Your existing EMIs exceed 50% of your net income. Consider reducing existing obligations before applying for a new loan.
        </div>
      )}
    </div>
  );
}
