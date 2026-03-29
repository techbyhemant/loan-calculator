"use client";

import { useMemo } from "react";
import Link from "next/link";

import type { Loan } from "@/types";

import { calculateDashboardStats } from "@/lib/calculations/loanCalcs";
import { formatINR, formatLakhs, formatDate } from "@/lib/utils/formatters";
import { trpcReact } from "@/lib/trpc/hooks";
import { LOAN_TYPE_DISPLAY, sortByPayoffPriority } from "@/lib/calculations/loanTypeConfig";
import type { LoanType } from "@/lib/calculations/loanTypeConfig";
import { LoanTypeIcon } from "@/components/ui/LoanTypeIcon";
import { Lightbulb, Wallet } from "lucide-react";

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
    <div className="bg-card border border-border rounded-xl shadow-sm p-4">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function LoanCard({ loan }: { loan: Loan }) {
  const display = LOAN_TYPE_DISPLAY[loan.type as LoanType] ?? LOAN_TYPE_DISPLAY.other;
  const paidPercent = Math.min(
    100,
    Math.max(
      0,
      ((loan.originalAmount - loan.currentOutstanding) / loan.originalAmount) *
        100,
    ),
  );

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <LoanTypeIcon icon={display.icon} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">{loan.name}</h3>
              <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                <LoanTypeIcon icon={display.icon} size="sm" className="mr-1 inline-block align-middle" /> {display.shortLabel}
              </span>
            </div>
            {loan.lender && (
              <p className="text-xs text-muted-foreground">{loan.lender}</p>
            )}
          </div>
        </div>
        <p className="text-sm font-semibold text-foreground">
          {formatLakhs(loan.currentOutstanding)}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{paidPercent.toFixed(0)}% paid</span>
          <span>{formatLakhs(loan.originalAmount)} original</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${paidPercent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">{formatINR(loan.emiAmount)}</span>/mo
          {loan.emiDate && (
            <span className="text-muted-foreground">
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
          href={`/dashboard/loans/${loan.id}`}
          className="text-xs font-medium text-primary hover:text-primary"
        >
          View Details &rarr;
        </Link>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-4 animate-pulse">
      <div className="h-4 bg-border rounded w-1/3 mb-3" />
      <div className="h-6 bg-border rounded w-1/2 mb-2" />
      <div className="h-3 bg-muted rounded w-1/4" />
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <Link
          href="/dashboard/loans/new"
          className="bg-primary hover:bg-primary/90 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
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

      {/* Payoff Priority Recommendation */}
      {!isLoading && loans.length >= 2 && (() => {
        const sorted = sortByPayoffPriority(
          loans.map((l) => ({
            type: l.type as LoanType,
            ratePA: l.interestRate / 100,
            outstanding: l.currentOutstanding,
          }))
        );
        const top = sorted[0];
        const topDisplay = LOAN_TYPE_DISPLAY[top.type] ?? LOAN_TYPE_DISPLAY.other;
        return (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20 mb-6">
            <Lightbulb className="w-5 h-5 text-primary" />
            <div className="text-sm">
              <p className="font-medium text-foreground">
                Pay your {topDisplay.label} first
              </p>
              <p className="text-muted-foreground mt-0.5">{top.reason}</p>
            </div>
          </div>
        );
      })()}

      {/* Loan Cards */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : loans.length === 0 ? (
        <div className="bg-card border border-border rounded-xl shadow-sm p-8 text-center">
          <Wallet className="w-8 h-8 text-muted-foreground mb-3 mx-auto" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Add your first loan
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Track your home loan, car loan, or any other loan. See exactly when
            you&apos;ll be debt-free.
          </p>
          <Link
            href="/dashboard/loans/new"
            className="inline-flex bg-primary hover:bg-primary/90 text-white rounded-lg px-6 py-2.5 text-sm font-medium transition-colors"
          >
            + Add Your First Loan
          </Link>
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          {loans.map((loan) => (
            <LoanCard key={loan.id} loan={loan} />
          ))}
        </div>
      )}
    </div>
  );
}
