"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

import {
  LoanCalculatorProvider,
  useLoanCalculator,
  type LoanCalculatorInitial,
} from "./context/LoanCalculatorContext";
import { LoanInputForm } from "./components/LoanInputForm";
import { LoanSummary } from "./components/LoanSummary";

// Below-the-fold sections: defer to keep the initial mobile bundle small.
// Audit flagged 1.8s mobile JS execution; these dynamic boundaries are the
// biggest lever — the amortization table, modals, and PDF/Excel download
// machinery only matter after the user has seen their EMI.
const AmortizationSection = dynamic(
  () =>
    import("./components/AmortizationSection").then((m) => ({
      default: m.AmortizationSection,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-muted rounded-lg animate-pulse mt-6" />
    ),
  }
);

const DownloadButtons = dynamic(
  () =>
    import("./components/DownloadButtons").then((m) => ({
      default: m.DownloadButtons,
    })),
  { ssr: false, loading: () => null }
);

const YearlyBreakdownSection = dynamic(
  () =>
    import("./components/YearlyBreakdownSection").then((m) => ({
      default: m.YearlyBreakdownSection,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-72 sm:h-96 bg-muted rounded-lg animate-pulse mt-6" />
    ),
  }
);

/**
 * Reusable EMI calculator tool. Same engine that powers the homepage,
 * extracted so it can be embedded on contextual landing pages
 * (e.g. /home-loan-emi-calculator/50-lakh, /calculators/gold-loan-emi)
 * with their own initial state.
 *
 * Props:
 *   initial      — pre-fill loan type/amount/rate/tenure for this page
 *   lockType     — hide the loan-type tabs (set when the page already
 *                  fixes the loan type by its URL/content)
 *   showStickyBar — render the sticky "Save this calculation" bar.
 *                   On for the homepage; off for embedded usage to
 *                   avoid clashing with each page's own CTAs
 *   readUrlToken — accept ?s=<base64> share-link tokens. On for the
 *                  homepage (preserves the existing share UX); off
 *                  for embedded usage so a stale token from another
 *                  context doesn't override the page's defaults
 *
 * The tool renders ONLY its own content — no outer page chrome,
 * no marketing copy. The calling page is responsible for the rest
 * of the layout.
 */
interface LoanCalculatorToolProps {
  initial?: LoanCalculatorInitial;
  lockType?: boolean;
  showStickyBar?: boolean;
  readUrlToken?: boolean;
}

export function LoanCalculatorTool({
  initial,
  lockType = false,
  showStickyBar = false,
  readUrlToken = false,
}: LoanCalculatorToolProps) {
  return (
    <LoanCalculatorProvider
      initial={initial}
      lockType={lockType}
      readUrlToken={readUrlToken}
    >
      {/* Top flex: Inputs and Pie+Summary */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        <section className="flex-1 lg:flex-[2]">
          <LoanInputForm />
        </section>
        <section className="flex-1 lg:flex-[1]">
          <LoanSummary />
        </section>
      </div>

      {/* Amortization Table */}
      <div id="amortization-table">
        <AmortizationSection />
      </div>

      {/* Download Buttons */}
      <DownloadButtons />

      {/* Chart — below table and download buttons */}
      <YearlyBreakdownSection />

      {showStickyBar && <StickyBar />}
    </LoanCalculatorProvider>
  );
}

/**
 * Sticky "Save this calculation" bar. Used on the homepage where the
 * primary conversion goal is dashboard sign-up. Embedded usage on
 * landing pages typically passes showStickyBar={false} so the page's
 * own CTAs (e.g. "Save to dashboard" widgets) take precedence.
 */
function StickyBar() {
  const { result, formatINR, tenure, tenureUnit, startDate } =
    useLoanCalculator();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tenureMonths = tenureUnit === "years" ? tenure * 12 : tenure;
  const debtFreeDate = (() => {
    const start = startDate ? new Date(startDate + "-01") : new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + tenureMonths);
    return end.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  })();

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border py-3 px-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-4 text-sm">
        <div>
          <span className="text-muted-foreground text-xs">EMI</span>
          <span className="font-mono font-semibold ml-1 text-foreground">
            {formatINR(result.emi)}/mo
          </span>
        </div>
        <div className="hidden sm:block">
          <span className="text-muted-foreground text-xs">Debt-free by</span>
          <span className="font-semibold ml-1 text-positive">
            {debtFreeDate}
          </span>
        </div>
      </div>
      <a
        href="/login?ref=sticky&save=true"
        className="bg-primary text-white hover:bg-primary/90 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors flex-shrink-0"
      >
        Save this calculation
      </a>
    </div>
  );
}
