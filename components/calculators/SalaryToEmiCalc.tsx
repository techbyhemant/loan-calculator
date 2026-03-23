"use client";

import { useState, useMemo } from "react";

import { calculateMaxEMI, calculateMaxLoan } from "@/lib/calculations/eligibilityCalcs";
import { formatINR, formatLakhs } from "@/lib/utils/formatters";

import NumericInput from "@/components/ui/NumericInput";
import { CALC_STYLES } from "./shared";

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

  const inputClass = CALC_STYLES.input;

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Enter Your Salary Details
        </h2>

        {/* Quick Salary Presets */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Net Salary
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {SALARY_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setSalary(p.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                  salary === p.value
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <NumericInput
            value={salary}
            onChange={setSalary}
            placeholder="1,00,000"
            min={0}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Existing EMIs (₹)
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
              value={rate}
              onChange={setRate}
              placeholder="8.5"
              min={0}
              max={20}
              step={0.1}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tenure (Years)
            </label>
            <NumericInput
              value={tenure}
              onChange={setTenure}
              placeholder="20"
              min={1}
              max={30}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {results && results.maxEMI > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Max Home Loan</p>
              <p className="text-2xl font-bold text-blue-700">
                {formatLakhs(results.maxLoan)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatINR(results.maxLoan)}
              </p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Max EMI You Can Afford</p>
              <p className="text-2xl font-bold text-green-700">
                {formatINR(results.maxEMI)}
              </p>
              <p className="text-xs text-gray-500 mt-1">per month</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">EMI-to-Salary Ratio</p>
              <p className="text-2xl font-bold text-purple-700">
                {results.emiPercent}%
              </p>
              <p className="text-xs text-gray-500 mt-1">of net salary</p>
            </div>
          </div>

          {/* Salary Ladder */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">
                How Much Home Loan on Different Salaries?
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                At {rate}% for {tenure} years, 50% FOIR
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-700">
                      Monthly Salary
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-700">
                      Max EMI
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-700">
                      Max Loan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[30000, 50000, 75000, 100000, 150000, 200000].map((s) => {
                    const emi = calculateMaxEMI(s, 0);
                    const loan = calculateMaxLoan(emi, (rate as number) || 8.5, (tenure as number) || 20);
                    const isCurrentSalary = s === salary;
                    return (
                      <tr
                        key={s}
                        className={isCurrentSalary ? "bg-blue-50" : ""}
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {formatINR(s)}
                          {isCurrentSalary && (
                            <span className="ml-2 text-xs text-blue-600">
                              ← You
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {formatINR(emi)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-blue-700">
                          {formatLakhs(loan)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {results && results.maxEMI <= 0 && (
        <div className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
          Your existing EMIs exceed 50% of your salary. Reduce existing
          obligations before applying for a home loan.
        </div>
      )}
    </div>
  );
}
