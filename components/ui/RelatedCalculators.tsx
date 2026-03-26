"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface RelatedCalc {
  href: string;
  label: string;
  desc: string;
}

const RELATED_MAP: Record<string, RelatedCalc[]> = {
  "/": [
    { href: "/calculators/sip-vs-prepayment", label: "SIP vs Prepayment", desc: "Is investing better?" },
    { href: "/calculators/tax-benefit", label: "Tax Benefit", desc: "80C and 24b savings" },
    { href: "/calculators/home-loan-eligibility", label: "Eligibility Check", desc: "How much can you borrow?" },
  ],
  "/calculators/sip-vs-prepayment": [
    { href: "/", label: "EMI Calculator", desc: "Your current loan schedule" },
    { href: "/calculators/tax-benefit", label: "Tax Benefit", desc: "Affects the comparison" },
    { href: "/calculators/multi-loan-planner", label: "Which Loan First?", desc: "Multiple loans?" },
  ],
  "/calculators/home-loan-eligibility": [
    { href: "/", label: "EMI Calculator", desc: "Calculate your monthly EMI" },
    { href: "/calculators/rent-vs-buy", label: "Rent vs Buy", desc: "Should you even buy?" },
    { href: "/calculators/salary-to-emi", label: "Salary to Loan", desc: "Based on your income" },
  ],
  "/calculators/tax-benefit": [
    { href: "/", label: "EMI Calculator", desc: "Your loan schedule" },
    { href: "/calculators/sip-vs-prepayment", label: "SIP vs Prepayment", desc: "Investment comparison" },
    { href: "/calculators/education-loan-80e", label: "Education 80E", desc: "Unlimited interest deduction" },
  ],
  "/calculators/credit-card-payoff": [
    { href: "/calculators/minimum-due-trap", label: "Minimum Due Trap", desc: "The real cost" },
    { href: "/calculators/cc-vs-personal-loan", label: "CC vs PL", desc: "Which costs less?" },
    { href: "/calculators/multi-card-payoff", label: "Multi-Card", desc: "Multiple cards?" },
  ],
  "/calculators/minimum-due-trap": [
    { href: "/calculators/credit-card-payoff", label: "CC Payoff", desc: "Plan your payoff" },
    { href: "/calculators/cc-vs-personal-loan", label: "CC vs PL", desc: "Switch to personal loan?" },
    { href: "/calculators/multi-card-payoff", label: "Multi-Card", desc: "Multiple cards?" },
  ],
  "/calculators/cc-vs-personal-loan": [
    { href: "/calculators/credit-card-payoff", label: "CC Payoff", desc: "Keep paying the card" },
    { href: "/calculators/personal-loan-payoff", label: "PL Payoff", desc: "Prepay the PL" },
    { href: "/calculators/minimum-due-trap", label: "Min Due Trap", desc: "Cost of minimum due" },
  ],
  "/calculators/multi-card-payoff": [
    { href: "/calculators/credit-card-payoff", label: "CC Payoff", desc: "Single card payoff" },
    { href: "/calculators/minimum-due-trap", label: "Min Due Trap", desc: "Worst case scenario" },
    { href: "/calculators/cc-vs-personal-loan", label: "CC vs PL", desc: "Consolidate with PL?" },
  ],
  "/calculators/personal-loan-payoff": [
    { href: "/calculators/multi-loan-planner", label: "Which Loan First?", desc: "Payoff order" },
    { href: "/calculators/cc-vs-personal-loan", label: "CC vs PL", desc: "Was PL worth it?" },
    { href: "/", label: "EMI Calculator", desc: "Check your EMI" },
  ],
  "/calculators/car-loan-prepayment": [
    { href: "/calculators/multi-loan-planner", label: "Which Loan First?", desc: "Payoff order" },
    { href: "/calculators/sip-vs-prepayment", label: "SIP vs Prepay", desc: "Invest instead?" },
    { href: "/", label: "EMI Calculator", desc: "Check your EMI" },
  ],
  "/calculators/education-loan-80e": [
    { href: "/calculators/tax-benefit", label: "Tax Benefit", desc: "All tax deductions" },
    { href: "/calculators/sip-vs-prepayment", label: "SIP vs Prepay", desc: "Invest during moratorium?" },
    { href: "/calculators/multi-loan-planner", label: "Which Loan First?", desc: "Priority with other loans" },
  ],
  "/calculators/consumer-emi-true-cost": [
    { href: "/calculators/credit-card-payoff", label: "CC Payoff", desc: "If you used credit card" },
    { href: "/calculators/personal-loan-payoff", label: "PL Payoff", desc: "Personal loan alternative" },
    { href: "/", label: "EMI Calculator", desc: "Check real EMI" },
  ],
  "/calculators/multi-loan-planner": [
    { href: "/calculators/sip-vs-prepayment", label: "SIP vs Prepay", desc: "Per-loan comparison" },
    { href: "/calculators/personal-loan-payoff", label: "PL Payoff", desc: "Personal loan details" },
    { href: "/calculators/car-loan-prepayment", label: "Car Loan Prepay", desc: "Car loan details" },
  ],
  "/calculators/rent-vs-buy": [
    { href: "/calculators/home-loan-eligibility", label: "Eligibility", desc: "Can you get the loan?" },
    { href: "/", label: "EMI Calculator", desc: "Monthly EMI amount" },
    { href: "/calculators/tax-benefit", label: "Tax Benefit", desc: "Home loan tax savings" },
  ],
  "/calculators/salary-to-emi": [
    { href: "/calculators/home-loan-eligibility", label: "Eligibility", desc: "Full eligibility check" },
    { href: "/", label: "EMI Calculator", desc: "Calculate your EMI" },
    { href: "/calculators/rent-vs-buy", label: "Rent vs Buy", desc: "Should you buy?" },
  ],
  "/calculators/balance-transfer": [
    { href: "/", label: "EMI Calculator", desc: "New bank EMI" },
    { href: "/calculators/sip-vs-prepayment", label: "SIP vs Prepay", desc: "Or just prepay?" },
    { href: "/calculators/multi-loan-planner", label: "Which Loan First?", desc: "All loans considered" },
  ],
};

// Fallback for unmapped pages
const DEFAULT_RELATED: RelatedCalc[] = [
  { href: "/", label: "EMI Calculator", desc: "Calculate your monthly EMI" },
  { href: "/calculators/sip-vs-prepayment", label: "SIP vs Prepayment", desc: "Invest or prepay?" },
  { href: "/calculators/credit-card-payoff", label: "CC Payoff", desc: "Credit card payoff plan" },
];

export function RelatedCalculators() {
  const pathname = usePathname();
  const related = RELATED_MAP[pathname] ?? DEFAULT_RELATED;

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
        Also useful
      </p>
      <div className="flex flex-wrap gap-2">
        {related.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="px-3 py-2 rounded-lg border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-colors"
          >
            <p className="text-sm font-medium text-foreground">{r.label}</p>
            <p className="text-xs text-muted-foreground">{r.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
