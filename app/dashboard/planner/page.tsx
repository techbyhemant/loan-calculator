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
    <div className="bg-card border border-border rounded-xl shadow-sm p-6 animate-pulse">
      <div className="h-5 bg-border rounded w-1/3 mb-4" />
      <div className="h-4 bg-muted rounded w-full mb-2" />
      <div className="h-4 bg-muted rounded w-2/3" />
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
        <h1 className="text-xl font-semibold text-foreground mb-6">
          Payoff Planner
        </h1>
        <div className="bg-card border border-border rounded-xl shadow-sm p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Add at least 2 loans to compare payoff strategies.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground mb-6">
        Payoff Planner
      </h1>

      {/* Extra payment input */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-4 sm:p-6 mb-6">
        <label className="block text-sm font-medium text-foreground mb-1">
          Extra monthly payment you can afford (₹)
        </label>
        <div className="max-w-xs">
          <NumericInput
            value={monthlyExtra}
            onChange={setMonthlyExtra}
            placeholder="10,000"
            min={0}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          This amount will be directed to one loan at a time based on the
          strategy.
        </p>
      </div>

      {comparison && (
        <>
          {/* Recommendation Banner */}
          <div className="bg-positive/10 border border-positive/20 rounded-xl p-4 mb-6">
            <p className="text-sm font-semibold text-positive mb-1">
              Recommended:{" "}
              {comparison.recommended === "avalanche"
                ? "Avalanche Method"
                : "Snowball Method"}
            </p>
            <p className="text-sm text-positive">{comparison.explanation}</p>
          </div>

          {/* Strategy Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Current */}
            <div className="bg-card border border-border rounded-xl shadow-sm p-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Current Plan
              </h3>
              <p className="text-lg font-bold text-foreground">
                {formatLakhs(comparison.current.totalInterest)}
              </p>
              <p className="text-xs text-muted-foreground">total interest</p>
              <p className="text-sm text-muted-foreground mt-2">
                Debt-free: {formatDate(comparison.current.debtFreeDate)}
              </p>
            </div>

            {/* Avalanche */}
            <div
              className={`bg-card border rounded-xl shadow-sm p-4 ${comparison.recommended === "avalanche" ? "border-positive/30 ring-2 ring-positive/10" : "border-border"}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Avalanche
                </h3>
                {comparison.recommended === "avalanche" && (
                  <span className="text-[10px] bg-positive/10 text-positive px-1.5 py-0.5 rounded-full font-semibold">
                    BEST
                  </span>
                )}
              </div>
              <p className="text-lg font-bold text-positive">
                {formatLakhs(comparison.avalanche.interestSaved)} saved
              </p>
              <p className="text-xs text-muted-foreground">
                {comparison.avalanche.monthsEarlier} months earlier
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Debt-free: {formatDate(comparison.avalanche.debtFreeDate)}
              </p>
            </div>

            {/* Snowball */}
            <div
              className={`bg-card border rounded-xl shadow-sm p-4 ${comparison.recommended === "snowball" ? "border-positive/30 ring-2 ring-positive/10" : "border-border"}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Snowball
                </h3>
                {comparison.recommended === "snowball" && (
                  <span className="text-[10px] bg-positive/10 text-positive px-1.5 py-0.5 rounded-full font-semibold">
                    BEST
                  </span>
                )}
              </div>
              <p className="text-lg font-bold text-primary">
                {formatLakhs(comparison.snowball.interestSaved)} saved
              </p>
              <p className="text-xs text-muted-foreground">
                {comparison.snowball.monthsEarlier} months earlier
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Debt-free: {formatDate(comparison.snowball.debtFreeDate)}
              </p>
            </div>
          </div>

          {/* Attack Order Table */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">
                {comparison.recommended === "avalanche"
                  ? "Avalanche"
                  : "Snowball"}{" "}
                Attack Order
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pay off in this order with your extra{" "}
                {formatINR(monthlyExtra as number)}/mo
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-background">
                    <th className="text-left px-4 py-2.5 font-medium text-foreground">
                      #
                    </th>
                    <th className="text-left px-4 py-2.5 font-medium text-foreground">
                      Loan
                    </th>
                    <th className="text-right px-4 py-2.5 font-medium text-foreground">
                      Rate
                    </th>
                    <th className="text-left px-4 py-2.5 font-medium text-foreground">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-background">
                  {(comparison.recommended === "avalanche"
                    ? comparison.avalanche
                    : comparison.snowball
                  ).attackOrder.map((item) => (
                    <tr key={item.loanId}>
                      <td className="px-4 py-2.5 font-semibold text-foreground">
                        {item.priority}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-foreground">
                        {item.loanName}
                      </td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">
                        {item.interestRate}%
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">
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
