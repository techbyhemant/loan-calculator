"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpcReact } from "@/lib/trpc/hooks";
import { formatINR } from "@/lib/utils/formatters";
import { calculateCCScenarios, calculateFixedPaymentForTarget, CC_DEFAULTS } from "@/lib/calculations/creditCardCalcs";

export default function CreditCardDetailPage({ params }: { params: Promise<{ cardId: string }> }) {
  const { cardId } = use(params);
  const router = useRouter();
  const utils = trpcReact.useUtils();
  const { data: card, isLoading } = trpcReact.creditCards.getById.useQuery({ id: cardId });
  const deleteCard = trpcReact.creditCards.delete.useMutation({
    onSuccess: () => {
      utils.creditCards.getAll.invalidate();
      router.push("/dashboard/credit-cards");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Card not found</p>
        <Link href="/dashboard/credit-cards" className="text-emerald-600 underline text-sm mt-2 block">
          Back to cards
        </Link>
      </div>
    );
  }

  const outstanding = card.currentOutstanding as number;
  const limit = card.creditLimit as number;
  const rate = card.monthlyRate as number;
  const utilPct = limit > 0 ? (outstanding / limit) * 100 : 0;
  const monthlyInterest = outstanding * rate;
  const annualRate = rate * 12 * 100;

  const scenarios = outstanding > 0
    ? calculateCCScenarios({ outstanding, monthlyRate: rate })
    : null;

  const paymentOptions = outstanding > 0
    ? [
        { label: "Clear in 6 months", amount: calculateFixedPaymentForTarget({ outstanding, monthlyRate: rate }, 6) },
        { label: "Clear in 12 months", amount: calculateFixedPaymentForTarget({ outstanding, monthlyRate: rate }, 12) },
        { label: "Clear in 24 months", amount: calculateFixedPaymentForTarget({ outstanding, monthlyRate: rate }, 24) },
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/credit-cards" className="text-gray-400 hover:text-gray-600">
          &larr;
        </Link>
        <h1 className="text-xl font-bold text-gray-900">{card.name}</h1>
        {card.issuer && <span className="text-sm text-gray-500">{card.issuer as string}</span>}
      </div>

      {/* Overview Card */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-sm text-gray-500">Outstanding Balance</p>
            <p className="text-2xl font-bold text-red-600">{formatINR(outstanding)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Credit Limit</p>
            <p className="text-lg font-semibold text-gray-900">{formatINR(limit)}</p>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full ${utilPct <= 30 ? "bg-emerald-500" : utilPct <= 50 ? "bg-amber-500" : "bg-red-500"}`}
            style={{ width: `${Math.min(utilPct, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{utilPct.toFixed(1)}% utilization</span>
          <span>{formatINR(limit - outstanding)} available</span>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl shadow-sm p-3 text-center">
          <p className="text-xs text-gray-500">Interest Rate</p>
          <p className="text-lg font-bold text-gray-900">{(rate * 100).toFixed(1)}%/mo</p>
          <p className="text-xs text-gray-500">{annualRate.toFixed(0)}% PA</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 text-center">
          <p className="text-xs text-gray-500">Monthly Interest</p>
          <p className="text-lg font-bold text-amber-600">{formatINR(monthlyInterest)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 text-center">
          <p className="text-xs text-gray-500">Minimum Due</p>
          <p className="text-lg font-bold text-gray-900">
            {formatINR(Math.max(outstanding * (card.minimumDuePercent as number), CC_DEFAULTS.minimumDueFloor))}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 text-center">
          <p className="text-xs text-gray-500">Due Date</p>
          <p className="text-lg font-bold text-gray-900">{card.dueDate as number}th</p>
        </div>
      </div>

      {/* Payoff Projections */}
      {scenarios && (
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <h2 className="font-semibold text-gray-900">Payoff Options</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
            <p className="text-sm text-red-700">
              Paying only minimum due: <strong>{scenarios.minimumDue.monthsToPayoff} months</strong> ({(scenarios.minimumDue.monthsToPayoff / 12).toFixed(1)} years) and{" "}
              <strong>{formatINR(scenarios.minimumDue.totalInterestPaid)}</strong> in interest
            </p>
          </div>
          <div className="space-y-2">
            {paymentOptions.map((opt) => (
              <div key={opt.label} className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                <span className="text-sm text-emerald-800">{opt.label}</span>
                <span className="font-semibold text-emerald-700">{formatINR(opt.amount)}/mo</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {outstanding === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
          <p className="text-emerald-800 font-medium">No outstanding balance — great job!</p>
        </div>
      )}

      {/* Delete */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            if (confirm("Remove this credit card from tracking?")) {
              deleteCard.mutate({ id: cardId });
            }
          }}
          className="text-sm text-red-500 hover:text-red-700"
        >
          Remove Card
        </button>
      </div>
    </div>
  );
}
