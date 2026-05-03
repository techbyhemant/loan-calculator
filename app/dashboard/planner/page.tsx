"use client";

import { useState, useMemo } from "react";

import type { Loan, PayoffResult } from "@/types";

import { compareStrategies } from "@/lib/calculations/payoffStrategies";
import { formatINR, formatLakhs, formatDate } from "@/lib/utils/formatters";
import { trpcReact } from "@/lib/trpc/hooks";

import { ProGate } from "@/components/ui/ProGate";

function SkeletonBlock() {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-6 animate-pulse">
      <div className="h-5 bg-border rounded w-1/3 mb-4" />
      <div className="h-4 bg-muted rounded w-full mb-2" />
      <div className="h-4 bg-muted rounded w-2/3" />
    </div>
  );
}

export default function PlannerPage() {
  return (
    <ProGate feature="Payoff Planner">
      <PlannerContent />
    </ProGate>
  );
}

// Quick-anchor presets in the slider — calibrated to common Indian
// discretionary-spend buckets. Helps users translate "what can I afford"
// into a number instead of guessing.
const QUICK_ANCHORS: { label: string; value: number; sublabel: string }[] = [
  { label: "Skip cabs/coffee", value: 3000, sublabel: "₹3K/mo" },
  { label: "Cancel OTT bundles", value: 1500, sublabel: "₹1.5K/mo" },
  { label: "One dining-out", value: 5000, sublabel: "₹5K/mo" },
  { label: "Bonus month", value: 25000, sublabel: "₹25K/mo" },
];

