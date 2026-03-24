"use client";

import { useState, useMemo } from "react";

import type { Loan } from "@/types";

import { compareStrategies } from "@/lib/calculations/payoffStrategies";
import { formatINR, formatLakhs, formatDate } from "@/lib/utils/formatters";
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

export default function PlannerPage() {
  return (
    <ProGate feature="Payoff Planner">
      <PlannerContent />
    </ProGate>
  );
}

function PlannerContent() {
  const { data: loansRaw, isLoading } = trpcReact.loans.getAll.useQuery();
  const loans = useMemo(
    () => (loansRaw ?? []) as unknown as Loan[],
    [loansRaw],
  );

  const [monthlyExtra, setMonthlyExtra] = useState<number | "">(10000);

  const comparison = useMemo(() => {
    if (loans.length < 2 || !monthlyExtra) return null;
    return compareStrategies(loans, monthlyExtra as number);
  }, [loans, monthlyExtra]);

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
          Payoff Planner
        </h1>
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-8 text-center">
          <p className="text-sm text-gray-600">
            Add at least 2 loans to compare payoff strategies.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">
        Payoff Planner
      </h1>

      {/* Extra payment input */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 sm:p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Extra monthly payment you can afford (₹)
        </label>
        <div className="max-w-xs">
          <NumericInput
            value={monthlyExtra}
            onChange={setMonthlyExtra}
            placeholder="10,000"
            min={0}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          This amount will be directed to one loan at a time based on the
          strategy.
        </p>
      </div>

      {comparison && (
        <>
          {/* Recommendation Banner */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-sm font-semibold text-green-800 mb-1">
              Recommended:{" "}
              {comparison.recommended === "avalanche"
                ? "Avalanche Method"
                : "Snowball Method"}
            </p>
            <p className="text-sm text-green-700">{comparison.explanation}</p>
          </div>

          {/* Strategy Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Current */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">
                Current Plan
              </h3>
              <p className="text-lg font-bold text-gray-900">
                {formatLakhs(comparison.current.totalInterest)}
              </p>
              <p className="text-xs text-gray-500">total interest</p>
              <p className="text-sm text-gray-600 mt-2">
                Debt-free: {formatDate(comparison.current.debtFreeDate)}
              </p>
            </div>

            {/* Avalanche */}
            <div
              className={`bg-white border rounded-xl shadow-sm p-4 ${comparison.recommended === "avalanche" ? "border-green-300 ring-2 ring-green-100" : "border-gray-100"}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Avalanche
                </h3>
                {comparison.recommended === "avalanche" && (
                  <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full font-semibold">
                    BEST
                  </span>
                )}
              </div>
              <p className="text-lg font-bold text-green-700">
                {formatLakhs(comparison.avalanche.interestSaved)} saved
              </p>
              <p className="text-xs text-gray-500">
                {comparison.avalanche.monthsEarlier} months earlier
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Debt-free: {formatDate(comparison.avalanche.debtFreeDate)}
              </p>
            </div>

            {/* Snowball */}
            <div
              className={`bg-white border rounded-xl shadow-sm p-4 ${comparison.recommended === "snowball" ? "border-green-300 ring-2 ring-green-100" : "border-gray-100"}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Snowball
                </h3>
                {comparison.recommended === "snowball" && (
                  <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full font-semibold">
                    BEST
                  </span>
                )}
              </div>
              <p className="text-lg font-bold text-blue-700">
                {formatLakhs(comparison.snowball.interestSaved)} saved
              </p>
              <p className="text-xs text-gray-500">
                {comparison.snowball.monthsEarlier} months earlier
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Debt-free: {formatDate(comparison.snowball.debtFreeDate)}
              </p>
            </div>
          </div>

          {/* Attack Order Table */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">
                {comparison.recommended === "avalanche"
                  ? "Avalanche"
                  : "Snowball"}{" "}
                Attack Order
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Pay off in this order with your extra{" "}
                {formatINR(monthlyExtra as number)}/mo
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-2.5 font-medium text-gray-700">
                      #
                    </th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-700">
                      Loan
                    </th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-700">
                      Rate
                    </th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-700">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(comparison.recommended === "avalanche"
                    ? comparison.avalanche
                    : comparison.snowball
                  ).attackOrder.map((item) => (
                    <tr key={item.loanId}>
                      <td className="px-4 py-2.5 font-semibold text-gray-900">
                        {item.priority}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-gray-900">
                        {item.loanName}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-600">
                        {item.interestRate}%
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 text-xs">
                        {item.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
