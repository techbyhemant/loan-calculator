"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  // Don't show global footer on dashboard pages
  if (pathname.startsWith("/dashboard")) return null;

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
          {/* Calculators */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Calculators
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
                  EMI Calculator
                </Link>
              </li>
              <li>
                <Link href="/calculators/sip-vs-prepayment" className="text-sm text-gray-600 hover:text-gray-900">
                  SIP vs Prepayment
                </Link>
              </li>
              <li>
                <Link href="/calculators/home-loan-eligibility" className="text-sm text-gray-600 hover:text-gray-900">
                  Eligibility Check
                </Link>
              </li>
              <li>
                <Link href="/calculators/tax-benefit" className="text-sm text-gray-600 hover:text-gray-900">
                  Tax Benefit
                </Link>
              </li>
              <li>
                <Link href="/calculators/salary-to-emi" className="text-sm text-gray-600 hover:text-gray-900">
                  Salary to Loan
                </Link>
              </li>
              <li>
                <Link href="/calculators/rent-vs-buy" className="text-sm text-gray-600 hover:text-gray-900">
                  Rent vs Buy
                </Link>
              </li>
              <li>
                <Link href="/calculators/balance-transfer" className="text-sm text-gray-600 hover:text-gray-900">
                  Balance Transfer
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/rbi-rates" className="text-sm text-gray-600 hover:text-gray-900">
                  RBI Repo Rate
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Dashboard */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Dashboard
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                  My Loans
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              EMIPartPay
            </h3>
            <p className="text-sm text-gray-600">
              India&apos;s honest debt freedom platform. No hidden fees, no lead gen
              &mdash; just math.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 text-center">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} EMIPartPay. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
