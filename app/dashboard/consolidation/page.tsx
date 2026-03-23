"use client";

import { useState, useMemo } from "react";

import type { Loan } from "@/types";

import { analyzeConsolidation } from "@/lib/calculations/consolidationCalcs";
import { formatINR, formatLakhs } from "@/lib/utils/formatters";
import { shouldShowAffiliate, getAffiliateLinks } from "@/lib/affiliates/config";
import { trpcReact } from "@/lib/trpc/hooks";

import { ProGate } from "@/components/ui/ProGate";
import NumericInput from "@/components/ui/NumericInput";

function SkeletonBlock() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
      <div className="h-4 bg-gray-100 rounded w-full mb-2" />
      <div className="h-4 bg-gray-100 rounded w-2/3" />
    </div>
  );
}

export default function ConsolidationPage() {
  return (
    <ProGate feature="Consolidation Analyzer">
      <ConsolidationContent />
    </ProGate>
  );
}

function ConsolidationContent() {
  const { data: loansRaw, isLoading } = trpcReact.loans.getAll.useQuery();
  const loans = useMemo(
    () => (loansRaw ?? []) as unknown as Loan[],
    [loansRaw],
  );

  const [proposedRate, setProposedRate] = useState<number | "">(8.5);
  const [proposedTenure, setProposedTenure] = useState<number | "">(240);
  const [processingFee, setProcessingFee] = useState<number | "">(1);

  const analysis = useMemo(() => {
    if (loans.length < 2 || !proposedRate || !proposedTenure) return null;
    return analyzeConsolidation(
      loans,
      proposedRate as number,
      proposedTenure as number,
      (processingFee as number) || 0,
    );
  }, [loans, proposedRate, proposedTenure, processingFee]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonBlock />
        <SkeletonBlock />
      </div>
    );
  }

  if (loans.length < 2) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-gray-900 mb-6">
          Loan Consolidation Analyzer
        </h1>
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-8 text-center">
          <p className="text-sm text-gray-600">
            Add at least 2 loans to analyze consolidation options.
          </p>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none";

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">
        Loan Consolidation Analyzer
      </h1>

      {/* Inputs */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 sm:p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Proposed Consolidation Terms
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proposed Rate (%)
            </label>
            <NumericInput
              value={proposedRate}
              onChange={setProposedRate}
              placeholder="8.5"
              min={0}
              max={20}
              step={0.1}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tenure (months)
            </label>
            <NumericInput
              value={proposedTenure}
              onChange={setProposedTenure}
              placeholder="240"
              min={12}
              max={360}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Processing Fee (%)
            </label>
            <NumericInput
              value={processingFee}
              onChange={setProcessingFee}
              placeholder="1"
              min={0}
              max={5}
              step={0.1}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {analysis && (
        <>
          {/* Verdict Banner */}
          <div
            className={`rounded-xl p-4 mb-6 border ${
              analysis.verdict === "BENEFICIAL"
                ? "bg-green-50 border-green-200"
                : analysis.verdict === "MARGINAL"
                  ? "bg-amber-50 border-amber-200"
                  : "bg-red-50 border-red-200"
            }`}
          >
            <p
              className={`text-sm font-semibold mb-1 ${
                analysis.verdict === "BENEFICIAL"
                  ? "text-green-800"
                  : analysis.verdict === "MARGINAL"
                    ? "text-amber-800"
                    : "text-red-800"
              }`}
            >
              {analysis.verdict === "BENEFICIAL"
                ? "Consolidation is Beneficial"
                : analysis.verdict === "MARGINAL"
                  ? "Marginal Benefit"
                  : "Not Recommended"}
            </p>
            <p
              className={`text-sm ${
                analysis.verdict === "BENEFICIAL"
                  ? "text-green-700"
                  : analysis.verdict === "MARGINAL"
                    ? "text-amber-700"
                    : "text-red-700"
              }`}
            >
              {analysis.recommendation}
            </p>
          </div>

          {/* Comparison Table */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-700">
                      Metric
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-700">
                      Current
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-700">
                      Consolidated
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-4 py-3 text-gray-600">
                      Weighted Avg Rate
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {analysis.currentWeightedRate.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {analysis.proposedRate}%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-600">Total Interest</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatLakhs(analysis.currentTotalInterest)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatLakhs(analysis.newTotalInterest)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-600">Processing Fee</td>
                    <td className="px-4 py-3 text-right text-gray-400">
                      &mdash;
                    </td>
                    <td className="px-4 py-3 text-right text-red-600">
                      -{formatINR(analysis.processingFee)}
                    </td>
                  </tr>
                  {analysis.prepaymentPenalties > 0 && (
                    <tr>
                      <td className="px-4 py-3 text-gray-600">
                        Prepayment Penalties
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400">
                        &mdash;
                      </td>
                      <td className="px-4 py-3 text-right text-red-600">
                        -{formatINR(analysis.prepaymentPenalties)}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-4 py-3 text-gray-900">Net Saving</td>
                    <td className="px-4 py-3 text-right text-gray-400">
                      &mdash;
                    </td>
                    <td
                      className={`px-4 py-3 text-right ${analysis.netSaving > 0 ? "text-green-700" : "text-red-700"}`}
                    >
                      {analysis.netSaving > 0 ? "+" : ""}
                      {formatLakhs(analysis.netSaving)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {analysis.breakEvenMonths > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 mb-6 text-sm text-gray-600">
              Break-even period:{" "}
              <strong>{analysis.breakEvenMonths} months</strong> — after this,
              you start saving money.
            </div>
          )}

          {/* Affiliate CTA — only when conditions are met */}
          {shouldShowAffiliate("consolidation", {
            netSaving: analysis.netSaving,
            verdict: analysis.verdict,
          }) &&
            getAffiliateLinks("consolidation").map((link) => (
              <div
                key={link.provider}
                className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm"
              >
                <p className="text-blue-800 font-medium">
                  {link.label}{" "}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-semibold"
                  >
                    via {link.provider} &rarr;
                  </a>
                </p>
              </div>
            ))}
        </>
      )}
    </div>
  );
}
