"use client";

import { useState } from "react";
import { calculateEffectiveRate } from "@/lib/calculations/loanCalcs";
import { formatINR } from "@/lib/utils/formatters";
import NumericInput from "@/components/ui/NumericInput";

// EMI / Bank Statement Verifier — surfaces the hidden bank spread AND lets
// the user anchor LastEMI's projections to their bank statement's
// ground-truth numbers (actual EMI, actual current outstanding).
//
// When a user enters their actual EMI from a loan statement, we back-solve
// the effective rate. If it differs from the contract rate they entered,
// we show the gap explicitly: "Your contract says 11.80% but you're
// actually paying 11.83%. Bank's hidden margin: ₹2,640 over loan life."
//
// In the same callout, an optional "current outstanding" field lets the
// user paste the exact balance from their statement — that becomes the
// anchor for LastEMI's forward projections, eliminating the residual
// gap from broken-period interest, day-count differences, etc.
//
// This is the kind of disclosure no other Indian loan app does. ICICI/HDFC
// quietly charge 0.03–0.06% over the headline rate via 30/360 day-count
// and EMI rounding; borrowers never notice. LastEMI surfaces it.

interface EmiVerifierProps {
  /** Original principal in rupees */
  principal: number;
  /** Tenure in months */
  tenureMonths: number;
  /** The headline / contract rate the user entered (annual %, e.g. 11.80) */
  contractRate: number;
  /** What LastEMI calculates the EMI should be at the contract rate */
  calculatedEmi: number;
  /** What the user typed in as their actual EMI from the bank statement */
  actualEmi: number;
  /** Called when user clicks "Use effective rate" — parent should update the rate field */
  onUseEffectiveRate: (effectiveRate: number) => void;
  /** Called when user clicks "Use bank's outstanding" — parent should override its computed outstanding */
  onUseActualOutstanding?: (outstanding: number) => void;
  /** What LastEMI auto-computed for current outstanding (so we can show the comparison) */
  computedOutstanding?: number;
}

// Threshold for treating the gap as material — under this we just say
// "matches your bank." Banks usually differ by ~₹20–₹100 due to rounding.
const TRIVIAL_DIFFERENCE_RUPEES = 5;

