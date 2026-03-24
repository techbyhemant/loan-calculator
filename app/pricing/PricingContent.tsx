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
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Simple, Honest Pricing
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Start free. Upgrade when you need advanced strategies.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900">Free</h2>
            <div className="mt-3 mb-6">
              <span className="text-3xl font-bold text-gray-900">₹0</span>
              <span className="text-gray-500 text-sm">/forever</span>
            </div>
            <ul className="space-y-3 mb-6">
              {FREE_FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <span className="text-green-500 mt-0.5">&#x2713;</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={freeButtonHref}
              className="block text-center w-full bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
            >
              {freeButtonLabel}
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-white border-2 border-purple-300 rounded-2xl p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                {userPlan === "pro" ? "YOUR PLAN" : "MOST POPULAR"}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Pro</h2>
            <div className="mt-3 mb-6">
              <span className="text-3xl font-bold text-gray-900">₹299</span>
              <span className="text-gray-500 text-sm">/month</span>
            </div>
            <ul className="space-y-3 mb-6">
              {PRO_FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <span className="text-purple-500 mt-0.5">&#x2713;</span>
                  {f}
                </li>
              ))}
            </ul>
            {userPlan === "pro" ? (
              <div className="block text-center w-full bg-purple-50 text-purple-700 rounded-lg px-4 py-2.5 text-sm font-medium">
                You&apos;re on Pro
              </div>
            ) : isLoggedIn ? (
              <>
                <button
                  onClick={handleProClick}
                  disabled={loading}
                  className="block text-center w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? "Redirecting to payment..." : "Upgrade to Pro"}
                </button>
                {error && (
                  <p className="text-xs text-red-600 text-center mt-2">{error}</p>
                )}
              </>
            ) : (
              <Link
                href="/login"
                className="block text-center w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            Cancel anytime. No lock-in. Payments via Razorpay (UPI, cards,
            netbanking).
          </p>
        </div>
      </div>
    </div>
  );
}
