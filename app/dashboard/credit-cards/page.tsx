"use client";

import { useState } from "react";
import Link from "next/link";
import { trpcReact } from "@/lib/trpc/hooks";
import { formatINR } from "@/lib/utils/formatters";

export default function CreditCardsPage() {
  const { data: cards, isLoading } = trpcReact.creditCards.getAll.useQuery();
  const { data: stats } = trpcReact.creditCards.getStats.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Credit Cards</h1>
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Credit Cards</h1>
        <Link
          href="/dashboard/credit-cards/new"
          className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          + Add Card
        </Link>
      </div>

      {/* Utilization Summary */}
      {stats && stats.cardCount > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Credit Utilization</span>
            <span className={`text-sm font-semibold ${
              stats.utilization.status === "EXCELLENT" || stats.utilization.status === "GOOD"
                ? "text-emerald-700"
                : stats.utilization.status === "WARNING"
                ? "text-amber-600"
                : "text-red-600"
            }`}>
              {stats.utilization.utilizationPercent.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                stats.utilization.status === "EXCELLENT" || stats.utilization.status === "GOOD"
                  ? "bg-emerald-500"
                  : stats.utilization.status === "WARNING"
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${Math.min(stats.utilization.utilizationPercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {formatINR(stats.totalOutstanding)} of {formatINR(stats.totalLimit)} used
          </p>
          {stats.utilization.status === "WARNING" || stats.utilization.status === "CRITICAL" ? (
            <p className="text-xs text-amber-600 mt-1">{stats.utilization.recommendation}</p>
          ) : null}
        </div>
      )}

      {/* Stats Row */}
      {stats && stats.cardCount > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl shadow-sm p-3 text-center">
            <p className="text-xs text-gray-500">Total Outstanding</p>
            <p className="text-lg font-bold text-red-600">{formatINR(stats.totalOutstanding)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 text-center">
            <p className="text-xs text-gray-500">Monthly Interest</p>
            <p className="text-lg font-bold text-amber-600">{formatINR(stats.totalMonthlyInterest)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 text-center">
            <p className="text-xs text-gray-500">Min Due Total</p>
            <p className="text-lg font-bold text-gray-900">{formatINR(stats.totalMinDue)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 text-center">
            <p className="text-xs text-gray-500">Cards</p>
            <p className="text-lg font-bold text-gray-900">{stats.cardCount}</p>
          </div>
        </div>
      )}

      {/* Card List */}
      {(!cards || cards.length === 0) ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-3xl mb-3">💳</p>
          <h3 className="font-semibold text-gray-800 mb-1">No credit cards added</h3>
          <p className="text-sm text-gray-500 mb-4">Add your credit cards to track utilization and plan payoff</p>
          <Link
            href="/dashboard/credit-cards/new"
            className="inline-flex px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700"
          >
            Add Your First Card
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {cards.map((card: any) => {
            const utilPct = card.creditLimit > 0
              ? (card.currentOutstanding / card.creditLimit) * 100
              : 0;
            const monthlyInterest = card.currentOutstanding * card.monthlyRate;
            const minDue = Math.max(card.currentOutstanding * card.minimumDuePercent, 200);

            return (
              <Link
                key={card._id}
                href={`/dashboard/credit-cards/${card._id}`}
                className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{card.name}</h3>
                    {card.issuer && <p className="text-xs text-gray-500">{card.issuer}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{formatINR(card.currentOutstanding)}</p>
                    <p className="text-xs text-gray-500">of {formatINR(card.creditLimit)}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                  <div
                    className={`h-1.5 rounded-full ${
                      utilPct <= 30 ? "bg-emerald-500" : utilPct <= 50 ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(utilPct, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Interest: {formatINR(monthlyInterest)}/mo</span>
                  <span>Min due: {formatINR(minDue)}</span>
                  <span>{utilPct.toFixed(0)}% used</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