function PlannerContent() {
  const { data: loansRaw, isLoading } = trpcReact.loans.getAll.useQuery();
  const loans = useMemo(
    () => (loansRaw ?? []) as unknown as Loan[],
    [loansRaw],
  );

  const [monthlyExtra, setMonthlyExtra] = useState<number>(10000);
  // Honest framing: let the user explicitly pick math (avalanche) or
  // momentum (snowball). Default to the calc's recommendation, but
  // surface the trade-off so the choice is informed.
  const [chosenStrategy, setChosenStrategy] = useState<
    "avalanche" | "snowball" | null
  >(null);

  const comparison = useMemo(() => {
    if (loans.length < 2) return null;
    return compareStrategies(loans, monthlyExtra);
  }, [loans, monthlyExtra]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonBlock />
        <SkeletonBlock />
      </div>
    );
  }

  if (loans.length < 2) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-foreground mb-6">
          Payoff Planner
        </h1>
        <div className="bg-card border border-border rounded-xl shadow-sm p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Add at least 2 loans to compare payoff strategies.
          </p>
        </div>
      </div>
    );
  }

  if (!comparison) return null;

  const activeStrategy = chosenStrategy ?? comparison.recommended;
  const chosen: PayoffResult =
    activeStrategy === "avalanche" ? comparison.avalanche : comparison.snowball;
  const newOutflow = comparison.currentMonthlyOutflow + monthlyExtra;

  // Find the first loan to die under the chosen strategy — used in the
  // honest framing copy ("first win in N months").
  const firstWin = chosen.milestones[0];
  const otherStrategy =
    activeStrategy === "avalanche"
      ? comparison.snowball
      : comparison.avalanche;
  const otherFirstWin = otherStrategy.milestones[0];

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground mb-2">
        Payoff Planner
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Find your fastest, cheapest path to debt-free.
      </p>

      {/* Cash-flow header — the wallet-feel reality check. */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-4 sm:p-5 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Currently paying
            </p>
            <p className="text-lg font-bold text-foreground">
              {formatINR(comparison.currentMonthlyOutflow)}
              <span className="text-xs font-normal text-muted-foreground">
                {" "}
                /mo
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">With extra</p>
            <p className="text-lg font-bold text-primary">
              {formatINR(newOutflow)}
              <span className="text-xs font-normal text-muted-foreground">
                {" "}
                /mo
              </span>
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-xs text-muted-foreground mb-1">Debt-free</p>
            <p className="text-lg font-bold text-positive">
              {formatDate(chosen.debtFreeDate)}
            </p>
            {chosen.monthsEarlier > 0 && (
              <p className="text-[11px] text-positive">
                {chosen.monthsEarlier} months earlier
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Slider with anchor chips — replaces the bare numeric input. */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-4 sm:p-5 mb-6">
        <div className="flex items-baseline justify-between mb-2">
          <label className="text-sm font-medium text-foreground">
            Extra you can put toward debt
          </label>
          <span className="text-base font-bold text-primary">
            {formatINR(monthlyExtra)}
            <span className="text-xs font-normal text-muted-foreground">
              {" "}
              /mo
            </span>
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={50000}
          step={500}
          value={monthlyExtra}
          onChange={(e) => setMonthlyExtra(Number(e.target.value))}
          className="w-full accent-primary cursor-pointer"
          aria-label="Extra monthly payment"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1 mb-3">
          <span>₹0</span>
          <span>₹25K</span>
          <span>₹50K</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_ANCHORS.map((a) => (
            <button
              key={a.value}
              onClick={() => setMonthlyExtra(a.value)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                monthlyExtra === a.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border hover:bg-accent"
              }`}
            >
              {a.label}
              <span className="ml-1 opacity-60">{a.sublabel}</span>
            </button>
          ))}
        </div>
      </div>

      {monthlyExtra > 0 && (
        <>
          {/* Strategy toggle — honest head-vs-heart framing. */}
          <div className="bg-card border border-border rounded-xl shadow-sm p-4 sm:p-5 mb-6">
            <p className="text-sm font-semibold text-foreground mb-1">
              Pick your strategy
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {comparison.interestDifference < 5000
                ? "These strategies are nearly tied. The choice is yours."
                : comparison.explanation}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <StrategyCard
                title="Math (Avalanche)"
                subtitle="Highest interest rate first"
                saved={comparison.avalanche.interestSaved}
                debtFree={comparison.avalanche.debtFreeDate}
                firstWinMonths={comparison.avalanche.milestones[0]?.monthsFromNow}
                selected={activeStrategy === "avalanche"}
                onSelect={() => setChosenStrategy("avalanche")}
                tag={
                  comparison.recommended === "avalanche"
                    ? "Saves the most"
                    : null
                }
              />
              <StrategyCard
                title="Momentum (Snowball)"
                subtitle="Smallest balance first"
                saved={comparison.snowball.interestSaved}
                debtFree={comparison.snowball.debtFreeDate}
                firstWinMonths={comparison.snowball.milestones[0]?.monthsFromNow}
                selected={activeStrategy === "snowball"}
                onSelect={() => setChosenStrategy("snowball")}
                tag={
                  comparison.snowball.milestones[0]?.monthsFromNow !==
                    undefined &&
                  comparison.avalanche.milestones[0]?.monthsFromNow !==
                    undefined &&
                  comparison.snowball.milestones[0].monthsFromNow <
                    comparison.avalanche.milestones[0].monthsFromNow
                    ? "First win sooner"
                    : null
                }
              />
            </div>
            {firstWin && otherFirstWin && (
              <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
                Behavioural research (Gal & McShane, Kellogg School) finds people
                who clear small debts first stick with their plan more often,
                even when avalanche saves more on paper. Pick the one
                you&rsquo;ll actually finish.
              </p>
            )}
          </div>

          {/* Milestone timeline — the journey, not the verdict. */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="px-4 sm:px-5 py-3 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">
                Your debt-free journey
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Each loan you kill frees its EMI to attack the next one.
              </p>
            </div>
            <div className="p-4 sm:p-5">
              <MilestoneTimeline milestones={chosen.milestones} />
            </div>
          </div>
        </>
      )}

      {monthlyExtra === 0 && (
        <div className="bg-muted border border-border rounded-xl p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Move the slider to see how fast you can be debt-free.
          </p>
        </div>
      )}
    </div>
  );
}

function StrategyCard({
  title,
  subtitle,
  saved,
  debtFree,
  firstWinMonths,
  selected,
  onSelect,
  tag,
}: {
  title: string;
  subtitle: string;
  saved: number;
  debtFree: Date;
  firstWinMonths: number | undefined;
  selected: boolean;
  onSelect: () => void;
  tag: string | null;
}) {
  return (
    <button
      onClick={onSelect}
      className={`text-left rounded-lg border-2 p-4 transition-all ${
        selected
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:border-muted-foreground/30"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        </div>
        {tag && (
          <span className="text-[10px] bg-positive/10 text-positive px-1.5 py-0.5 rounded-full font-semibold whitespace-nowrap">
            {tag}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground">Saves</p>
          <p className="font-bold text-positive text-sm">{formatLakhs(saved)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Done by</p>
          <p className="font-bold text-foreground text-sm">
            {formatDate(debtFree)}
          </p>
        </div>
        {firstWinMonths !== undefined && (
          <div className="col-span-2 pt-2 border-t border-border">
            <p className="text-muted-foreground">
              First loan gone in{" "}
              <span className="font-semibold text-foreground">
                {firstWinMonths} months
              </span>
            </p>
          </div>
        )}
      </div>
    </button>
  );
}

function MilestoneTimeline({
  milestones,
}: {
  milestones: PayoffResult["milestones"];
}) {
  if (milestones.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nothing to show — increase your extra payment to see milestones.
      </p>
    );
  }

  return (
    <ol className="relative border-l-2 border-border ml-3 space-y-6">
      {milestones.map((m, i) => {
        const isLast = i === milestones.length - 1;
        return (
          <li key={m.loanId} className="ml-5">
            <span
              className={`absolute -left-[9px] flex items-center justify-center w-4 h-4 rounded-full ring-4 ring-card ${
                isLast ? "bg-positive" : "bg-primary"
              }`}
              aria-hidden
            />
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="text-sm font-semibold text-foreground">
                {formatDate(m.payoffDate)}
              </p>
              <p className="text-xs text-muted-foreground">
                in {m.monthsFromNow} months
              </p>
            </div>
            <p className="text-sm text-foreground mt-1">
              <span className="font-medium">{m.loanName}</span>{" "}
              {isLast ? (
                <span className="text-positive font-semibold">
                  — you&rsquo;re debt-free 🎉
                </span>
              ) : (
                <span className="text-muted-foreground">
                  paid off — frees up{" "}
                  <span className="font-semibold text-foreground">
                    {formatINR(m.freedEmi)}/mo
                  </span>{" "}
                  toward the next loan
                </span>
              )}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
