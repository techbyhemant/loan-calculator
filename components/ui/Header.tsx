"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const CALCULATOR_LINKS = [
  { href: "/", label: "EMI Part Payment", desc: "Calculate part payment savings" },
  { href: "/calculators/sip-vs-prepayment", label: "SIP vs Prepayment", desc: "Invest or prepay your loan?" },
  { href: "/calculators/home-loan-eligibility", label: "Loan Eligibility", desc: "How much can you borrow?" },
  { href: "/calculators/salary-to-emi", label: "Salary to Loan", desc: "Loan amount from your salary" },
  { href: "/calculators/tax-benefit", label: "Tax Benefit", desc: "Section 80C & 24(b) savings" },
  { href: "/calculators/rent-vs-buy", label: "Rent vs Buy", desc: "Should you buy or keep renting?" },
  { href: "/calculators/balance-transfer", label: "Balance Transfer", desc: "Is switching banks worth it?" },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [calcDropdown, setCalcDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isDashboard = pathname.startsWith("/dashboard");

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCalcDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isCalcPage =
    pathname === "/" || pathname.startsWith("/calculators/");

  // Don't show global header on dashboard pages
  if (isDashboard) return null;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">LastEMI</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Calculators Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setCalcDropdown(!calcDropdown)}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  isCalcPage
                    ? "text-blue-700 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Calculators
                <svg
                  className={`w-3.5 h-3.5 transition-transform ${calcDropdown ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Panel */}
              {calcDropdown && (
                <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                  {CALCULATOR_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setCalcDropdown(false)}
                      className={`block px-4 py-2.5 hover:bg-gray-50 transition-colors ${
                        pathname === link.href ? "bg-blue-50" : ""
                      }`}
                    >
                      <span className={`block text-sm font-medium ${
                        pathname === link.href ? "text-blue-700" : "text-gray-900"
                      }`}>
                        {link.label}
                      </span>
                      <span className="block text-xs text-gray-500 mt-0.5">
                        {link.desc}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Standalone links */}
            <Link
              href="/rbi-rates"
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                pathname === "/rbi-rates"
                  ? "text-blue-700 bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              RBI Rates
            </Link>
            <Link
              href="/blog"
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                pathname.startsWith("/blog")
                  ? "text-blue-700 bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Blog
            </Link>
            <Link
              href="/pricing"
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                pathname === "/pricing"
                  ? "text-blue-700 bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Pricing
            </Link>
          </nav>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <button
              onClick={() => { setMenuOpen(!menuOpen); setCalcDropdown(false); }}
              className="md:hidden p-1.5 rounded-lg hover:bg-gray-50 text-gray-600"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <nav className="md:hidden mt-2 pt-2 border-t border-gray-100 flex flex-col">
            <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Calculators
            </p>
            {CALCULATOR_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2 text-sm font-medium rounded-lg ${
                  pathname === link.href
                    ? "text-blue-700 bg-blue-50"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-gray-100 mt-1 pt-1">
              <Link
                href="/rbi-rates"
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 text-sm font-medium rounded-lg ${
                  pathname === "/rbi-rates" ? "text-blue-700 bg-blue-50" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                RBI Rates
              </Link>
              <Link
                href="/blog"
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 text-sm font-medium rounded-lg ${
                  pathname.startsWith("/blog") ? "text-blue-700 bg-blue-50" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Blog
              </Link>
              <Link
                href="/pricing"
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 text-sm font-medium rounded-lg ${
                  pathname === "/pricing" ? "text-blue-700 bg-blue-50" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Pricing
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
