import React from "react";
import { YearlyBreakdownBar } from "../charts/YearlyBreakdownBar";
import { useLoanCalculator } from "../context/LoanCalculatorContext";

export function YearlyBreakdownSection() {
  const { result } = useLoanCalculator();

  return (
    <section className="mt-6 sm:mt-8">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">
          Yearly Principal, Interest & Balance
        </h2>
      </div>
      <div className="w-full">
        <YearlyBreakdownBar schedule={result.schedule} />
      </div>
    </section>
  );
}
