"use client";

import { useState, useMemo } from "react";

import {
  calculatePrepayBenefit,
  calculateSipBenefit,
  type Recommendation,
} from "@/lib/calculations/sipVsPrepayCalcs";
import { formatINR, formatMonths } from "@/lib/utils/formatters";

import NumericInput from "@/components/ui/NumericInput";
import { CALC_STYLES } from "./shared";

export default function SipVsPrepaymentCalc() {
  const [loanOutstanding, setLoanOutstanding] = useState<number | "">(3000000);
  const [interestRate, setInterestRate] = useState<number | "">(8.5);
  const [remainingMonths, setRemainingMonths] = useState<number | "">(180);
  const [monthlyExtra, setMonthlyExtra] = useState<number | "">(10000);
  const [sipReturn, setSipReturn] = useState<number | "">(12);
  const [taxBracket, setTaxBracket] = useState<10 | 20 | 30>(30);

  const results = useMemo(() => {
    if (!loanOutstanding || !interestRate || !remainingMonths || !monthlyExtra || !sipReturn) {
      return null;
    }

    const prepay = calculatePrepayBenefit(
      loanOutstanding,
      interestRate,
      remainingMonths,
      monthlyExtra,
      taxBracket,
    );

    const sip = calculateSipBenefit(monthlyExtra, remainingMonths, sipReturn);

    let recommendation: Recommendation;
    if (prepay.netBenefit > sip.netCorpus - sip.totalInvested) {
      recommendation = "PREPAY";
    } else if (sip.netCorpus - sip.totalInvested > prepay.netBenefit) {
      recommendation = "SIP";
    } else {
      recommendation = "SPLIT";
    }

    return { prepay, sip, recommendation };
  }, [loanOutstanding, interestRate, remainingMonths, monthlyExtra, sipReturn, taxBracket]);

  const inputClass = CALC_STYLES.input;

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Enter Your Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loan Outstanding (&rupee;)
            </label>
            <NumericInput
              value={loanOutstanding}
              onChange={setLoanOutstanding}
              placeholder="30,00,000"
              min={0}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Interest Rate (%)
            </label>
            <NumericInput
              value={interestRate}
              onChange={setInterestRate}
              placeholder="8.5"
              min={0}
              max={30}
              step={0.1}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remaining Months
            </label>
            <NumericInput
              value={remainingMonths}
              onChange={setRemainingMonths}
              placeholder="180"
              min={1}
              max={360}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Surplus Amount (&rupee;)
            </label>
            <NumericInput
              value={monthlyExtra}
              onChange={setMonthlyExtra}
              placeholder="10,000"
              min={0}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected SIP Annual Return (%)
            </label>
            <NumericInput
              value={sipReturn}
              onChange={setSipReturn}
              placeholder="12"
              min={0}
              max={30}
              step={0.1}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax Bracket
            </label>
            <select
              value={taxBracket}
              onChange={(e) => setTaxBracket(Number(e.target.value) as 10 | 20 | 30)}
              className={inputClass}
            >
              <option value={10}>10%</option>
              <option value={20}>20%</option>
              <option value={30}>30%</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {results && (
        <div className="space-y-4">
          {/* Winner Banner */}
          <div
            className={`rounded-xl p-4 text-center font-semibold text-lg ${
              results.recommendation === "PREPAY"
                ? "bg-green-50 text-green-800 border border-green-200"
                : results.recommendation === "SIP"
                  ? "bg-blue-50 text-blue-800 border border-blue-200"
                  : "bg-amber-50 text-amber-800 border border-amber-200"
            }`}
          >
            {results.recommendation === "PREPAY"
              ? "Prepaying your loan is the better option!"
              : results.recommendation === "SIP"
                ? "Investing in SIP gives you better returns!"
                : "Both options are close — consider splitting your surplus."}
          </div>

          {/* Comparison Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Prepay Card */}
            <div
              className={`bg-white border rounded-xl shadow-sm p-4 sm:p-6 ${
                results.recommendation === "PREPAY" ? "border-green-300 ring-2 ring-green-100" : "border-gray-100"
              }`}
            >
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                {results.recommendation === "PREPAY" && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Winner</span>
                )}
                Prepay Your Loan
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Interest Saved</span>
                  <span className="text-sm font-semibold text-green-700">
                    {formatINR(results.prepay.interestSaved)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Months Reduced</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatMonths(results.prepay.monthsReduced)}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-sm font-medium text-gray-800">Net Benefit</span>
                  <span className="text-sm font-bold text-green-700">
                    {formatINR(results.prepay.netBenefit)}
                  </span>
                </div>
              </div>
            </div>

            {/* SIP Card */}
            <div
              className={`bg-white border rounded-xl shadow-sm p-4 sm:p-6 ${
                results.recommendation === "SIP" ? "border-blue-300 ring-2 ring-blue-100" : "border-gray-100"
              }`}
            >
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                {results.recommendation === "SIP" && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Winner</span>
                )}
                Invest in SIP
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Corpus at Loan End</span>
                  <span className="text-sm font-semibold text-blue-700">
                    {formatINR(results.sip.corpus)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">LTCG Tax</span>
                  <span className="text-sm font-semibold text-red-600">
                    -{formatINR(results.sip.ltcgTax)}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-sm font-medium text-gray-800">Net Corpus</span>
                  <span className="text-sm font-bold text-blue-700">
                    {formatINR(results.sip.netCorpus)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Comparison */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Metric</th>
                  <th className="text-right px-4 py-3 font-medium text-green-700">Prepay</th>
                  <th className="text-right px-4 py-3 font-medium text-blue-700">SIP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-3 text-gray-600">Interest Saved</td>
                  <td className="px-4 py-3 text-right font-medium">{formatINR(results.prepay.interestSaved)}</td>
                  <td className="px-4 py-3 text-right text-gray-400">—</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-600">Months Reduced</td>
                  <td className="px-4 py-3 text-right font-medium">{formatMonths(results.prepay.monthsReduced)}</td>
                  <td className="px-4 py-3 text-right text-gray-400">—</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-600">Corpus Built</td>
                  <td className="px-4 py-3 text-right text-gray-400">—</td>
                  <td className="px-4 py-3 text-right font-medium">{formatINR(results.sip.corpus)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-600">Total Invested</td>
                  <td className="px-4 py-3 text-right text-gray-400">—</td>
                  <td className="px-4 py-3 text-right font-medium">{formatINR(results.sip.totalInvested)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-600">LTCG Tax</td>
                  <td className="px-4 py-3 text-right text-gray-400">—</td>
                  <td className="px-4 py-3 text-right text-red-600">-{formatINR(results.sip.ltcgTax)}</td>
                </tr>
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-4 py-3 text-gray-900">Net Benefit</td>
                  <td className="px-4 py-3 text-right text-green-700">{formatINR(results.prepay.netBenefit)}</td>
                  <td className="px-4 py-3 text-right text-blue-700">
                    {formatINR(results.sip.netCorpus - results.sip.totalInvested)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
