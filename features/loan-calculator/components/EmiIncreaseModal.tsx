"use client";

import { useState } from "react";
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
  monthLabel: string;
}

export function EmiIncreaseModal({ open, onOpenChange, monthIndex, monthLabel }: Props) {
  const { result, emiIncreases, setEmiIncreases, formatINR } = useLoanCalculator();
  const currentEMI = Math.round(result.emi);
  const existing = emiIncreases[monthIndex];
  const [newEMI, setNewEMI] = useState<number | "">(
    existing ? (existing.type === "value" ? existing.value : currentEMI * (1 + existing.value / 100)) : ""
  );

  const quickIncrements = [5000, 10000, 15000, 20000];

  const handleAdd = () => {
    if (!newEMI || Number(newEMI) <= currentEMI) return;
    setEmiIncreases({
      ...emiIncreases,
      [monthIndex]: { type: "value", value: Number(newEMI) },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Increase EMI from {monthLabel}</DialogTitle>
          <DialogDescription>
            Current EMI: {formatINR(currentEMI)}/month. Change applies from {monthLabel} onwards.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-foreground block mb-1.5">New monthly EMI (₹)</label>
            <NumericInput
              value={newEMI}
              onChange={setNewEMI}
              className={CALC_INPUT_CLASS}
              placeholder={String(currentEMI)}
              min={currentEMI + 1}
            />
            {newEMI && Number(newEMI) > currentEMI && (
              <p className="text-xs text-muted-foreground mt-1">
                Increase: +{formatINR(Number(newEMI) - currentEMI)}/mo
              </p>
            )}
            <div className="flex gap-2 mt-2 flex-wrap">
              {quickIncrements.map(inc => (
                <button
                  key={inc}
                  onClick={() => setNewEMI(currentEMI + inc)}
                  className={cn(
                    "text-xs px-2 py-1 rounded border transition-colors",
                    newEMI === currentEMI + inc
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "border-border text-muted-foreground hover:bg-accent"
                  )}
                >
                  +₹{inc >= 1000 ? `${inc / 1000}K` : inc}
                </button>
              ))}
            </div>
          </div>

          {newEMI && Number(newEMI) > currentEMI && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">
                Paying {formatINR(Number(newEMI) - currentEMI)} extra/mo from {monthLabel}:
              </p>
              <p className="text-sm text-foreground">
                This will accelerate your loan payoff. Exact savings computed on confirm.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleAdd}
            disabled={!newEMI || Number(newEMI) <= currentEMI}
            className="bg-primary text-primary-foreground"
          >
            Add to simulation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
