"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import NumericInput from "@/components/ui/NumericInput";
import { CALC_INPUT_CLASS } from "@/components/calculators/shared";
import { useLoanCalculator } from "../context/LoanCalculatorContext";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  monthIndex: number;
  monthLabel: string;  // "Mar 2027"
  currentBalance: number;
}

export function PartPaymentModal({ open, onOpenChange, monthIndex, monthLabel, currentBalance }: Props) {
  const { partPayments, setPartPayments, reduceMode, setReduceMode, formatINR, result } = useLoanCalculator();
  const [amount, setAmount] = useState<number | "">(partPayments[monthIndex] || "");

  const quickAmounts = [100000, 200000, 500000, 1000000].filter(a => a <= currentBalance);

  // Simple impact estimate (percentage of balance removed)
  const impactEstimate = useMemo(() => {
    if (!amount || amount <= 0) return null;
    const savingsRatio = amount / currentBalance;
    // Rough estimate: interest saved ≈ amount × remaining months × monthly rate / 2
    return {
      percentReduced: (savingsRatio * 100).toFixed(1),
    };
  }, [amount, currentBalance]);

  const handleAdd = () => {
    if (!amount || amount <= 0) return;
    setPartPayments({ ...partPayments, [monthIndex]: amount });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Add part payment</DialogTitle>
          <DialogDescription>
            Applying to <span className="font-medium text-foreground">{monthLabel}</span>
            {" "}· Balance: {formatINR(currentBalance)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Amount input */}
          <div>
            <label className="text-sm text-foreground block mb-1.5">Amount (₹)</label>
            <NumericInput
              value={amount}
              onChange={setAmount}
              className={CALC_INPUT_CLASS}
              placeholder="e.g. 5,00,000"
              min={1}
              max={currentBalance}
            />
            {/* Quick amount buttons */}
            <div className="flex gap-2 mt-2 flex-wrap">
              {quickAmounts.map(amt => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt)}
                  className={cn(
                    "text-xs px-2 py-1 rounded border transition-colors",
                    amount === amt
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "border-border text-muted-foreground hover:bg-accent"
                  )}
                >
                  ₹{amt >= 100000 ? `${amt / 100000}L` : amt.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
          </div>

          {/* Impact preview */}
          {impactEstimate && amount && Number(amount) > 0 && (
            <div className="p-3 rounded-lg bg-positive/10 border border-positive/20">
              <p className="text-xs text-muted-foreground mb-1">If you add this:</p>
              <p className="text-sm text-foreground">
                Reduces balance by <span className="text-positive font-medium">{impactEstimate.percentReduced}%</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Exact savings will be computed when you confirm.
              </p>
            </div>
          )}

          {/* Reduce mode choice */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">After this payment:</p>
            <div className="flex gap-2">
              <button
                onClick={() => setReduceMode("tenure")}
                className={cn(
                  "flex-1 text-xs py-2 px-3 rounded-lg border text-left transition-colors",
                  reduceMode === "tenure"
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "border-border text-foreground hover:bg-accent"
                )}
              >
                <div className="font-medium">Reduce tenure</div>
                <div className="text-[10px] opacity-70 mt-0.5">Saves more interest</div>
              </button>
              <button
                onClick={() => setReduceMode("emi")}
                className={cn(
                  "flex-1 text-xs py-2 px-3 rounded-lg border text-left transition-colors",
                  reduceMode === "emi"
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "border-border text-foreground hover:bg-accent"
                )}
              >
                <div className="font-medium">Reduce EMI</div>
                <div className="text-[10px] opacity-70 mt-0.5">Lowers monthly outflow</div>
              </button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleAdd}
            disabled={!amount || Number(amount) <= 0}
            className="bg-primary text-primary-foreground"
          >
            Add to simulation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
