"use client";

import { useState } from "react";
import Link from "next/link";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/routers/_app";
import { trpcReact } from "@/lib/trpc/hooks";
import { formatINR } from "@/lib/utils/formatters";
import { CreditCard } from "lucide-react";

type RouterCards = inferRouterOutputs<AppRouter>["creditCards"]["getAll"];
type RouterStats = inferRouterOutputs<AppRouter>["creditCards"]["getStats"];

export default function CreditCardsClient({
  initialCards,
  initialStats,
}: {
  initialCards: RouterCards;
  initialStats: RouterStats;
}) {
  // Both queries get server-prefetched data. React Query keeps things fresh
  // in the background per its 60s staleTime so mutations still update the UI.
  const { data: cards, isLoading } = trpcReact.creditCards.getAll.useQuery(
    undefined,
    { initialData: initialCards },
  );
  const { data: stats } = trpcReact.creditCards.getStats.useQuery(undefined, {
    initialData: initialStats,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Credit Cards</h1>
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="bg-card rounded-xl shadow-sm p-4 animate-pulse">
            <div className="h-4 bg-border rounded w-1/3 mb-2" />
            <div className="h-3 bg-border rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Credit Cards</h1>
        <Link
          href="/dashboard/credit-cards/new"
          className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          + Add Card
        </Link>
      </div>

      {/* Utilization Summary */}
      {stats && stats.cardCount > 0 && (
        <div className="bg-card rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Credit Utilization</span>
            <span className={`text-sm font-semibold ${
              stats.utilization.status === "EXCELLENT" || stats.utilization.status === "GOOD"
                ? "text-positive"
                : stats.utilization.status === "WARNING"
                ? "text-amber-600"
                : "text-negative"
            }`}>
              {stats.utilization.utilizationPercent.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                stats.utilization.status === "EXCELLENT" || stats.utilization.status === "GOOD"
                  ? "bg-primary"
                  : stats.utilization.status === "WARNING"
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${Math.min(stats.utilization.utilizationPercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
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
          <div className="bg-card rounded-xl shadow-sm p-3 text-center">
            <p className="text-xs text-muted-foreground">Total Outstanding</p>
            <p className="text-lg font-bold text-negative">{formatINR(stats.totalOutstanding)}</p>
          </div>
          <div className="bg-card rounded-xl shadow-sm p-3 text-center">
            <p className="text-xs text-muted-foreground">Monthly Interest</p>
            <p className="text-lg font-bold text-amber-600">{formatINR(stats.totalMonthlyInterest)}</p>
          </div>
          <div className="bg-card rounded-xl shadow-sm p-3 text-center">
            <p className="text-xs text-muted-foreground">Min Due Total</p>
            <p className="text-lg font-bold text-foreground">{formatINR(stats.totalMinDue)}</p>
          </div>
          <div className="bg-card rounded-xl shadow-sm p-3 text-center">
            <p className="text-xs text-muted-foreground">Cards</p>
            <p className="text-lg font-bold text-foreground">{stats.cardCount}</p>
          </div>
        </div>
      )}

      {/* Card List */}
      {(!cards || cards.length === 0) ? (
        <div className="bg-card rounded-xl shadow-sm p-8 text-center">
          <CreditCard className="w-8 h-8 text-muted-foreground mb-3 mx-auto" />
          <h3 className="font-semibold text-foreground mb-1">No credit cards added</h3>
          <p className="text-sm text-muted-foreground mb-4">Add your credit cards to track utilization and plan payoff</p>
          <Link
            href="/dashboard/credit-cards/new"
            className="inline-flex px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90"
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
                key={card.id}
                href={`/dashboard/credit-cards/${card.id}`}
                className="block bg-card rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{card.name}</h3>
                    {card.issuer && <p className="text-xs text-muted-foreground">{card.issuer}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-negative">{formatINR(card.currentOutstanding)}</p>
                    <p className="text-xs text-muted-foreground">of {formatINR(card.creditLimit)}</p>
                  </div>
                </div>
                <div className="w-full bg-border rounded-full h-1.5 mb-2">
                  <div
                    className={`h-1.5 rounded-full ${
                      utilPct <= 30 ? "bg-primary" : utilPct <= 50 ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(utilPct, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
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
