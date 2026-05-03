"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, Sparkles } from "lucide-react";

import {
  simulateLoanWithScenarios,
  type SimulationScenario,
} from "@/lib/calculations/simulateLoan";
import { formatINR, formatLakhs, formatDate } from "@/lib/utils/formatters";
import NumericInput from "@/components/ui/NumericInput";

interface Props {
  outstanding: number;
  interestRate: number;
  emi: number;
  // Optional callback: parent (loan detail page) can open the real
  // PartPaymentLogger pre-filled with the largest scenario amount, so
  // users can convert a successful what-if into a real entry in one click.
  onApplyAsRealPartPayment?: (amount: number) => void;
}

const DEFAULT_RECURRING: SimulationScenario = {
  id: "default-recurring",
  type: "recurring",
  amount: 5000,
  startMonth: 1,
};

export function LoanSimulator({
  outstanding,
  interestRate,
  emi,
  onApplyAsRealPartPayment,
}: Props) {
  const [open, setOpen] = useState(false);
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([
    DEFAULT_RECURRING,
  ]);

  const result = useMemo(
    () =>
      simulateLoanWithScenarios(outstanding, interestRate, emi, scenarios),
    [outstanding, interestRate, emi, scenarios],
  );

  const addScenario = (type: SimulationScenario["type"]) => {
    setScenarios((prev) => [
      ...prev,
      {
        id: `${type}-${Date.now()}`,
        type,
        amount: type === "recurring" ? 5000 : 50000,
        startMonth: type === "recurring" ? 1 : 6,
      },
    ]);
  };

  const updateScenario = (id: string, patch: Partial<SimulationScenario>) => {
    setScenarios((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    );
  };

  const removeScenario = (id: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  };

  const reset = () => setScenarios([DEFAULT_RECURRING]);

  const hasImpact = result.interestSaved > 0 || result.monthsSaved > 0;
  const largestRecurring = scenarios
    .filter((s) => s.type === "recurring" && s.amount > 0)
    .reduce((max, s) => Math.max(max, s.amount), 0);

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 text-left hover:bg-muted/50 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Simulate &mdash; what if?
            </h3>
            <p className="text-xs text-muted-foreground">
              Try extra payments without committing them
            </p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          {open ? "Hide" : "Open"}
        </span>
      </button>

      {open && (
        <div className="border-t border-border p-4 sm:p-5 space-y-4">
          {/* Scenario controls */}
          <div className="space-y-2.5">
            {scenarios.map((s) => (
              <ScenarioRow
                key={s.id}
                scenario={s}
                onChange={(patch) => updateScenario(s.id, patch)}
                onRemove={
                  scenarios.length > 1
                    ? () => removeScenario(s.id)
                    : undefined
                }
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => addScenario("recurring")}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
            >
              <Plus className="w-3 h-3" /> Recurring extra
            </button>
            <button
              onClick={() => addScenario("lumpSum")}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
            >
              <Plus className="w-3 h-3" /> One-time lump-sum
            </button>
            <button
              onClick={reset}
              className="text-xs font-medium px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Result strip */}
          <div
            className={`rounded-lg border p-4 ${
              hasImpact
                ? "bg-positive/5 border-positive/20"
                : "bg-muted border-border"
            }`}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <p className="text-[11px] text-muted-foreground">Without</p>
                <p className="text-sm font-semibold text-foreground">
                  {formatDate(result.baseline.debtFreeDate)}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {formatLakhs(result.baseline.totalInterest)} interest
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">With this plan</p>
                <p
                  className={`text-sm font-semibold ${hasImpact ? "text-positive" : "text-foreground"}`}
                >
                  {formatDate(result.simulated.debtFreeDate)}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {formatLakhs(result.simulated.totalInterest)} interest
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-[11px] text-muted-foreground">You save</p>
                <p
                  className={`text-base font-bold ${hasImpact ? "text-positive" : "text-muted-foreground"}`}
                >
                  {formatLakhs(result.interestSaved)}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {result.monthsSaved} months earlier
                </p>
              </div>
            </div>

            {hasImpact &&
              onApplyAsRealPartPayment &&
              largestRecurring > 0 && (
                <div className="mt-3 pt-3 border-t border-positive/20 flex flex-wrap items-center gap-2 justify-between">
                  <p className="text-[11px] text-muted-foreground">
                    Like this plan? Log it as a real part-payment.
                  </p>
                  <button
                    onClick={() => onApplyAsRealPartPayment(largestRecurring)}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Apply {formatINR(largestRecurring)} now &rarr;
                  </button>
                </div>
              )}
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            These are predictions only. Nothing is logged to your loan until
            you record a real part-payment.
          </p>
        </div>
      )}
    </div>
  );
}

function ScenarioRow({
  scenario,
  onChange,
  onRemove,
}: {
  scenario: SimulationScenario;
  onChange: (patch: Partial<SimulationScenario>) => void;
  onRemove?: () => void;
}) {
  const isRecurring = scenario.type === "recurring";
  return (
    <div className="flex flex-wrap items-center gap-2 bg-muted/40 border border-border rounded-lg p-2.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground px-1.5 py-0.5 rounded bg-background">
        {isRecurring ? "Every month" : "One-time"}
      </span>
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">₹</span>
        <NumericInput
          value={scenario.amount}
          onChange={(v) => onChange({ amount: typeof v === "number" ? v : 0 })}
          placeholder="0"
          min={0}
          className="w-24 rounded-md border border-border bg-card px-2 py-1 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none"
        />
      </div>
      <span className="text-xs text-muted-foreground">
        {isRecurring ? "starting" : "in"}
      </span>
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">month</span>
        <input
          type="number"
          min={1}
          max={600}
          value={scenario.startMonth}
          onChange={(e) =>
            onChange({ startMonth: Math.max(1, Number(e.target.value) || 1) })
          }
          className="w-16 rounded-md border border-border bg-card px-2 py-1 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none"
        />
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-auto p-1.5 text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Remove scenario"
          title="Remove"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
