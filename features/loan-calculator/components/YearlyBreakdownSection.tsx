import React from "react";
import dynamic from "next/dynamic";
import { useLoanCalculator } from "../context/LoanCalculatorContext";

const YearlyBreakdownBar = dynamic(
  () => import("../charts/YearlyBreakdownBar").then((m) => ({ default: m.YearlyBreakdownBar })),
  { ssr: false, loading: () => <div className="w-full h-72 sm:h-96 bg-muted rounded-lg animate-pulse" /> }
);

export function YearlyBreakdownSection() {
  const { result } = useLoanCalculator();

  return (
    <section className="mt-6 sm:mt-8">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">
          Yearly Principal, Interest & Balance
        </h2>
      </div>
      <div className="w-full">
        <YearlyBreakdownBar schedule={result.schedule} />
      </div>
    </section>
  );
}
