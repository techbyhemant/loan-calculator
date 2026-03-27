"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import NumericInput from "@/components/ui/NumericInput";
import { CALC_INPUT_CLASS, CalcSection, Label } from "./shared";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────

type InputMode = "original" | "current";

export interface LoanSnapshot {
  /** Current outstanding balance */
  outstanding: number;
  /** Annual interest rate (percentage, e.g. 8.5) */
  ratePA: number;
  /** Remaining months from now */
  remainingMonths: number;
  /** Current monthly EMI */
  emi: number;
  /** EMI start month (YYYY-MM) — for calendar date display */
  startMonth: string;
  /** Original loan amount (if known) */
  originalAmount?: number;
  /** Original tenure in months (if known) */
  originalTenure?: number;
  /** Months already paid */
  monthsElapsed?: number;
}

interface LoanInputModeProps {
  /** Title for the section card */
  title?: string;
  /** Callback fired whenever inputs change and produce a valid snapshot */
  onChange: (snapshot: LoanSnapshot) => void;
  /** Default values */
  defaults?: {
    amount?: number;
    rate?: number;
    tenureMonths?: number;
    outstanding?: number;
    emi?: number;
    remainingMonths?: number;
  };
  /** Loan type hint text (e.g. "Typical: 8.5-14% for car loans") */
  rateHint?: string;
  /** Whether to show the start month input */
  showStartMonth?: boolean;
}

// ─── EMI Calculation ────────────────────────────────────────────

