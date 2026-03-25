"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";

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
                <div className="absolute top-full left-0 mt-1 w-72 bg-card border border-border rounded-xl shadow-lg py-2 z-50">
                  {CALCULATOR_LINKS.map((link) => (
                    <Link key={link.href} href={link.href} onClick={() => setCalcDropdown(false)}
                      className={`block px-4 py-2.5 hover:bg-accent transition-colors ${pathname === link.href ? "bg-accent" : ""}`}>
                      <span className={`block text-sm font-medium ${pathname === link.href ? "text-primary" : "text-foreground"}`}>{link.label}</span>
                      <span className="block text-xs text-muted-foreground mt-0.5">{link.desc}</span>
                    </Link>
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
              <Link href="/login" className="bg-primary hover:bg-primary/90 text-white rounded-lg px-3 py-1.5 text-sm font-medium transition-colors">
                Sign in
              </Link>
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
          <nav className="md:hidden mt-2 pt-2 border-t border-border flex flex-col">
            <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Calculators</p>
            {CALCULATOR_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                className={`px-3 py-2 text-sm font-medium rounded-lg ${pathname === link.href ? "text-primary bg-accent" : "text-muted-foreground hover:bg-accent"}`}>
                {link.label}
              </Link>
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
