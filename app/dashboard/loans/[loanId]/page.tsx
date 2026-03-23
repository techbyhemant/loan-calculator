"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import type { Loan } from "@/types";

import { calculateAmortization } from "@/lib/calculations/loanCalcs";
import { formatINR, formatLakhs, formatDate, formatMonths } from "@/lib/utils/formatters";
import { trpcReact } from "@/lib/trpc/hooks";

import { PartPaymentLogger, PartPaymentHistory } from "@/components/dashboard/PartPaymentLogger";

const LOAN_TYPE_ICONS: Record<string, string> = {
  home: "\u{1F3E0}",
  car: "\u{1F697}",
  personal: "\u{1F4BC}",
  gold: "\u{1F947}",
  education: "\u{1F393}",
  credit_card: "\u{1F4B3}",
  other: "\u{1F4CB}",
};

function SkeletonBlock() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
      <div className="h-4 bg-gray-100 rounded w-full mb-2" />
      <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
      <div className="h-4 bg-gray-100 rounded w-1/2" />
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
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-8 text-center">
        <p className="text-red-600 font-medium">
          {error?.message ?? "Loan not found"}
        </p>
        <Link
          href="/dashboard"
          className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block"
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
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          &larr;
        </Link>
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">
            {LOAN_TYPE_ICONS[loan.type] ?? "\u{1F4CB}"}
          </span>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{loan.name}</h1>
            {loan.lender && (
              <p className="text-sm text-gray-500">{loan.lender}</p>
            )}
          </div>
        </div>
      </div>

      {/* Loan Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-600 mb-1">Outstanding</p>
          <p className="text-lg font-bold text-gray-900">
            {formatLakhs(loan.currentOutstanding)}
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-600 mb-1">Monthly EMI</p>
          <p className="text-lg font-bold text-gray-900">
            {formatINR(loan.emiAmount)}
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-600 mb-1">Interest Rate</p>
          <p className="text-lg font-bold text-gray-900">
            {loan.interestRate}%
            <span className="text-xs font-normal text-gray-500 ml-1">
              {loan.rateType}
            </span>
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-600 mb-1">Remaining Tenure</p>
          <p className="text-lg font-bold text-gray-900">
            {formatMonths(loan.tenureMonths)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{paidPercent.toFixed(0)}% paid off</span>
          <span>
            {formatLakhs(loan.originalAmount - loan.currentOutstanding)} of{" "}
            {formatLakhs(loan.originalAmount)}
          </span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${paidPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Total interest remaining: {formatLakhs(totalInterest)}</span>
          {amortization.length > 0 && (
            <span>
              Debt-free:{" "}
              {formatDate(amortization[amortization.length - 1].date)}
            </span>
          )}
        </div>
      </div>

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
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">
              Amortization Schedule
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {amortization.length} months remaining
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-2.5 font-medium text-gray-700">
                    Month
                  </th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-700">
                    EMI
                  </th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-700">
                    Principal
                  </th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-700">
                    Interest
                  </th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-700">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {amortization.slice(0, 60).map((row) => (
                  <tr key={row.month} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-600">
                      {formatDate(row.date)}
                    </td>
                    <td className="px-4 py-2 text-right font-medium">
                      {formatINR(row.emi)}
                    </td>
                    <td className="px-4 py-2 text-right text-green-700">
                      {formatINR(row.principal)}
                    </td>
                    <td className="px-4 py-2 text-right text-red-600">
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
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500">
                Showing first 60 of {amortization.length} months
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
