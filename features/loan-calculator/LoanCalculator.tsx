import { ShieldCheck, Ruler, Target } from "lucide-react";

import { LoanCalculatorTool } from "./LoanCalculatorTool";

/**
 * Homepage wrapper around the EMI calculator. Embeds <LoanCalculatorTool />
 * with the homepage's marketing copy (badge, h1, "How it works", trust
 * cards). Same component composition as before — the tool internals were
 * just lifted into LoanCalculatorTool so contextual landing pages
 * (e.g. /home-loan-emi-calculator/50-lakh) can embed the same engine.
 *
 * Important: the homepage's user-visible output should remain byte-equivalent
 * to the pre-refactor version. If anything looks different on `/`, that's
 * a bug.
 */
export default function LoanCalculator() {
  return (
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

        {/* The actual calculator — extracted into LoanCalculatorTool so
            contextual landing pages can reuse the same engine. Homepage
            keeps the share-link URL token reading and the sticky bar. */}
        <LoanCalculatorTool readUrlToken showStickyBar />

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
  );
}
