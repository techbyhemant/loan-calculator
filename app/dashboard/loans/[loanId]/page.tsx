"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import type { Loan } from "@/types";

import { calculateAmortization } from "@/lib/calculations/loanCalcs";
import { formatINR, formatLakhs, formatDate, formatMonths } from "@/lib/utils/formatters";
import { trpcReact } from "@/lib/trpc/hooks";

import { PartPaymentLogger, PartPaymentHistory } from "@/components/dashboard/PartPaymentLogger";
import { LOAN_TYPE_DISPLAY, LOAN_TYPE_FINANCIALS, isRBIZeroPenaltyApplicable } from "@/lib/calculations/loanTypeConfig";
import type { LoanType } from "@/lib/calculations/loanTypeConfig";
import { LoanTypeIcon } from "@/components/ui/LoanTypeIcon";

function SkeletonBlock() {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-6 animate-pulse">
      <div className="h-5 bg-border rounded w-1/3 mb-4" />
      <div className="h-4 bg-muted rounded w-full mb-2" />
      <div className="h-4 bg-muted rounded w-2/3 mb-2" />
      <div className="h-4 bg-muted rounded w-1/2" />
    </div>
  );
}

export default function LoanDetailPage() {
  const params = useParams();
  const loanId = params.loanId as string;

  const { data: loanRaw, isLoading, error } = trpcReact.loans.getById.useQuery(
    { id: loanId },
    { enabled: !!loanId },
  );

  const loan = loanRaw as unknown as Loan | undefined;

  const amortization = useMemo(() => {
    if (!loan) return [];
    return calculateAmortization(
      loan.currentOutstanding,
      loan.interestRate,
      loan.tenureMonths,
      new Date(loan.startDate),
    );
  }, [loan]);

  const totalInterest = useMemo(
    () => amortization.reduce((sum, row) => sum + row.interest, 0),
    [amortization],
  );

  const paidPercent = loan
    ? Math.min(
        100,
        Math.max(
          0,
          ((loan.originalAmount - loan.currentOutstanding) /
            loan.originalAmount) *
            100,
        ),
      )
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonBlock />
        <SkeletonBlock />
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-sm p-8 text-center">
        <p className="text-negative font-medium">
          {error?.message ?? "Loan not found"}
        </p>
        <Link
          href="/dashboard"
          className="text-sm text-primary hover:text-primary mt-2 inline-block"
        >
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-muted-foreground transition-colors"
        >
          &larr;
        </Link>
        <div className="flex items-center gap-2.5">
          <LoanTypeIcon icon={(LOAN_TYPE_DISPLAY[loan.type as LoanType] ?? LOAN_TYPE_DISPLAY.other).icon} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground">{loan.name}</h1>
              <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                <LoanTypeIcon icon={(LOAN_TYPE_DISPLAY[loan.type as LoanType] ?? LOAN_TYPE_DISPLAY.other).icon} size="sm" className="mr-1 inline-block align-middle" />
                {(LOAN_TYPE_DISPLAY[loan.type as LoanType] ?? LOAN_TYPE_DISPLAY.other).shortLabel}
              </span>
            </div>
            {loan.lender && (
              <p className="text-sm text-muted-foreground">{loan.lender}</p>
            )}
          </div>
        </div>
      </div>

      {/* Loan Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl shadow-sm p-4">
          <p className="text-sm text-muted-foreground mb-1">Outstanding</p>
          <p className="text-lg font-bold text-foreground">
            {formatLakhs(loan.currentOutstanding)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl shadow-sm p-4">
          <p className="text-sm text-muted-foreground mb-1">Monthly EMI</p>
          <p className="text-lg font-bold text-foreground">
            {formatINR(loan.emiAmount)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl shadow-sm p-4">
          <p className="text-sm text-muted-foreground mb-1">Interest Rate</p>
          <p className="text-lg font-bold text-foreground">
            {loan.interestRate}%
            <span className="text-xs font-normal text-muted-foreground ml-1">
              {loan.rateType}
            </span>
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl shadow-sm p-4">
          <p className="text-sm text-muted-foreground mb-1">Remaining Tenure</p>
          <p className="text-lg font-bold text-foreground">
            {formatMonths(loan.tenureMonths)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-4 mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>{paidPercent.toFixed(0)}% paid off</span>
          <span>
            {formatLakhs(loan.originalAmount - loan.currentOutstanding)} of{" "}
            {formatLakhs(loan.originalAmount)}
          </span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${paidPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Total interest remaining: {formatLakhs(totalInterest)}</span>
          {amortization.length > 0 && (
            <span>
              Debt-free:{" "}
              {formatDate(amortization[amortization.length - 1].date)}
            </span>
          )}
        </div>
      </div>

      {/* Prepayment Penalty Info */}
      {(() => {
        const rbiProtected = isRBIZeroPenaltyApplicable(
          loan.type as LoanType,
          loan.rateType as "fixed" | "floating"
        );
        const config = LOAN_TYPE_FINANCIALS[loan.type as LoanType] ?? LOAN_TYPE_FINANCIALS.other;

        if (rbiProtected) {
          return (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-positive/10 border border-positive/20 mb-6">
              <span className="text-lg">✅</span>
              <div className="text-sm">
                <p className="font-medium text-positive">RBI Rule: Zero prepayment penalty</p>
                <p className="text-muted-foreground mt-0.5">
                  Your floating rate {(LOAN_TYPE_DISPLAY[loan.type as LoanType] ?? LOAN_TYPE_DISPLAY.other).label.toLowerCase()} is protected by RBI regulation. You can make part payments anytime with no penalty.
                </p>
              </div>
            </div>
          );
        }

        if (config.hasPrepaymentPenalty) {
          return (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20 mb-6">
              <span className="text-lg">⚠️</span>
              <div className="text-sm">
                <p className="font-medium text-warning">Prepayment penalty may apply</p>
                <p className="text-muted-foreground mt-0.5">
                  Typically {((config.prepaymentPenaltyPercent ?? 0) * 100).toFixed(1)}% of outstanding principal. Check your loan agreement for exact terms.
                  {config.prepaymentLockInMonths
                    ? ` Lock-in period: ${config.prepaymentLockInMonths} months.`
                    : ""}
                </p>
              </div>
            </div>
          );
        }

        return (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20 mb-6">
            <span className="text-lg">ℹ️</span>
            <div className="text-sm">
              <p className="font-medium text-primary">No prepayment penalty</p>
              <p className="text-muted-foreground mt-0.5">
                This loan type typically has no prepayment penalty. You can make part payments freely.
              </p>
            </div>
          </div>
        );
      })()}

      {/* Part Payment Logger */}
      <div className="mb-6">
        <PartPaymentLogger loanId={loanId} />
      </div>

      {/* Part Payment History */}
      <div className="mb-6">
        <PartPaymentHistory loanId={loanId} />
      </div>

      {/* Amortization Schedule */}
      {amortization.length > 0 && (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-base font-semibold text-foreground">
              Amortization Schedule
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {amortization.length} months remaining
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-background">
                  <th className="text-left px-4 py-2.5 font-medium text-foreground">
                    Month
                  </th>
                  <th className="text-right px-4 py-2.5 font-medium text-foreground">
                    EMI
                  </th>
                  <th className="text-right px-4 py-2.5 font-medium text-foreground">
                    Principal
                  </th>
                  <th className="text-right px-4 py-2.5 font-medium text-foreground">
                    Interest
                  </th>
                  <th className="text-right px-4 py-2.5 font-medium text-foreground">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-background">
                {amortization.slice(0, 60).map((row) => (
                  <tr key={row.month} className="hover:bg-accent">
                    <td className="px-4 py-2 text-muted-foreground">
                      {formatDate(row.date)}
                    </td>
                    <td className="px-4 py-2 text-right font-medium">
                      {formatINR(row.emi)}
                    </td>
                    <td className="px-4 py-2 text-right text-positive">
                      {formatINR(row.principal)}
                    </td>
                    <td className="px-4 py-2 text-right text-negative">
                      {formatINR(row.interest)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {formatLakhs(row.outstanding)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {amortization.length > 60 && (
            <div className="px-4 py-3 bg-background border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                Showing first 60 of {amortization.length} months
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
