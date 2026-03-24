"use client";

import Link from "next/link";
import type { Loan } from "@/types";
import { formatINR, formatDate } from "@/lib/utils/formatters";
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

function LoanRow({ loan }: { loan: Loan }) {
  const icon = LOAN_TYPE_ICONS[loan.type] ?? "\u{1F4CB}";
  const paidPercent = loan.originalAmount > 0
    ? Math.round(((loan.originalAmount - loan.currentOutstanding) / loan.originalAmount) * 100)
    : 0;

  return (
    <Link
      href={`/dashboard/loans/${loan._id}`}
      className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl shadow-sm p-4 hover:border-blue-200 transition-colors"
    >
      <span className="text-2xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{loan.name}</p>
        <p className="text-xs text-gray-500">
          {loan.lender} &middot; {loan.interestRate}% &middot; {loan.tenureMonths} months
        </p>
        <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="bg-emerald-500 h-1.5 rounded-full"
            style={{ width: `${Math.min(paidPercent, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">{paidPercent}% paid</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-gray-900">{formatINR(loan.currentOutstanding)}</p>
        <p className="text-xs text-gray-500">EMI {formatINR(loan.emiAmount)}</p>
      </div>
    </Link>
  );
}

export default function LoansPage() {
  const { data: loans, isLoading } = trpcReact.loans.getAll.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">My Loans</h1>
        <Link
          href="/dashboard/loans/new"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          + Add Loan
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : !loans?.length ? (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-8 text-center">
          <p className="text-3xl mb-3">📋</p>
          <h3 className="text-base font-semibold text-gray-800 mb-1">No loans yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Add your first loan to start tracking your debt-free journey.
          </p>
          <Link
            href="/dashboard/loans/new"
            className="inline-flex px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Your First Loan
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {loans.map((loan: Loan) => (
            <LoanRow key={loan._id} loan={loan} />
          ))}
        </div>
      )}
    </div>
  );
}