export function EmiVerifier({
  principal,
  tenureMonths,
  contractRate,
  calculatedEmi,
  actualEmi,
  onUseEffectiveRate,
  onUseActualOutstanding,
  computedOutstanding,
}: EmiVerifierProps) {
  const [bankOutstanding, setBankOutstanding] = useState<number | "">("");

  if (!actualEmi || !calculatedEmi || !principal || !tenureMonths) return null;

  const diff = actualEmi - calculatedEmi;
  const absDiff = Math.abs(diff);

  // Match — no callout needed
  if (absDiff <= TRIVIAL_DIFFERENCE_RUPEES) {
    return (
      <div className="rounded-lg border border-positive/30 bg-positive/5 p-3 text-xs text-foreground">
        <p className="font-semibold text-positive mb-0.5">✓ EMI matches your contract rate</p>
        <p className="text-muted-foreground">
          The math at {contractRate.toFixed(2)}% gives ₹{calculatedEmi.toFixed(0)}, which
          matches what you entered. No hidden spread detected.
        </p>
      </div>
    );
  }

  // Gap detected — back-solve and explain
  const effectiveRate = calculateEffectiveRate(principal, actualEmi, tenureMonths);
  const rateGap = effectiveRate - contractRate;
  const totalContract = calculatedEmi * tenureMonths;
  const totalActual = actualEmi * tenureMonths;
  const lifetimeExtra = totalActual - totalContract;

  // Bank charges MORE than math (typical — hidden spread)
  if (diff > 0) {
    return (
      <div className="rounded-lg border border-warning/40 bg-warning/5 p-4 text-sm">
        <p className="font-semibold text-warning mb-2">
          Your bank is charging ₹{Math.round(diff).toLocaleString("en-IN")}/month more
          than the contract rate implies
        </p>
        <div className="space-y-1 text-xs text-foreground">
          <p>
            • Contract says: <strong>{contractRate.toFixed(2)}%</strong> →
            EMI should be <strong>₹{calculatedEmi.toFixed(0)}</strong>
          </p>
          <p>
            • Bank actually charges: <strong>₹{actualEmi.toFixed(0)}</strong> →
            effective rate is <strong>{effectiveRate.toFixed(3)}%</strong>
          </p>
          <p>
            • Hidden margin:{" "}
            <strong className="text-warning">
              +{rateGap.toFixed(3)}% per year
            </strong>
            , adding{" "}
            <strong className="text-warning">
              {formatINR(lifetimeExtra)} over the loan life
            </strong>
          </p>
        </div>
        <details className="mt-3 text-xs text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground">
            Why does this happen?
          </summary>
          <div className="mt-2 space-y-1 leading-relaxed">
            <p>
              Indian banks use a <strong>30/360 day-count convention</strong>: they
              treat every month as 30 days and the year as 360 days, even though a
              year is 365.25 days. They also round EMIs up to the nearest ₹25 or ₹50.
              These two practices add 0.03–0.06% to the effective rate compared to
              what the headline rate suggests. It&apos;s standard across all Indian
              lenders (HDFC, ICICI, SBI, Axis, NBFCs) and disclosed in fine print.
            </p>
            <p>
              <strong>What to do:</strong> click below to update the rate to{" "}
              {effectiveRate.toFixed(2)}% — this makes LastEMI&apos;s forecasts
              match what your bank actually charges.
            </p>
          </div>
        </details>
        <button
          type="button"
          onClick={() => onUseEffectiveRate(Number(effectiveRate.toFixed(3)))}
          className="mt-3 inline-flex items-center gap-1.5 bg-warning hover:bg-warning/90 text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
        >
          Update rate to {effectiveRate.toFixed(2)}% →
        </button>

        {/* Optional: anchor outstanding to bank statement value */}
        {onUseActualOutstanding && (
          <div className="mt-4 pt-4 border-t border-warning/30">
            <p className="text-xs font-semibold text-foreground mb-1">
              Got your bank statement open? Lock in the exact outstanding too.
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              Even after the rate fix, our amortization may still differ from
              your bank by a few hundred rupees due to broken-period interest
              and small day-count quirks. Pasting the bank&apos;s number here
              makes future projections match exactly.
              {computedOutstanding ? (
                <>
                  {" "}LastEMI currently shows{" "}
                  <strong>₹{Number(computedOutstanding).toLocaleString("en-IN")}</strong>.
                </>
              ) : null}
            </p>
            <div className="flex gap-2">
              <NumericInput
                value={bankOutstanding}
                onChange={setBankOutstanding}
                placeholder="₹ from bank statement"
                min={0}
                className="flex-1 rounded-lg border border-warning/40 bg-card px-3 py-1.5 text-sm text-foreground focus:border-warning focus:ring-1 focus:ring-warning outline-none"
              />
              <button
                type="button"
                disabled={!bankOutstanding}
                onClick={() => {
                  if (bankOutstanding && typeof bankOutstanding === "number") {
                    onUseActualOutstanding(bankOutstanding);
                  }
                }}
                className="bg-warning hover:bg-warning/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap"
              >
                Use this →
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Bank charges LESS than math (rare — bank is giving the user a deal)
  return (
    <div className="rounded-lg border border-positive/40 bg-positive/5 p-4 text-sm">
      <p className="font-semibold text-positive mb-2">
        Your bank is charging less than the contract rate implies
      </p>
      <div className="space-y-1 text-xs text-foreground">
        <p>
          • Contract: {contractRate.toFixed(2)}% → expected EMI ₹{calculatedEmi.toFixed(0)}
        </p>
        <p>
          • Actual EMI: ₹{actualEmi.toFixed(0)} → effective rate{" "}
          <strong>{effectiveRate.toFixed(3)}%</strong>
        </p>
        <p>
          • Saving: {Math.abs(rateGap).toFixed(3)}% per year (
          {formatINR(Math.abs(lifetimeExtra))} over loan life)
        </p>
      </div>
      <button
        type="button"
        onClick={() => onUseEffectiveRate(Number(effectiveRate.toFixed(3)))}
        className="mt-3 inline-flex items-center gap-1.5 bg-positive hover:bg-positive/90 text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
      >
        Update rate to {effectiveRate.toFixed(2)}% →
      </button>
    </div>
  );
}
