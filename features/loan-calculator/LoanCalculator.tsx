"use client";

import { useState, useEffect } from "react";
import { LoanCalculatorProvider, useLoanCalculator } from "./context/LoanCalculatorContext";
import { LoanInputForm } from "./components/LoanInputForm";
import { LoanSummary } from "./components/LoanSummary";
import { AmortizationSection } from "./components/AmortizationSection";
import { DownloadButtons } from "./components/DownloadButtons";
import { ShieldCheck, Ruler, Target } from "lucide-react";
import dynamic from "next/dynamic";

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

function StickyBar() {
  const { result, formatINR, tenure, tenureUnit, startDate } = useLoanCalculator();
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
          <span className="font-mono font-semibold ml-1 text-foreground">{formatINR(result.emi)}/mo</span>
        </div>
        <div className="hidden sm:block">
          <span className="text-muted-foreground text-xs">Debt-free by</span>
          <span className="font-semibold ml-1 text-positive">{debtFreeDate}</span>
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

export default function LoanCalculator() {
  return (
    <LoanCalculatorProvider>
      <div className="bg-background min-h-screen font-inter">
        <main className="max-w-6xl w-auto mx-auto py-4 sm:py-6 px-3 sm:px-4">
          {/* Simulator identity badge */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Loan simulator — plan part payments and EMI changes on your actual calendar
            </div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight leading-snug">
              EMI Calculator — Simulate Part Payments,{" "}
              <span className="text-primary">Find Your Debt-Free Date</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1.5">
              Home loan, personal loan, car loan. Add part payments to any specific month
              and see exactly how much interest you save. Free — no phone number required.
            </p>
          </div>

          {/* Top flex: Inputs and Pie+Summary */}
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            <section className="flex-1 lg:flex-[2]">
              <LoanInputForm />
            </section>
            <section className="flex-1 lg:flex-[1]">
              <LoanSummary />
            </section>
          </div>

          {/* Amortization Table — visible, NOT collapsed */}
          <div id="amortization-table">
            <AmortizationSection />
          </div>

          {/* Download Buttons */}
          <DownloadButtons />

          {/* Chart — below table and download buttons */}
          <YearlyBreakdownSection />

          {/* How it works */}
          <div className="mt-10 mb-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { step: "01", title: "Enter your loan", body: "Loan amount, interest rate, and tenure. Takes 30 seconds." },
                { step: "02", title: "See your debt-free date", body: "Know exactly when your last EMI is — down to the month." },
                { step: "03", title: "Simulate part payments", body: "See how a ₹5L part payment saves years and lakhs in interest." },
              ].map((item) => (
                <div key={item.step} className="flex gap-3">
                  <span className="text-2xl font-semibold text-primary/20 flex-shrink-0 leading-none mt-0.5">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="font-medium text-foreground text-sm">{item.title}</h3>
                    <p className="text-muted-foreground text-sm mt-0.5 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explore calculators */}
          <div className="mt-8">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              More tools you might need
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                { href: "/calculators/sip-vs-prepayment", label: "SIP vs Prepayment", desc: "Which saves more?" },
                { href: "/calculators/credit-card-payoff", label: "CC Payoff", desc: "Pay off credit card debt" },
                { href: "/calculators/minimum-due-trap", label: "Min due trap", desc: "How much min due costs you" },
                { href: "/calculators/multi-loan-planner", label: "Which loan first?", desc: "Pay off order across loans" },
                { href: "/calculators/consumer-emi-true-cost", label: "0% EMI true cost", desc: "Hidden processing fee" },
                { href: "/calculators/tax-benefit", label: "Tax benefit", desc: "80C and Section 24b" },
              ].map((tool) => (
                <a
                  key={tool.href}
                  href={tool.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{tool.label}</p>
                    <p className="text-xs text-muted-foreground">{tool.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Why LastEMI — trust section */}
          <div className="mt-12 mb-8">
            <h2 className="text-lg font-medium text-foreground mb-6 text-center">
              Why borrowers choose LastEMI
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: <ShieldCheck className="w-5 h-5 text-primary" />,
                  title: "No phone number needed",
                  body: "We never ask for your mobile number. No DSA will call you. Ever.",
                },
                {
                  icon: <Ruler className="w-5 h-5 text-primary" />,
                  title: "RBI-accurate calculations",
                  body: "Zero prepayment penalty on floating rate home loans — the RBI rule banks forget to mention.",
                },
                {
                  icon: <Target className="w-5 h-5 text-primary" />,
                  title: "No commissions, no bias",
                  body: "We don't earn from recommending loans. The math is the math.",
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-lg p-5 text-center"
                >
                  <div className="flex justify-center mb-3">{card.icon}</div>
                  <h3 className="font-medium text-foreground text-sm mb-2">
                    {card.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {card.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
      <StickyBar />
    </LoanCalculatorProvider>
  );
}
