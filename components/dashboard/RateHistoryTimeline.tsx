"use client";

import { useState } from "react";
import { trpcReact } from "@/lib/trpc/hooks";
import { formatINR } from "@/lib/utils/formatters";
import NumericInput from "@/components/ui/NumericInput";

// Rate revision timeline. Critical for floating-rate loans which change
// every time RBI moves the repo rate. User logs each transition with
// effective date and what the bank adjusted (EMI vs tenure).

interface RateHistoryTimelineProps {
  loanId: string;
  /** Current rate on the loan — used as the default "old rate" for new revisions */
  currentRate: number;
  /** Current EMI — used as the "old EMI" reference */
  currentEmi: number;
  /** Current tenure — used as the "old tenure" reference */
  currentTenureMonths: number;
}

export function RateHistoryTimeline({
  loanId,
  currentRate,
  currentEmi,
  currentTenureMonths,
}: RateHistoryTimelineProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRate, setNewRate] = useState<number | "">("");
  const [effectiveDate, setEffectiveDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [adjusted, setAdjusted] = useState<"emi" | "tenure">("emi");
  const [newEmi, setNewEmi] = useState<number | "">("");
  const [newTenure, setNewTenure] = useState<number | "">("");
  const [note, setNote] = useState("");

  const utils = trpcReact.useUtils();
  const { data: history, isLoading } =
    trpcReact.loanRateHistory.listByLoan.useQuery({ loanId });
  const addRevision = trpcReact.loanRateHistory.add.useMutation({
    onSuccess: () => {
      utils.loanRateHistory.listByLoan.invalidate({ loanId });
      utils.loans.getAll.invalidate();
      utils.loans.getById.invalidate({ id: loanId });
      // Reset form
      setShowAddForm(false);
      setNewRate("");
      setNewEmi("");
      setNewTenure("");
      setNote("");
    },
  });
  const deleteRevision = trpcReact.loanRateHistory.delete.useMutation({
    onSuccess: () => {
      utils.loanRateHistory.listByLoan.invalidate({ loanId });
    },
  });

  const handleSubmit = () => {
    if (typeof newRate !== "number") return;
    addRevision.mutate({
      loanId,
      oldRate: currentRate,
      newRate,
      effectiveDate,
      adjusted,
      newEmi:
        adjusted === "emi" && typeof newEmi === "number" ? newEmi : undefined,
      newTenureMonths:
        adjusted === "tenure" && typeof newTenure === "number"
          ? newTenure
          : undefined,
      note: note.trim(),
    });
  };

  return (
    <section className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Rate revision history
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Floating loans change every time RBI moves the repo rate. Log each
            revision so projections stay honest.
          </p>
        </div>
        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="text-xs font-semibold text-primary hover:text-primary/80 whitespace-nowrap"
          >
            + Add revision
          </button>
        )}
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="bg-muted/50 rounded-lg p-3 mb-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Old rate (%)
              </label>
              <input
                type="text"
                disabled
                value={currentRate.toFixed(2)}
                className="w-full rounded-lg border border-border bg-muted px-2 py-1.5 text-sm text-muted-foreground"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                New rate (%) *
              </label>
              <NumericInput
                value={newRate}
                onChange={setNewRate}
                placeholder="e.g. 8.75"
                min={0}
                max={50}
                step={0.05}
                className="w-full rounded-lg border border-border bg-card px-2 py-1.5 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Effective from
            </label>
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-2 py-1.5 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              What did the bank adjust?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjusted("emi")}
                className={`text-xs px-3 py-2 rounded-lg border ${
                  adjusted === "emi"
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                EMI changed
                <span className="block text-[10px] font-normal opacity-80">
                  (tenure same)
                </span>
              </button>
              <button
                type="button"
                onClick={() => setAdjusted("tenure")}
                className={`text-xs px-3 py-2 rounded-lg border ${
                  adjusted === "tenure"
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                Tenure changed
                <span className="block text-[10px] font-normal opacity-80">
                  (EMI same)
                </span>
              </button>
            </div>
          </div>

          {adjusted === "emi" && (
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                New EMI (₹) <span className="text-muted-foreground font-normal">— from your bank app</span>
              </label>
              <NumericInput
                value={newEmi}
                onChange={setNewEmi}
                placeholder={`Currently ${formatINR(currentEmi)}`}
                min={0}
                className="w-full rounded-lg border border-border bg-card px-2 py-1.5 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none"
              />
            </div>
          )}

          {adjusted === "tenure" && (
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                New tenure (months) <span className="text-muted-foreground font-normal">— remaining months</span>
              </label>
              <NumericInput
                value={newTenure}
                onChange={setNewTenure}
                placeholder={`Currently ${currentTenureMonths} months`}
                min={1}
                max={500}
                step={1}
                className="w-full rounded-lg border border-border bg-card px-2 py-1.5 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Note <span className="text-muted-foreground font-normal">— optional</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. RBI repo rate cut"
              maxLength={200}
              className="w-full rounded-lg border border-border bg-card px-2 py-1.5 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none"
            />
          </div>

          {addRevision.error && (
            <p className="text-xs text-destructive">{addRevision.error.message}</p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              disabled={addRevision.isPending}
              className="text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={addRevision.isPending || typeof newRate !== "number"}
              className="text-xs font-semibold bg-primary hover:bg-primary/90 text-white rounded-lg px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addRevision.isPending ? "Saving..." : "Log revision"}
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      {isLoading ? (
        <div className="text-xs text-muted-foreground">Loading...</div>
      ) : !history || history.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">
          No revisions logged yet. RBI moves the repo rate roughly every 2 months —
          your bank usually follows within 1–2 cycles. Log changes here to keep
          your forecasts accurate.
        </p>
      ) : (
        <ol className="space-y-2">
          {history.map((rev) => {
            const direction = rev.newRate > rev.oldRate ? "up" : "down";
            return (
              <li
                key={rev.id}
                className="flex items-start gap-3 text-xs bg-muted/30 rounded-lg p-2.5"
              >
                <div
                  className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold ${
                    direction === "up"
                      ? "bg-warning/20 text-warning"
                      : "bg-positive/20 text-positive"
                  }`}
                >
                  {direction === "up" ? "↑" : "↓"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">
                    {rev.oldRate.toFixed(2)}% → {rev.newRate.toFixed(2)}%
                  </p>
                  <p className="text-muted-foreground">
                    Effective{" "}
                    {new Date(rev.effectiveDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    ·{" "}
                    {rev.adjusted === "emi"
                      ? `EMI changed to ${rev.newEmi ? formatINR(rev.newEmi) : "—"}`
                      : rev.adjusted === "tenure"
                      ? `Tenure changed to ${rev.newTenureMonths ?? "—"} months`
                      : "Both EMI and tenure changed"}
                  </p>
                  {rev.note && (
                    <p className="text-muted-foreground mt-0.5 italic">
                      {rev.note}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Delete this rate revision?")) {
                      deleteRevision.mutate({ id: rev.id });
                    }
                  }}
                  className="flex-shrink-0 text-muted-foreground hover:text-destructive p-1"
                  aria-label="Delete revision"
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
