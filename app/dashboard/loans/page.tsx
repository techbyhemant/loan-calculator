"use client";

import Link from "next/link";
import type { Loan } from "@/types";
import { formatINR, formatDate } from "@/lib/utils/formatters";
import { trpcReact } from "@/lib/trpc/hooks";
import { LOAN_TYPE_DISPLAY } from "@/lib/calculations/loanTypeConfig";
import type { LoanType } from "@/lib/calculations/loanTypeConfig";
import { LoanTypeIcon } from "@/components/ui/LoanTypeIcon";

function LoanRow({ loan }: { loan: Loan }) {
  const display = LOAN_TYPE_DISPLAY[loan.type as LoanType] ?? LOAN_TYPE_DISPLAY.other;
  const paidPercent = loan.originalAmount > 0
    ? Math.round(((loan.originalAmount - loan.currentOutstanding) / loan.originalAmount) * 100)
    : 0;

  return (
    <Link
      href={`/dashboard/loans/${loan.id}`}
      className="flex items-center gap-4 bg-card border border-border rounded-xl shadow-sm p-4 hover:border-primary/20 transition-colors"
    >
      <LoanTypeIcon icon={display.icon} size="lg" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground truncate">{loan.name}</p>
          <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0">
            <LoanTypeIcon icon={display.icon} size="sm" className="mr-1 inline-block align-middle" /> {display.shortLabel}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {loan.lender} &middot; {loan.interestRate}% &middot; {loan.tenureMonths} months
        </p>
        <div className="mt-2 w-full bg-muted rounded-full h-1.5">
          <div
            className="bg-primary h-1.5 rounded-full"
            style={{ width: `${Math.min(paidPercent, 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">{paidPercent}% paid</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-foreground">{formatINR(loan.currentOutstanding)}</p>
        <p className="text-xs text-muted-foreground">EMI {formatINR(loan.emiAmount)}</p>
      </div>
    </Link>
  );
}

export default function LoansPage() {
  const { data: loans, isLoading } = trpcReact.loans.getAll.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">My Loans</h1>
        <Link
          href="/dashboard/loans/new"
          className="bg-primary hover:bg-primary/90 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          + Add Loan
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl shadow-sm p-4 animate-pulse">
              <div className="h-4 bg-border rounded w-1/3 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : !loans?.length ? (
        <div className="bg-card border border-border rounded-xl shadow-sm p-8 text-center">
          <p className="text-3xl mb-3">📋</p>
          <h3 className="text-base font-semibold text-foreground mb-1">No loans yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add your first loan to start tracking your debt-free journey.
          </p>
          <Link
            href="/dashboard/loans/new"
            className="inline-flex px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Add Your First Loan
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {(loans as unknown as Loan[]).map((loan) => (
            <LoanRow key={loan.id} loan={loan} />
          ))}
        </div>
      )}
    </div>
  );
}
