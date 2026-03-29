"use client";

import { useState, useMemo } from "react";

import type { Loan } from "@/types";

import { computeChallenge } from "@/lib/calculations/debtFreeChallenge";
import { formatDate, formatINR } from "@/lib/utils/formatters";
import { trpcReact } from "@/lib/trpc/hooks";

import NumericInput from "@/components/ui/NumericInput";
import {
  ClipboardList,
  Zap,
  Sprout,
  Leaf,
  Trophy,
  Flame,
  PiggyBank,
  Gem,
  Rocket,
  Star,
  Crown,
} from "lucide-react";

const MILESTONE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "clipboard-list": ClipboardList,
  "zap": Zap,
  "sprout": Sprout,
  "leaf": Leaf,
  "trophy": Trophy,
  "flame": Flame,
  "piggy-bank": PiggyBank,
  "gem": Gem,
  "rocket": Rocket,
  "star": Star,
  "crown": Crown,
};

function SkeletonBlock() {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-6 animate-pulse">
      <div className="h-5 bg-border rounded w-1/3 mb-4" />
      <div className="h-4 bg-muted rounded w-full mb-2" />
      <div className="h-4 bg-muted rounded w-2/3" />
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
      <h1 className="text-xl font-semibold text-foreground mb-6">
        Debt-Free Challenge
      </h1>

      {/* Level & Progress */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-muted-foreground">Your Level</p>
            <p className="text-lg font-bold text-foreground">{challenge.level}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              {challenge.earned}/{challenge.total}
            </p>
            <p className="text-xs text-muted-foreground">milestones earned</p>
          </div>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {challenge.nextMilestone && (
          <p className="text-xs text-muted-foreground mt-2">
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
                ? "bg-card border-positive/20 shadow-sm"
                : "bg-background border-border opacity-50"
            }`}
          >
            <div className="mb-1 flex justify-center">
              {(() => {
                const IconComp = MILESTONE_ICONS[m.icon];
                return IconComp ? <IconComp className="w-6 h-6 text-primary" /> : null;
              })()}
            </div>
            <p
              className={`text-xs font-semibold ${m.earned ? "text-foreground" : "text-muted-foreground"}`}
            >
              {m.title}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{m.description}</p>
            {m.earned && (
              <span className="inline-block mt-1 text-[10px] bg-positive/10 text-positive px-1.5 py-0.5 rounded-full font-medium">
                Earned
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Debt-Free Timeline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Current Debt-Free Date</p>
          <p className="text-xl font-bold text-foreground">
            {challenge.debtFreeDate
              ? formatDate(challenge.debtFreeDate)
              : "Add loans"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            At current EMI, no extra payments
          </p>
        </div>
        <div className="bg-card border border-positive/20 rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">
            With Extra {formatINR((monthlyExtra as number) || 0)}/mo
          </p>
          <p className="text-xl font-bold text-positive">
            {challenge.whatIfDebtFreeDate
              ? formatDate(challenge.whatIfDebtFreeDate)
              : "—"}
          </p>
          {challenge.debtFreeDate && challenge.whatIfDebtFreeDate && (
            <p className="text-xs text-positive mt-1">
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
      <div className="bg-card border border-border rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-foreground mb-3">
          What If Calculator
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          How much extra can you put toward loans each month?
        </p>
        <div className="max-w-xs">
          <NumericInput
            value={monthlyExtra}
            onChange={setMonthlyExtra}
            placeholder="10,000"
            min={0}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Extra payment is applied to your highest-rate loan first (avalanche
          strategy) for maximum savings.
        </p>
      </div>
    </div>
  );
}
