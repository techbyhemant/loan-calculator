"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/dashboard")) return null;

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
          {/* Loan Calculators */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Loan Calculators
            </h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm text-muted-foreground hover:text-foreground">EMI Calculator</Link></li>
              <li><Link href="/calculators/sip-vs-prepayment" className="text-sm text-muted-foreground hover:text-foreground">SIP vs Prepayment</Link></li>
              <li><Link href="/calculators/home-loan-eligibility" className="text-sm text-muted-foreground hover:text-foreground">Eligibility Check</Link></li>
              <li><Link href="/calculators/tax-benefit" className="text-sm text-muted-foreground hover:text-foreground">Tax Benefit</Link></li>
              <li><Link href="/calculators/salary-to-emi" className="text-sm text-muted-foreground hover:text-foreground">Salary to Loan</Link></li>
              <li><Link href="/calculators/rent-vs-buy" className="text-sm text-muted-foreground hover:text-foreground">Rent vs Buy</Link></li>
              <li><Link href="/calculators/balance-transfer" className="text-sm text-muted-foreground hover:text-foreground">Balance Transfer</Link></li>
              <li><Link href="/calculators/personal-loan-payoff" className="text-sm text-muted-foreground hover:text-foreground">Personal Loan Payoff</Link></li>
              <li><Link href="/calculators/car-loan-prepayment" className="text-sm text-muted-foreground hover:text-foreground">Car Loan Prepayment</Link></li>
              <li><Link href="/calculators/education-loan-80e" className="text-sm text-muted-foreground hover:text-foreground">Education Loan 80E</Link></li>
              <li><Link href="/calculators/consumer-emi-true-cost" className="text-sm text-muted-foreground hover:text-foreground">0% EMI True Cost</Link></li>
              <li><Link href="/calculators/multi-loan-planner" className="text-sm text-muted-foreground hover:text-foreground">Which Loan First?</Link></li>
            </ul>
          </div>

          {/* Credit Card Tools */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Credit Card Tools
            </h3>
            <ul className="space-y-2">
              <li><Link href="/calculators/credit-card-payoff" className="text-sm text-muted-foreground hover:text-foreground">CC Payoff</Link></li>
              <li><Link href="/calculators/minimum-due-trap" className="text-sm text-muted-foreground hover:text-foreground">Minimum Due Trap</Link></li>
              <li><Link href="/calculators/cc-vs-personal-loan" className="text-sm text-muted-foreground hover:text-foreground">CC vs Personal Loan</Link></li>
              <li><Link href="/calculators/multi-card-payoff" className="text-sm text-muted-foreground hover:text-foreground">Multi-Card Payoff</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/rbi-rates" className="text-sm text-muted-foreground hover:text-foreground">
                  RBI Repo Rate
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Dashboard */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Dashboard
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                  My Loans
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              LastEMI
            </h3>
            <p className="text-sm text-muted-foreground">
              India&apos;s honest debt freedom platform. No hidden fees, no lead gen
              &mdash; just math.
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 LastEMI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
