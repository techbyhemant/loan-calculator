"use client";

import { useState, useMemo } from "react";

import { calculateTaxBenefit } from "@/lib/calculations/taxBenefitCalcs";
import { formatINR } from "@/lib/utils/formatters";

import NumericInput from "@/components/ui/NumericInput";
import { CALC_STYLES } from "./shared";

export default function TaxBenefitCalc() {
  const [annualPrincipal, setAnnualPrincipal] = useState<number | "">(180000);
  const [annualInterest, setAnnualInterest] = useState<number | "">(350000);
  const [grossIncome, setGrossIncome] = useState<number | "">(1500000);
  const [other80C, setOther80C] = useState<number | "">(50000);
  const [loanType, setLoanType] = useState<"self-occupied" | "rented-out">("self-occupied");

  const results = useMemo(() => {
    if (!annualPrincipal || !annualInterest || !grossIncome) return null;
    return calculateTaxBenefit(
      annualPrincipal,
      annualInterest,
      grossIncome,
      other80C || 0,
      loanType,
    );
  }, [annualPrincipal, annualInterest, grossIncome, other80C, loanType]);

  const inputClass = CALC_STYLES.input;

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Enter Your Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Principal Repaid (&rupee;)
            </label>
            <NumericInput
              value={annualPrincipal}
              onChange={setAnnualPrincipal}
              placeholder="1,80,000"
              min={0}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Interest Paid (&rupee;)
            </label>
            <NumericInput
              value={annualInterest}
              onChange={setAnnualInterest}
              placeholder="3,50,000"
              min={0}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gross Annual Income (&rupee;)
            </label>
            <NumericInput
              value={grossIncome}
              onChange={setGrossIncome}
              placeholder="15,00,000"
              min={0}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Other 80C Investments (&rupee;)
            </label>
            <NumericInput
              value={other80C}
              onChange={setOther80C}
              placeholder="50,000"
              min={0}
              className={inputClass}
            />
            <p className="text-xs text-gray-500 mt-1">EPF + ELSS + LIC + school fees</p>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Type
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setLoanType("self-occupied")}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  loanType === "self-occupied"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                }`}
              >
                Self-Occupied
              </button>
              <button
                onClick={() => setLoanType("rented-out")}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  loanType === "rented-out"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                }`}
              >
                Rented Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {results && (
        <div className="space-y-4">
          {/* Deduction Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Section 24(b) Deduction</p>
              <p className="text-xl font-bold text-blue-700">{formatINR(results.sec24Deduction)}</p>
              <p className="text-xs text-gray-500 mt-1">
                Interest — {loanType === "self-occupied" ? "max ₹2L" : "no cap"}
              </p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Section 80C Deduction</p>
              <p className="text-xl font-bold text-green-700">{formatINR(results.sec80CDeduction)}</p>
              <p className="text-xs text-gray-500 mt-1">Principal — shared ₹1.5L limit</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Total Deduction</p>
              <p className="text-xl font-bold text-purple-700">{formatINR(results.totalDeduction)}</p>
              <p className="text-xs text-gray-500 mt-1">24(b) + 80C combined</p>
            </div>
          </div>

          {/* Tax Saved at Different Brackets */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Tax Saved by Bracket</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-700">Tax Bracket</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-700">Old Regime</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-700">New Regime</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-700">Better Option</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { label: "10% bracket", old: results.oldRegimeTax.at10, new: results.newRegimeTax.at10 },
                    { label: "20% bracket", old: results.oldRegimeTax.at20, new: results.newRegimeTax.at20 },
                    { label: "30% bracket", old: results.oldRegimeTax.at30, new: results.newRegimeTax.at30 },
                  ].map((row) => (
                    <tr key={row.label}>
                      <td className="px-4 py-3 font-medium text-gray-900">{row.label}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${row.old >= row.new ? "text-green-700" : "text-gray-600"}`}>
                        {formatINR(row.old)}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${row.new > row.old ? "text-green-700" : "text-gray-600"}`}>
                        {formatINR(row.new)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          row.old >= row.new
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {row.old >= row.new ? "Old Regime" : "New Regime"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendation */}
          <div
            className={`rounded-xl p-4 border ${
              results.recommendedRegime === "old"
                ? "bg-amber-50 border-amber-200"
                : "bg-blue-50 border-blue-200"
            }`}
          >
            <p className={`text-sm font-semibold ${
              results.recommendedRegime === "old" ? "text-amber-800" : "text-blue-800"
            }`}>
              Based on your income of {formatINR(grossIncome as number)}, the{" "}
              <strong>{results.recommendedRegime === "old" ? "Old Regime" : "New Regime"}</strong>{" "}
              saves you more on home loan tax benefits.
            </p>
            <p className={`text-sm mt-1 ${
              results.recommendedRegime === "old" ? "text-amber-700" : "text-blue-700"
            }`}>
              Estimated tax saved this year:{" "}
              <strong>
                {formatINR(Math.max(results.oldRegimeSaved, results.newRegimeSaved))}
              </strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
