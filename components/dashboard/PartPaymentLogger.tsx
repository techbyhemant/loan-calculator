"use client";

import { useState } from "react";

import type { ReduceType } from "@/types";

import { formatINR } from "@/lib/utils/formatters";
import { trpcReact } from "@/lib/trpc/hooks";

import NumericInput from "@/components/ui/NumericInput";

interface PartPaymentLoggerProps {
  loanId: string;
}

export function PartPaymentLogger({ loanId }: PartPaymentLoggerProps) {
  const [amount, setAmount] = useState<number | "">(100000);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [reduceType, setReduceType] = useState<ReduceType>("tenure");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const utils = trpcReact.useUtils();

  const createPartPayment = trpcReact.partPayments.create.useMutation({
    onSuccess: () => {
      utils.partPayments.getByLoan.invalidate({ loanId });
      utils.loans.getById.invalidate({ id: loanId });
      utils.loans.getAll.invalidate();
      setAmount(100000);
      setNote("");
      setError(null);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError("Amount must be positive");
      return;
    }
    setError(null);
    createPartPayment.mutate({
      loanId,
      amount: amount as number,
      date,
      reduceType,
      note: note.trim() || undefined,
    });
  };

  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none";

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 sm:p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">
        Log Part Payment
      </h3>

      {error && (
        <div className="text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (&rupee;)
            </label>
            <NumericInput
              value={amount}
              onChange={setAmount}
              placeholder="1,00,000"
              min={1}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            After part payment, reduce:
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setReduceType("tenure")}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                reduceType === "tenure"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
              }`}
            >
              Reduce Tenure
            </button>
            <button
              type="button"
              onClick={() => setReduceType("emi")}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                reduceType === "emi"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
              }`}
            >
              Reduce EMI
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note (optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Bonus payout"
            maxLength={200}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={createPartPayment.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {createPartPayment.isPending ? "Saving..." : "Log Part Payment"}
        </button>
      </form>
    </div>
  );
}

// Part Payment History List
interface PartPaymentHistoryProps {
  loanId: string;
}

export function PartPaymentHistory({ loanId }: PartPaymentHistoryProps) {
  const { data: partPayments, isLoading } =
    trpcReact.partPayments.getByLoan.useQuery({ loanId });
  const utils = trpcReact.useUtils();

  const deletePartPayment = trpcReact.partPayments.delete.useMutation({
    onSuccess: () => {
      utils.partPayments.getByLoan.invalidate({ loanId });
      utils.loans.getAll.invalidate();
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
        <div className="h-3 bg-gray-100 rounded w-full mb-2" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    );
  }

  const items = (partPayments ?? []) as Array<{
    _id: string;
    amount: number;
    date: string;
    reduceType: string;
    interestSaved: number;
    monthsReduced: number;
    note?: string;
  }>;

  if (items.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 text-center">
        <p className="text-sm text-gray-500">
          No part payments logged yet. Use the form above to log one.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">
          Part Payment History
        </h3>
      </div>
      <div className="divide-y divide-gray-100">
        {items.map((pp) => (
          <div key={pp._id} className="px-4 py-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {formatINR(pp.amount)}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                  {pp.reduceType === "tenure" ? "Tenure reduced" : "EMI reduced"}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {new Date(pp.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
                {pp.interestSaved > 0 && (
                  <span className="text-green-600 ml-2">
                    Saved {formatINR(pp.interestSaved)}
                  </span>
                )}
                {pp.monthsReduced > 0 && (
                  <span className="text-blue-600 ml-2">
                    {pp.monthsReduced} months earlier
                  </span>
                )}
                {pp.note && (
                  <span className="text-gray-400 ml-2">&middot; {pp.note}</span>
                )}
              </div>
            </div>
            <button
              onClick={() => deletePartPayment.mutate({ id: pp._id })}
              disabled={deletePartPayment.isPending}
              className="text-xs text-red-500 hover:text-red-700 transition-colors"
              title="Delete"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
