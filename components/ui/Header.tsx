"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";

const CALC_CATEGORIES = [
  {
    label: "Loan Calculators",
    links: [
      { href: "/", label: "EMI Part Payment", desc: "Calculate part payment savings" },
      { href: "/calculators/sip-vs-prepayment", label: "SIP vs Prepayment", desc: "Invest or prepay your loan?" },
      { href: "/calculators/home-loan-eligibility", label: "Loan Eligibility", desc: "How much can you borrow?" },
      { href: "/calculators/salary-to-emi", label: "Salary to Loan", desc: "Loan amount from your salary" },
      { href: "/calculators/tax-benefit", label: "Tax Benefit", desc: "80C, 24(b) & 80E savings" },
      { href: "/calculators/rent-vs-buy", label: "Rent vs Buy", desc: "Should you buy or keep renting?" },
      { href: "/calculators/balance-transfer", label: "Balance Transfer", desc: "Is switching banks worth it?" },
    ],
  },
  {
    label: "Debt & Payoff",
    links: [
      { href: "/calculators/personal-loan-payoff", label: "Personal Loan Payoff", desc: "Prepay with penalty factored in" },
      { href: "/calculators/car-loan-prepayment", label: "Car Loan Prepayment", desc: "Is prepaying worth the penalty?" },
      { href: "/calculators/education-loan-80e", label: "Education Loan 80E", desc: "Moratorium + tax benefit planner" },
      { href: "/calculators/consumer-emi-true-cost", label: "0% EMI True Cost", desc: "Hidden charges on no-cost EMI" },
      { href: "/calculators/multi-loan-planner", label: "Which Loan First?", desc: "Optimal payoff order for all loans" },
    ],
  },
  {
    label: "Credit Cards",
    links: [
      { href: "/calculators/credit-card-payoff", label: "CC Payoff", desc: "How long to clear your card?" },
      { href: "/calculators/minimum-due-trap", label: "Minimum Due Trap", desc: "The real cost of paying minimum" },
      { href: "/calculators/cc-vs-personal-loan", label: "CC vs Personal Loan", desc: "Which costs less?" },
      { href: "/calculators/multi-card-payoff", label: "Multi-Card Payoff", desc: "Avalanche vs snowball strategy" },
    ],
  },
];

const ALL_CALC_LINKS = CALC_CATEGORIES.flatMap((c) => c.links);

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [calcDropdown, setCalcDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCalcDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isCalcPage = pathname === "/" || pathname.startsWith("/calculators/");

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image
              src="/long-logo-light.png"
              alt="LastEMI"
              width={120}
              height={34}
              className="h-8 w-auto dark:hidden"
              priority
            />
            <Image
              src="/long-logo-dark.png"
              alt="LastEMI"
              width={120}
              height={34}
              className="h-8 w-auto hidden dark:block"
              priority
            />
          </Link>

          {/* Desktop Nav — always public links */}
          <nav className="hidden md:flex items-center gap-1">
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setCalcDropdown(!calcDropdown)}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  isCalcPage ? "text-primary bg-accent" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                Calculators
                <svg className={`w-3.5 h-3.5 transition-transform ${calcDropdown ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {calcDropdown && (
                <div className="absolute top-full left-0 mt-1 w-[560px] bg-card border border-border rounded-xl shadow-lg py-3 z-50 grid grid-cols-3 gap-0">
                  {CALC_CATEGORIES.map((cat) => (
                    <div key={cat.label} className="px-2">
                      <p className="px-2 pb-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{cat.label}</p>
                      {cat.links.map((link) => (
                        <Link key={link.href} href={link.href} onClick={() => setCalcDropdown(false)}
                          className={`block px-2 py-1.5 rounded-md hover:bg-accent transition-colors ${pathname === link.href ? "bg-accent" : ""}`}>
                          <span className={`block text-sm font-medium ${pathname === link.href ? "text-primary" : "text-foreground"}`}>{link.label}</span>
                          <span className="block text-[11px] text-muted-foreground leading-tight">{link.desc}</span>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Link href="/rbi-rates" className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${pathname === "/rbi-rates" ? "text-primary bg-accent" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}>RBI Rates</Link>
            <Link href="/blog" className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${pathname.startsWith("/blog") ? "text-primary bg-accent" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}>Blog</Link>
            <Link href="/pricing" className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${pathname === "/pricing" ? "text-primary bg-accent" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}>Pricing</Link>
            {isLoggedIn && (
              <Link href="/dashboard" className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${pathname.startsWith("/dashboard") ? "text-primary bg-accent" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}>Dashboard</Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isLoggedIn ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="bg-muted hover:bg-secondary text-foreground rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
              >
                Sign out
              </button>
            ) : (
              <>
                <Link href="/login" className="hidden md:inline-flex text-muted-foreground hover:text-foreground rounded-lg px-3 py-1.5 text-sm font-medium transition-colors">
                  Sign in
                </Link>
                <Link href="/login?ref=nav" className="bg-primary hover:bg-primary/90 text-white rounded-lg px-3 py-1.5 text-sm font-medium transition-colors">
                  Try free
                </Link>
              </>
            )}
            <button
              onClick={() => { setMenuOpen(!menuOpen); setCalcDropdown(false); }}
              className="md:hidden p-1.5 rounded-lg hover:bg-accent text-muted-foreground"
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
          <nav className="md:hidden mt-2 pt-2 border-t border-border flex flex-col max-h-[70vh] overflow-y-auto">
            {CALC_CATEGORIES.map((cat) => (
              <div key={cat.label}>
                <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{cat.label}</p>
                {cat.links.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg ${pathname === link.href ? "text-primary bg-accent" : "text-muted-foreground hover:bg-accent"}`}>
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="border-t border-border mt-1 pt-1">
              <Link href="/rbi-rates" onClick={() => setMenuOpen(false)} className={`block px-3 py-2 text-sm font-medium rounded-lg ${pathname === "/rbi-rates" ? "text-primary bg-accent" : "text-muted-foreground hover:bg-accent"}`}>RBI Rates</Link>
              <Link href="/blog" onClick={() => setMenuOpen(false)} className={`block px-3 py-2 text-sm font-medium rounded-lg ${pathname.startsWith("/blog") ? "text-primary bg-accent" : "text-muted-foreground hover:bg-accent"}`}>Blog</Link>
              <Link href="/pricing" onClick={() => setMenuOpen(false)} className={`block px-3 py-2 text-sm font-medium rounded-lg ${pathname === "/pricing" ? "text-primary bg-accent" : "text-muted-foreground hover:bg-accent"}`}>Pricing</Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
