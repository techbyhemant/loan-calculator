import React from "react";
import { LoanCalculatorProvider } from "./context/LoanCalculatorContext";
import { LoanInputForm } from "./components/LoanInputForm";
import { LoanSummary } from "./components/LoanSummary";
import { AmortizationSection } from "./components/AmortizationSection";
import { DownloadButtons } from "./components/DownloadButtons";
import { YearlyBreakdownSection } from "./components/YearlyBreakdownSection";
import { Header } from "@/components/ui/Header";

export default function LoanCalculator() {
  return (
    <LoanCalculatorProvider>
      <div className="bg-[#F9FAFB] min-h-screen font-inter">
        <Header />
        <main className="max-w-6xl w-auto mx-auto py-4 sm:py-6 px-3 sm:px-4">
          {/* Top flex: Inputs and Pie+Summary - stack vertically on mobile */}
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            {/* Modern Loan Input Card: full width on mobile, 2/3 on desktop */}
            <section className="flex-1 lg:flex-[2]">
              <LoanInputForm />
            </section>

            {/* Pie chart and summary cards: stack vertically on mobile, 1/3 on desktop */}
            <section className="flex-1 lg:flex-[1]">
              <LoanSummary />
            </section>
          </div>

          {/* Amortization Table: full width below */}
          <AmortizationSection />

          {/* Download Buttons Toolbar: below table, centered */}
          <DownloadButtons />

          {/* Yearly Breakdown Chart (full width below) */}
          <YearlyBreakdownSection />
        </main>
      </div>
    </LoanCalculatorProvider>
  );
}
