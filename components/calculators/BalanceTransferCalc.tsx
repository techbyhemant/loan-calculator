"use client";

import { useState, useMemo } from "react";

import { formatINR, formatLakhs, formatMonths } from "@/lib/utils/formatters";

import NumericInput from "@/components/ui/NumericInput";
import { CALC_STYLES } from "./shared";

export default function BalanceTransferCalc() {
  const [outstanding, setOutstanding] = useState<number | "">(4000000);
  const [currentRate, setCurrentRate] = useState<number | "">(9.0);
  const [newRate, setNewRate] = useState<number | "">(8.5);
  const [remainingTenure, setRemainingTenure] = useState<number | "">(180);
  const [processingFee, setProcessingFee] = useState<number | "">(0.5);
  const [legalCharges, setLegalCharges] = useState<number | "">(15000);

  const results = useMemo(() => {
    if (!outstanding || !currentRate || !newRate || !remainingTenure) return null;

    const principal = outstanding as number;
    const oldRate = currentRate as number;
    const newRateVal = newRate as number;
    const months = remainingTenure as number;
    const feePercent = (processingFee as number) || 0;
    const legal = (legalCharges as number) || 0;

    // Current loan EMI and total interest
    const oldR = oldRate / 12 / 100;
    const oldEMI = oldR === 0
      ? principal / months
      : (principal * oldR * Math.pow(1 + oldR, months)) / (Math.pow(1 + oldR, months) - 1);
    const oldTotalInterest = oldEMI * months - principal;

    // New loan EMI and total interest
    const newR = newRateVal / 12 / 100;
    const newEMI = newR === 0
      ? principal / months
      : (principal * newR * Math.pow(1 + newR, months)) / (Math.pow(1 + newR, months) - 1);
    const newTotalInterest = newEMI * months - principal;

    // Costs
    const processingFeeAmount = principal * (feePercent / 100);
    const totalTransferCost = processingFeeAmount + legal;

    // Savings
    const interestSaved = oldTotalInterest - newTotalInterest;
    const netSaving = interestSaved - totalTransferCost;
    const monthlySaving = oldEMI - newEMI;

    // Break-even
    const breakEvenMonths = monthlySaving > 0
      ? Math.ceil(totalTransferCost / monthlySaving)
      : 0;

    const worthIt = netSaving > 25000;

    return {
      oldEMI,
      newEMI,
      oldTotalInterest,
      newTotalInterest,
      interestSaved,
      processingFeeAmount,
      totalTransferCost,
      netSaving,
      monthlySaving,
      breakEvenMonths,
      worthIt,
    };
  }, [outstanding, currentRate, newRate, remainingTenure, processingFee, legalCharges]);

  const inputClass = CALC_STYLES.input;

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Enter Your Loan Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Outstanding Loan Amount (₹)
            </label>
            <NumericInput value={outstanding} onChange={setOutstanding} placeholder="40,00,000" min={0} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remaining Tenure (Months)
            </label>
            <NumericInput value={remainingTenure} onChange={setRemainingTenure} placeholder="180" min={1} max={360} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Interest Rate (%)
            </label>
            <NumericInput value={currentRate} onChange={setCurrentRate} placeholder="9.0" min={0} max={20} step={0.1} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Bank Rate (%)
            </label>
            <NumericInput value={newRate} onChange={setNewRate} placeholder="8.5" min={0} max={20} step={0.1} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Processing Fee (%)
            </label>
            <NumericInput value={processingFee} onChange={setProcessingFee} placeholder="0.5" min={0} max={3} step={0.1} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Legal/Valuation Charges (₹)
            </label>
            <NumericInput value={legalCharges} onChange={setLegalCharges} placeholder="15,000" min={0} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          {/* Verdict */}
          <div
            className={`rounded-xl p-4 text-center border ${
              results.worthIt
                ? "bg-green-50 text-green-800 border-green-200"
                : results.netSaving > 0
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            <p className="font-semibold text-lg">
              {results.worthIt
                ? `Yes, transfer! Net saving: ${formatLakhs(results.netSaving)}`
                : results.netSaving > 0
                  ? `Marginal saving of ${formatINR(results.netSaving)} — probably not worth the hassle`
                  : `Not worth it. You'd lose ${formatINR(Math.abs(results.netSaving))}`}
            </p>
            {results.breakEvenMonths > 0 && results.netSaving > 0 && (
              <p className="text-sm mt-1">
                Break-even after {formatMonths(results.breakEvenMonths)}
              </p>
            )}
          </div>

          {/* Comparison Table */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-700">Metric</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-700">Current Bank</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-700">New Bank</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-4 py-3 text-gray-600">Interest Rate</td>
                    <td className="px-4 py-3 text-right font-medium">{currentRate}%</td>
                    <td className="px-4 py-3 text-right font-medium text-green-700">{newRate}%</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-600">Monthly EMI</td>
                    <td className="px-4 py-3 text-right font-medium">{formatINR(results.oldEMI)}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatINR(results.newEMI)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-600">Total Interest</td>
                    <td className="px-4 py-3 text-right">{formatLakhs(results.oldTotalInterest)}</td>
                    <td className="px-4 py-3 text-right">{formatLakhs(results.newTotalInterest)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-600">Interest Saved</td>
                    <td className="px-4 py-3 text-right text-gray-400">—</td>
                    <td className="px-4 py-3 text-right text-green-700 font-medium">{formatLakhs(results.interestSaved)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-600">Transfer Costs</td>
                    <td className="px-4 py-3 text-right text-gray-400">—</td>
                    <td className="px-4 py-3 text-right text-red-600">-{formatINR(results.totalTransferCost)}</td>
                  </tr>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-4 py-3 text-gray-900">Net Saving</td>
                    <td className="px-4 py-3 text-right text-gray-400">—</td>
                    <td className={`px-4 py-3 text-right ${results.netSaving > 0 ? "text-green-700" : "text-red-700"}`}>
                      {results.netSaving > 0 ? "+" : ""}{formatLakhs(results.netSaving)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            RBI mandates zero prepayment penalty on floating rate home loans. Your current bank cannot charge you for closing the loan before transfer.
          </div>
        </div>
      )}
    </div>
  );
}