function computeEMI(principal: number, ratePA: number, months: number): number {
  if (months <= 0 || principal <= 0) return 0;
  if (ratePA === 0) return principal / months;
  const r = ratePA / 100 / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

function computeOutstanding(
  principal: number,
  ratePA: number,
  tenureMonths: number,
  monthsElapsed: number
): number {
  if (monthsElapsed <= 0) return principal;
  const r = ratePA / 100 / 12;
  if (r === 0) return principal * (1 - monthsElapsed / tenureMonths);
  const emi = computeEMI(principal, ratePA, tenureMonths);
  let balance = principal;
  for (let m = 0; m < monthsElapsed && balance > 0; m++) {
    const interest = balance * r;
    balance = Math.max(0, balance - (emi - interest));
  }
  return balance;
}

// ─── Component ──────────────────────────────────────────────────

export function LoanInputMode({
  title = "Your Loan",
  onChange,
  defaults,
  rateHint,
  showStartMonth = true,
}: LoanInputModeProps) {
  const [mode, setMode] = useState<InputMode>("current");

  // Mode: "original" — user knows original loan details
  const [origAmount, setOrigAmount] = useState<number | "">(defaults?.amount ?? "");
  const [origTenure, setOrigTenure] = useState<number | "">(defaults?.tenureMonths ?? "");
  const [origRate, setOrigRate] = useState<number | "">(defaults?.rate ?? 8.5);
  const [monthsElapsed, setMonthsElapsed] = useState<number | "">(0);

  // Mode: "current" — user knows current balance
  const [curOutstanding, setCurOutstanding] = useState<number | "">(defaults?.outstanding ?? "");
  const [curRate, setCurRate] = useState<number | "">(defaults?.rate ?? 8.5);
  const [curRemaining, setCurRemaining] = useState<number | "">(defaults?.remainingMonths ?? "");
  const [curEMI, setCurEMI] = useState<number | "">(defaults?.emi ?? "");

  // Shared
  const [startMonth, setStartMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  // ─── Compute snapshot from "original" mode ──────────────────
  const originalSnapshot = useMemo<LoanSnapshot | null>(() => {
    if (mode !== "original") return null;
    if (!origAmount || !origRate || !origTenure) return null;

    const elapsed = (monthsElapsed as number) || 0;
    const remaining = Math.max(1, (origTenure as number) - elapsed);
    const emi = computeEMI(origAmount as number, origRate as number, origTenure as number);
    const outstanding = computeOutstanding(
      origAmount as number,
      origRate as number,
      origTenure as number,
      elapsed
    );

    return {
      outstanding: Math.round(outstanding),
      ratePA: origRate as number,
      remainingMonths: remaining,
      emi: Math.round(emi),
      startMonth,
      originalAmount: origAmount as number,
      originalTenure: origTenure as number,
      monthsElapsed: elapsed,
    };
  }, [mode, origAmount, origRate, origTenure, monthsElapsed, startMonth]);

  // ─── Compute snapshot from "current" mode ───────────────────
  const currentSnapshot = useMemo<LoanSnapshot | null>(() => {
    if (mode !== "current") return null;
    if (!curOutstanding || !curRate || !curRemaining) return null;

    // If user didn't provide EMI, compute it from outstanding + remaining + rate
    const emi = curEMI
      ? (curEMI as number)
      : Math.round(computeEMI(curOutstanding as number, curRate as number, curRemaining as number));

    return {
      outstanding: curOutstanding as number,
      ratePA: curRate as number,
      remainingMonths: curRemaining as number,
      emi,
      startMonth,
    };
  }, [mode, curOutstanding, curRate, curRemaining, curEMI, startMonth]);

  // ─── Fire onChange when snapshot changes ─────────────────────
  const snapshot = mode === "original" ? originalSnapshot : currentSnapshot;

  const stableOnChange = useCallback(onChange, [onChange]);

  useEffect(() => {
    if (snapshot) stableOnChange(snapshot);
  }, [snapshot, stableOnChange]);

  // ─── Computed display values ────────────────────────────────
  const computedEMI = useMemo(() => {
    if (mode === "original" && origAmount && origRate && origTenure) {
      return Math.round(computeEMI(origAmount as number, origRate as number, origTenure as number));
    }
    if (mode === "current" && curOutstanding && curRate && curRemaining && !curEMI) {
      return Math.round(computeEMI(curOutstanding as number, curRate as number, curRemaining as number));
    }
    return null;
  }, [mode, origAmount, origRate, origTenure, curOutstanding, curRate, curRemaining, curEMI]);

  const computedOutstanding = useMemo(() => {
    if (mode === "original" && origAmount && origRate && origTenure) {
      const elapsed = (monthsElapsed as number) || 0;
      return Math.round(
        computeOutstanding(origAmount as number, origRate as number, origTenure as number, elapsed)
      );
    }
    return null;
  }, [mode, origAmount, origRate, origTenure, monthsElapsed]);

  return (
    <CalcSection title={title}>
      {/* Mode toggle */}
      <div className="flex rounded-lg border border-border bg-muted p-0.5 gap-0.5 mb-4">
        <button
          type="button"
          onClick={() => setMode("current")}
          className={cn(
            "flex-1 text-sm px-3 py-1.5 rounded-md transition-colors",
            mode === "current"
              ? "bg-primary text-primary-foreground font-medium shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          I know my current balance
        </button>
        <button
          type="button"
          onClick={() => setMode("original")}
          className={cn(
            "flex-1 text-sm px-3 py-1.5 rounded-md transition-colors",
            mode === "original"
              ? "bg-primary text-primary-foreground font-medium shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          I know my original loan
        </button>
      </div>

      {/* ─── Mode: Current Balance ─────────────────────────────── */}
      {mode === "current" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Outstanding Balance (₹)</Label>
            <NumericInput
              value={curOutstanding}
              onChange={setCurOutstanding}
              placeholder="e.g. 25,00,000"
              min={1}
              className={CALC_INPUT_CLASS}
            />
          </div>
          <div>
            <Label>Interest Rate (% p.a.)</Label>
            <NumericInput
              value={curRate}
              onChange={setCurRate}
              placeholder="8.5"
              min={0.1}
              max={50}
              step={0.1}
              className={CALC_INPUT_CLASS}
            />
            {rateHint && <p className="text-xs text-muted-foreground mt-1">{rateHint}</p>}
          </div>
          <div>
            <Label>Remaining Tenure (months)</Label>
            <NumericInput
              value={curRemaining}
              onChange={setCurRemaining}
              placeholder="180"
              min={1}
              max={360}
              className={CALC_INPUT_CLASS}
            />
          </div>
          <div>
            <Label>Current EMI (₹) <span className="text-muted-foreground font-normal">— optional</span></Label>
            <NumericInput
              value={curEMI}
              onChange={setCurEMI}
              placeholder={computedEMI ? String(computedEMI) : "auto-computed"}
              min={0}
              className={CALC_INPUT_CLASS}
            />
            {!curEMI && computedEMI && computedEMI > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Computed: <span className="font-mono font-medium text-foreground">₹{computedEMI.toLocaleString("en-IN")}</span>
              </p>
            )}
          </div>
          {showStartMonth && (
            <div>
              <Label>Next EMI Month</Label>
              <input
                type="month"
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
                className={cn(CALC_INPUT_CLASS, "h-9")}
              />
            </div>
          )}
        </div>
      )}

      {/* ─── Mode: Original Loan ───────────────────────────────── */}
      {mode === "original" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Original Loan Amount (₹)</Label>
              <NumericInput
                value={origAmount}
                onChange={setOrigAmount}
                placeholder="e.g. 50,00,000"
                min={1}
                className={CALC_INPUT_CLASS}
              />
            </div>
            <div>
              <Label>Interest Rate (% p.a.)</Label>
              <NumericInput
                value={origRate}
                onChange={setOrigRate}
                placeholder="8.5"
                min={0.1}
                max={50}
                step={0.1}
                className={CALC_INPUT_CLASS}
              />
              {rateHint && <p className="text-xs text-muted-foreground mt-1">{rateHint}</p>}
            </div>
            <div>
              <Label>Original Tenure (months)</Label>
              <NumericInput
                value={origTenure}
                onChange={setOrigTenure}
                placeholder="240"
                min={1}
                max={360}
                className={CALC_INPUT_CLASS}
              />
            </div>
            <div>
              <Label>EMIs Already Paid</Label>
              <NumericInput
                value={monthsElapsed}
                onChange={setMonthsElapsed}
                placeholder="0"
                min={0}
                max={origTenure || 360}
                className={CALC_INPUT_CLASS}
              />
            </div>
            {showStartMonth && (
              <div>
                <Label>Next EMI Month</Label>
                <input
                  type="month"
                  value={startMonth}
                  onChange={(e) => setStartMonth(e.target.value)}
                  className={cn(CALC_INPUT_CLASS, "h-9")}
                />
              </div>
            )}
          </div>

          {/* Show computed values */}
          {computedOutstanding !== null && computedEMI !== null && (
            <div className="mt-4 p-3 rounded-lg bg-muted text-sm grid grid-cols-2 gap-3">
              <div>
                <span className="text-muted-foreground">Current outstanding: </span>
                <span className="font-semibold text-foreground font-mono">
                  ₹{computedOutstanding.toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Monthly EMI: </span>
                <span className="font-semibold text-foreground font-mono">
                  ₹{computedEMI.toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Remaining: </span>
                <span className="font-medium text-foreground">
                  {Math.max(1, (origTenure as number || 0) - ((monthsElapsed as number) || 0))} months
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Already paid: </span>
                <span className="font-medium text-foreground">
                  {(monthsElapsed as number) || 0} months
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </CalcSection>
  );
}
