"use client";

import { useState, useMemo } from "react";

import type { Loan } from "@/types";

import { computeChallenge } from "@/lib/calculations/debtFreeChallenge";
import { formatDate, formatINR } from "@/lib/utils/formatters";
import { trpcReact } from "@/lib/trpc/hooks";

import NumericInput from "@/components/ui/NumericInput";

function SkeletonBlock() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
      <div className="h-4 bg-gray-100 rounded w-full mb-2" />
      <div className="h-4 bg-gray-100 rounded w-2/3" />
    </div>
  );
}

export default function ChallengePage() {
  const { data: loansRaw, isLoading: loansLoading } =
    trpcReact.loans.getAll.useQuery();
  const { data: ppRaw, isLoading: ppLoading } =
    trpcReact.partPayments.getByLoan.useQuery({});

  const loans = useMemo(
    () => (loansRaw ?? []) as unknown as Loan[],
    [loansRaw],
  );
  const partPayments = useMemo(
    () =>
      (ppRaw ?? []) as unknown as Array<{
        amount: number;
        date: string;
        interestSaved: number;
      }>,
    [ppRaw],
  );

  const [monthlyExtra, setMonthlyExtra] = useState<number | "">(10000);

  const challenge = useMemo(
    () => computeChallenge(loans, partPayments, (monthlyExtra as number) || 0),
    [loans, partPayments, monthlyExtra],
  );

  const isLoading = loansLoading || ppLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonBlock />
        <SkeletonBlock />
      </div>
    );
  }

  const progressPercent =
    challenge.total > 0
      ? Math.round((challenge.earned / challenge.total) * 100)
      : 0;

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">
        Debt-Free Challenge
      </h1>

      {/* Level & Progress */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-600">Your Level</p>
            <p className="text-lg font-bold text-gray-900">{challenge.level}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-700">
              {challenge.earned}/{challenge.total}
            </p>
            <p className="text-xs text-gray-500">milestones earned</p>
          </div>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {challenge.nextMilestone && (
          <p className="text-xs text-gray-500 mt-2">
            Next: <strong>{challenge.nextMilestone.title}</strong> &mdash;{" "}
            {challenge.nextMilestone.description}
          </p>
        )}
      </div>

      {/* Milestones Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {challenge.milestones.map((m) => (
          <div
            key={m.id}
            className={`rounded-xl border p-3 text-center transition-all ${
              m.earned
                ? "bg-white border-green-200 shadow-sm"
                : "bg-gray-50 border-gray-100 opacity-50"
            }`}
          >
            <p className="text-2xl mb-1">{m.icon}</p>
            <p
              className={`text-xs font-semibold ${m.earned ? "text-gray-900" : "text-gray-400"}`}
            >
              {m.title}
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">{m.description}</p>
            {m.earned && (
              <span className="inline-block mt-1 text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full font-medium">
                Earned
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Debt-Free Timeline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm text-gray-600 mb-1">Current Debt-Free Date</p>
          <p className="text-xl font-bold text-gray-900">
            {challenge.debtFreeDate
              ? formatDate(challenge.debtFreeDate)
              : "Add loans"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            At current EMI, no extra payments
          </p>
        </div>
        <div className="bg-white border border-green-200 rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm text-gray-600 mb-1">
            With Extra {formatINR((monthlyExtra as number) || 0)}/mo
          </p>
          <p className="text-xl font-bold text-green-700">
            {challenge.whatIfDebtFreeDate
              ? formatDate(challenge.whatIfDebtFreeDate)
              : "—"}
          </p>
          {challenge.debtFreeDate && challenge.whatIfDebtFreeDate && (
            <p className="text-xs text-green-600 mt-1">
              {Math.max(
                0,
                Math.round(
                  (challenge.debtFreeDate.getTime() -
                    challenge.whatIfDebtFreeDate.getTime()) /
                    (30 * 24 * 60 * 60 * 1000),
                ),
              )}{" "}
              months earlier!
            </p>
          )}
        </div>
      </div>

      {/* What If Slider */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">
          What If Calculator
        </h2>
        <p className="text-xs text-gray-500 mb-3">
          How much extra can you put toward loans each month?
        </p>
        <div className="max-w-xs">
          <NumericInput
            value={monthlyExtra}
            onChange={setMonthlyExtra}
            placeholder="10,000"
            min={0}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Extra payment is applied to your highest-rate loan first (avalanche
          strategy) for maximum savings.
        </p>
      </div>
    </div>
  );
}
