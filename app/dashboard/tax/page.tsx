"use client";

import { useState, useMemo } from "react";

import type { Loan, TaxProfile } from "@/types";

import { calculateLoanTaxBenefits } from "@/lib/calculations/taxCalcs";
import { formatINR } from "@/lib/utils/formatters";
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

export default function TaxPage() {
  return (
    <ProGate feature="Tax Benefits Dashboard">
      <TaxContent />
    </ProGate>
  );
}

function TaxContent() {
  const { data: loansRaw, isLoading } = trpcReact.loans.getAll.useQuery();
  const loans = useMemo(
    () => (loansRaw ?? []) as unknown as Loan[],
    [loansRaw],
  );

  const [grossIncome, setGrossIncome] = useState<number | "">(1500000);
  const [existing80C, setExisting80C] = useState<number | "">(50000);
  const [taxRegime, setTaxRegime] = useState<"old" | "new">("old");

  const homeLoans = loans.filter((l) => l.type === "home");

  const benefits = useMemo(() => {
    if (homeLoans.length === 0 || !grossIncome) return null;
    const profile: TaxProfile = {
      grossIncome: (grossIncome as number) || 0,
      taxRegime,
      existing80CInvestments: (existing80C as number) || 0,
    };
    return calculateLoanTaxBenefits(homeLoans, profile);
  }, [homeLoans, grossIncome, existing80C, taxRegime]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonBlock />
        <SkeletonBlock />
      </div>
    );
  }

  if (homeLoans.length === 0) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-foreground mb-6">
          Tax Benefits Dashboard
        </h1>
        <div className="bg-card border border-border rounded-xl shadow-sm p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Add a home loan to see your tax benefits under Section 80C and
            24(b).
          </p>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none";

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground mb-6">
        Tax Benefits Dashboard
      </h1>

      {/* Profile Inputs */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-4 sm:p-6 mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">
          Your Tax Profile
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Gross Annual Income (₹)
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
            <label className="block text-sm font-medium text-foreground mb-1">
              Other 80C Investments (₹)
            </label>
            <NumericInput
              value={existing80C}
              onChange={setExisting80C}
              placeholder="50,000"
              min={0}
              className={inputClass}
            />
            <p className="text-xs text-muted-foreground mt-1">
              EPF + ELSS + LIC + PPF
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Tax Regime
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTaxRegime("old")}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  taxRegime === "old"
                    ? "bg-primary text-white border-primary"
                    : "bg-card text-foreground border-border"
                }`}
              >
                Old
              </button>
              <button
                type="button"
                onClick={() => setTaxRegime("new")}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  taxRegime === "new"
                    ? "bg-primary text-white border-primary"
                    : "bg-card text-foreground border-border"
                }`}
              >
                New
              </button>
            </div>
          </div>
        </div>
      </div>

      {benefits && (
        <>
          {/* Deduction Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-card border border-border rounded-xl shadow-sm p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">
                Section 24(b)
              </p>
              <p className="text-xl font-bold text-primary">
                {formatINR(benefits.sec24Deduction)}
              </p>
              <p className="text-xs text-muted-foreground">Interest deduction</p>
            </div>
            <div className="bg-card border border-border rounded-xl shadow-sm p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">
                Section 80C
              </p>
              <p className="text-xl font-bold text-positive">
                {formatINR(benefits.sec80CDeduction)}
              </p>
              <p className="text-xs text-muted-foreground">Principal deduction</p>
            </div>
            <div className="bg-card border border-border rounded-xl shadow-sm p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Tax Saved</p>
              <p className="text-xl font-bold text-primary">
                {formatINR(benefits.taxSaved)}
              </p>
              <p className="text-xs text-muted-foreground">this financial year</p>
            </div>
          </div>

          {/* Regime Recommendation */}
          <div
            className={`rounded-xl p-4 border mb-6 ${
              benefits.recommendedRegime === "old"
                ? "bg-warning/10 border-warning/20"
                : "bg-primary/10 border-primary/20"
            }`}
          >
            <p
              className={`text-sm font-semibold ${
                benefits.recommendedRegime === "old"
                  ? "text-warning"
                  : "text-primary"
              }`}
            >
              {benefits.recommendedRegime === "old" ? "Old" : "New"} regime
              saves you more
            </p>
            <p
              className={`text-sm mt-1 ${
                benefits.recommendedRegime === "old"
                  ? "text-warning"
                  : "text-primary"
              }`}
            >
              Difference: {formatINR(benefits.regimeDifference)} per year
            </p>
          </div>

          {/* Breakdown Table */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">
                Deduction Breakdown
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-background">
                    <th className="text-left px-4 py-3 font-medium text-foreground">
                      Section
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-foreground">
                      Deduction
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-foreground">
                      Max Limit
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3 text-foreground">
                      24(b) &mdash; Interest
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatINR(benefits.sec24Deduction)}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {formatINR(200000)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-foreground">
                      80C &mdash; Principal
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatINR(benefits.sec80CDeduction)}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {formatINR(150000)} (shared)
                    </td>
                  </tr>
                  <tr className="bg-background font-semibold">
                    <td className="px-4 py-3 text-foreground">Total</td>
                    <td className="px-4 py-3 text-right">
                      {formatINR(benefits.totalDeduction)}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {formatINR(350000)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
