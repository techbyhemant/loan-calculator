"use client";

import { useState } from "react";
import { trpcReact } from "@/lib/trpc/hooks";
import {
  calculateEMI,
  calculateEffectiveRate,
} from "@/lib/calculations/loanCalcs";
import { formatINR } from "@/lib/utils/formatters";
import NumericInput from "@/components/ui/NumericInput";

// "Refresh from bank statement" — the dashboard's primary "keep my loan
// honest" action. User opens their latest bank statement, types in three
// numbers (outstanding, EMI, as-of date), we (1) reconcile against what
// LastEMI projected, (2) optionally back-solve the effective rate from
// the actual EMI, (3) commit all anchors in one mutation.
//
// Design choice: this modal does NOT read the PDF. PDF parsing comes
// later. For now: fast, manual, but high-trust.

interface RefreshFromStatementModalProps {
  open: boolean;
  onClose: () => void;
  /** The loan being refreshed — needed for principal/tenure/contractRate context */
  loan: {
    id: string;
    originalAmount: number;
    tenureMonths: number;
    interestRate: number;
    currentOutstanding: number;
    emiAmount: number;
    outstandingAsOf?: string | null;
  };
}

export function RefreshFromStatementModal({
  open,
  onClose,
  loan,
}: RefreshFromStatementModalProps) {
  const [outstanding, setOutstanding] = useState<number | "">(
    loan.currentOutstanding,
  );
  const [emi, setEmi] = useState<number | "">(loan.emiAmount);
  const [asOfDate, setAsOfDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [updateRate, setUpdateRate] = useState(true);

  const utils = trpcReact.useUtils();
  const refresh = trpcReact.loans.refreshFromStatement.useMutation({
    onSuccess: () => {
      utils.loans.getAll.invalidate();
      utils.loans.getById.invalidate({ id: loan.id });
      onClose();
    },
  });

  // Recompute the effective rate every time EMI changes
  const effectiveRate =
    typeof emi === "number" && emi > 0
      ? calculateEffectiveRate(loan.originalAmount, emi, loan.tenureMonths)
      : loan.interestRate;
  const calculatedEmiAtContract = calculateEMI(
    loan.originalAmount,
    loan.interestRate,
    loan.tenureMonths,
  );
  const rateGap = effectiveRate - loan.interestRate;
  const rateChanged = Math.abs(rateGap) > 0.01;

  const handleSubmit = () => {
    if (typeof outstanding !== "number" || typeof emi !== "number") return;
    // Build the payload with conditional spread — omitting newInterestRate
    // entirely when not updating. (superjson can serialize `undefined` as
    // `null` in some setups, which breaks .optional() validation.)
    refresh.mutate({
      loanId: loan.id,
      currentOutstanding: outstanding,
      emiAmount: emi,
      asOfDate,
      ...(updateRate && rateChanged
        ? { newInterestRate: Number(effectiveRate.toFixed(3)) }
        : {}),
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-3 py-4">
      <div className="w-full max-w-lg bg-card rounded-2xl shadow-xl border border-border max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Refresh from bank statement
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Open your latest loan statement and type the three numbers below.
              We&apos;ll reconcile and update your dashboard.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 -mr-1"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Statement date */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Statement date <span className="text-muted-foreground font-normal">(as of)</span>
            </label>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none"
            />
            {loan.outstandingAsOf && (
              <p className="text-xs text-muted-foreground mt-1">
                Last refreshed:{" "}
                {new Date(loan.outstandingAsOf).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}
          </div>

          {/* Outstanding from statement */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Current outstanding (₹)
            </label>
            <NumericInput
              value={outstanding}
              onChange={setOutstanding}
              placeholder="From your statement"
              min={0}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none"
            />
            {typeof outstanding === "number" &&
              outstanding !== loan.currentOutstanding && (
                <p className="text-xs text-muted-foreground mt-1">
                  Currently saved:{" "}
                  <span className="font-medium">
                    {formatINR(loan.currentOutstanding)}
                  </span>{" "}
                  → will update to{" "}
                  <span className="font-medium text-foreground">
                    {formatINR(outstanding)}
                  </span>
                </p>
              )}
          </div>

          {/* EMI from statement */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Monthly EMI (₹)
            </label>
            <NumericInput
              value={emi}
              onChange={setEmi}
              placeholder="From your statement"
              min={0}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Math at {loan.interestRate.toFixed(2)}% gives EMI{" "}
              <span className="font-medium">
                {formatINR(calculatedEmiAtContract)}
              </span>
              .
            </p>
          </div>

          {/* Rate gap callout — only when EMI implies a different rate */}
          {rateChanged && typeof emi === "number" && emi > 0 && (
            <div
              className={`rounded-lg border p-3 text-xs ${
                rateGap > 0
                  ? "border-warning/40 bg-warning/5"
                  : "border-positive/40 bg-positive/5"
              }`}
            >
              <p className="font-semibold text-foreground mb-1">
                Effective rate detected: {effectiveRate.toFixed(3)}%
              </p>
              <p className="text-muted-foreground">
                {rateGap > 0
                  ? `That's ${rateGap.toFixed(3)}% above your contract rate of ${loan.interestRate.toFixed(2)}% — bank's hidden margin from day-count + EMI rounding.`
                  : `That's ${Math.abs(rateGap).toFixed(3)}% below your contract rate.`}
              </p>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={updateRate}
                  onChange={(e) => setUpdateRate(e.target.checked)}
                  className="rounded"
                />
                <span className="text-foreground">
                  Update saved rate to {effectiveRate.toFixed(2)}% so all
                  forecasts match
                </span>
              </label>
            </div>
          )}

          {/* Error */}
          {refresh.error && (
            <p className="text-xs text-destructive">{refresh.error.message}</p>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-border bg-muted/30">
          <button
            type="button"
            onClick={onClose}
            disabled={refresh.isPending}
            className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-lg disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              refresh.isPending ||
              typeof outstanding !== "number" ||
              typeof emi !== "number"
            }
            className="px-4 py-2 text-sm font-semibold bg-primary hover:bg-primary/90 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {refresh.isPending ? "Updating..." : "Update loan"}
          </button>
        </div>
      </div>
    </div>
  );
}
