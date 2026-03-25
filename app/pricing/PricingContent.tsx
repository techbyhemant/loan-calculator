"use client";

import { useState } from "react";
import Link from "next/link";

const FREE_FEATURES = [
  "Track up to 2 loans",
  "EMI Part Payment Calculator",
  "Amortization schedule",
  "5 part payment logs",
  "SIP vs Prepayment calculator",
  "Eligibility calculator",
  "Tax benefit calculator (public)",
  "Shareable calculation links",
];

const PRO_FEATURES = [
  "Unlimited loans",
  "Unlimited part payment logs",
  "Payoff Planner (avalanche/snowball)",
  "Loan Consolidation Analyzer",
  "Tax Benefits Dashboard (personalized)",
  "PDF report export",
  "Email alerts & monthly summary",
  "Priority support",
];

export function PricingContent({
  isLoggedIn,
  userPlan,
}: {
  isLoggedIn: boolean;
  userPlan: "free" | "pro";
}) {
  const freeButtonHref = isLoggedIn ? "/dashboard" : "/login";
  const freeButtonLabel = isLoggedIn ? "Go to Dashboard" : "Get Started Free";

  const proButtonHref = isLoggedIn ? "/dashboard" : "/login";
  const proButtonLabel =
    userPlan === "pro"
      ? "You're on Pro"
      : isLoggedIn
        ? "Upgrade to Pro"
        : "Get Started";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleProClick = async () => {
    if (!isLoggedIn || userPlan === "pro") return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments/create-subscription", {
        method: "POST",
      });
      const data = await res.json();
      if (data.shortUrl) {
        window.location.href = data.shortUrl;
      } else if (res.status === 503) {
        setError("Payment gateway is being set up. Please try again later.");
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Simple, Honest Pricing
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Start free. Upgrade when you need advanced strategies.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free Plan */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground">Free</h2>
            <div className="mt-3 mb-6">
              <span className="text-3xl font-bold text-foreground">₹0</span>
              <span className="text-muted-foreground text-sm">/forever</span>
            </div>
            <ul className="space-y-3 mb-6">
              {FREE_FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-sm text-foreground"
                >
                  <span className="text-positive mt-0.5">&#x2713;</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={freeButtonHref}
              className="block text-center w-full bg-muted hover:bg-accent text-foreground rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
            >
              {freeButtonLabel}
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-card border-2 border-primary/20 rounded-2xl p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                {userPlan === "pro" ? "YOUR PLAN" : "MOST POPULAR"}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-foreground">Pro</h2>
            <div className="mt-3 mb-6">
              <span className="text-3xl font-bold text-foreground">₹299</span>
              <span className="text-muted-foreground text-sm">/month</span>
            </div>
            <ul className="space-y-3 mb-6">
              {PRO_FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-sm text-foreground"
                >
                  <span className="text-primary mt-0.5">&#x2713;</span>
                  {f}
                </li>
              ))}
            </ul>
            {userPlan === "pro" ? (
              <div className="block text-center w-full bg-pro-subtle text-primary rounded-lg px-4 py-2.5 text-sm font-medium">
                You&apos;re on Pro
              </div>
            ) : isLoggedIn ? (
              <>
                <button
                  onClick={handleProClick}
                  disabled={loading}
                  className="block text-center w-full bg-primary hover:bg-primary/90 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? "Redirecting to payment..." : "Upgrade to Pro"}
                </button>
                {error && (
                  <p className="text-xs text-negative text-center mt-2">{error}</p>
                )}
              </>
            ) : (
              <Link
                href="/login"
                className="block text-center w-full bg-primary hover:bg-primary/90 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            Cancel anytime. No lock-in. Payments via Razorpay (UPI, cards,
            netbanking).
          </p>
        </div>
      </div>
    </div>
  );
}
