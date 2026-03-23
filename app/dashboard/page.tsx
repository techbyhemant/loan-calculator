"use client";

import { useMemo } from "react";
import Link from "next/link";

import type { Loan } from "@/types";

import { calculateDashboardStats } from "@/lib/calculations/loanCalcs";
import { formatINR, formatLakhs, formatDate } from "@/lib/utils/formatters";
import { trpcReact } from "@/lib/trpc/hooks";

const LOAN_TYPE_ICONS: Record<string, string> = {
  home: "\u{1F3E0}",
  car: "\u{1F697}",
  personal: "\u{1F4BC}",
  gold: "\u{1F947}",
  education: "\u{1F393}",
  credit_card: "\u{1F4B3}",
  other: "\u{1F4CB}",
};

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

function LoanCard({ loan }: { loan: Loan }) {
  const paidPercent = Math.min(
    100,
    Math.max(
      0,
      ((loan.originalAmount - loan.currentOutstanding) / loan.originalAmount) *
        100,
    ),
  );

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">
            {LOAN_TYPE_ICONS[loan.type] ?? "\u{1F4CB}"}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{loan.name}</h3>
            {loan.lender && (
              <p className="text-xs text-gray-500">{loan.lender}</p>
            )}
          </div>
        </div>
        <p className="text-sm font-semibold text-gray-900">
          {formatLakhs(loan.currentOutstanding)}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{paidPercent.toFixed(0)}% paid</span>
          <span>{formatLakhs(loan.originalAmount)} original</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${paidPercent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-600">
          <span className="font-medium">{formatINR(loan.emiAmount)}</span>/mo
          {loan.emiDate && (
            <span className="text-gray-400">
              {" "}
              &middot; Due {loan.emiDate}
              {loan.emiDate === 1
                ? "st"
                : loan.emiDate === 2
                  ? "nd"
                  : loan.emiDate === 3
                    ? "rd"
                    : "th"}
            </span>
          )}
        </div>
        <Link
          href={`/dashboard/loans/${loan._id}`}
          className="text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          View Details &rarr;
        </Link>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
      <div className="h-6 bg-gray-200 rounded w-1/2 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-1/4" />
    </div>
  );
}

export default function DashboardPage() {
  const { data: loansRaw, isLoading } = trpcReact.loans.getAll.useQuery();

  const loans = useMemo(
    () => (loansRaw ?? []) as unknown as Loan[],
    [loansRaw],
  );

  const stats = useMemo(
    () => (loans.length > 0 ? calculateDashboardStats(loans) : null),
    [loans],
  );

  const highestRateLoan =
    loans.length > 0
      ? loans.reduce((max, l) => (l.interestRate > max.interestRate ? l : max))
      : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <Link
          href="/dashboard/loans/new"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          + Add Loan
        </Link>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Debt"
            value={stats ? formatLakhs(stats.totalDebt) : "₹0"}
          />
          <StatCard
            label="Monthly EMI"
            value={stats ? formatINR(stats.monthlyEmiTotal) : "₹0"}
          />
          <StatCard
            label="Interest Remaining"
            value={
              stats ? formatLakhs(stats.totalInterestRemaining) : "₹0"
            }
          />
          <StatCard
            label="Debt-Free Date"
            value={
              stats?.debtFreeDate
                ? formatDate(stats.debtFreeDate)
                : "Add loans"
            }
            sub={
              stats?.debtFreeDate
                ? `${stats.loanCount} active loan${stats.loanCount !== 1 ? "s" : ""}`
                : undefined
            }
          />
        </div>
      )}

      {/* Loan Cards */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : loans.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-8 text-center">
          <p className="text-3xl mb-3">&#x1F4B0;</p>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Add your first loan
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Track your home loan, car loan, or any other loan. See exactly when
            you&apos;ll be debt-free.
          </p>
          <Link
            href="/dashboard/loans/new"
            className="inline-flex bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2.5 text-sm font-medium transition-colors"
          >
            + Add Your First Loan
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {loans.map((loan) => (
              <LoanCard key={loan._id} loan={loan} />
            ))}
          </div>

          {highestRateLoan && loans.length > 1 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-amber-800">
                &#x1F4A1; Quick insight
              </p>
              <p className="text-sm text-amber-700 mt-1">
                Your highest interest loan is{" "}
                <strong>{highestRateLoan.name}</strong> at{" "}
                {highestRateLoan.interestRate}%. Attacking this loan first
                (avalanche method) will save you the most interest overall.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
