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

const LIFETIME_EXTRAS = [
  "Everything in Pro, forever",
  "All current Pro features for life",
  "Founding Member badge in your account",
  "Direct line to the founder for product feedback",
  "Locked at ₹6,999 — no future price hikes for you",
];

type Pricing = { monthly: number; yearly: number; lifetime: number };
type LifetimeMeta = {
  spotsRemaining: number;
  totalSpots: number;
  endsAt: string;
  campaignEnded: boolean;
};

export function PricingContent({
  isLoggedIn,
  userPlan,
  userPlanType,
  pricing,
  lifetime,
}: {
  isLoggedIn: boolean;
  userPlan: "free" | "pro";
  userPlanType: string | null;
  pricing: Pricing;
  lifetime: LifetimeMeta;
}) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "yearly", // Yearly is the default highlighted option
  );
  const [loading, setLoading] = useState<null | "subscription" | "lifetime">(
    null,
  );
  const [error, setError] = useState("");

  const isOnLifetime = userPlanType === "lifetime";
  const isOnYearly = userPlanType === "yearly";
  const isOnMonthly = userPlanType === "monthly";

  const yearlyPerMonth = Math.round(pricing.yearly / 12);
  const yearlySaving = pricing.monthly * 12 - pricing.yearly;
  const yearlySavingPct = Math.round(
    (yearlySaving / (pricing.monthly * 12)) * 100,
  );

  const handleProClick = async () => {
    if (!isLoggedIn) return;
    if (userPlan === "pro" && (isOnLifetime || (isOnYearly && billingCycle === "yearly"))) {
      return; // Already covered
    }
    setLoading("subscription");
    setError("");
    try {
      const res = await fetch("/api/payments/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType: billingCycle }),
      });
      const data = await res.json();
      if (data.shortUrl) {
        window.location.href = data.shortUrl;
      } else if (res.status === 503) {
        setError(
          data.error ?? "Payment gateway is being set up. Please try again later.",
        );
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleLifetimeClick = async () => {
    if (!isLoggedIn) return;
    if (isOnLifetime) return;
    setLoading("lifetime");
    setError("");
    try {
      const res = await fetch("/api/payments/create-lifetime-order", {
        method: "POST",
      });
      const data = await res.json();
      if (data.orderId) {
        // Open Razorpay Checkout. The script must be loaded — most apps
        // load it on the pricing page only. Loading lazily here so the
        // script doesn't bloat the calculator pages.
        await loadRazorpayScript();
        // @ts-expect-error Razorpay is global once the script is loaded.
        const rzp = new window.Razorpay({
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          order_id: data.orderId,
          name: "LastEMI Founding Member Lifetime",
          description: "One-time payment, no recurring charges.",
          theme: { color: "#4F46E5" },
          handler: () => {
            // Webhook handles plan activation server-side. UI just
            // tells the user payment succeeded and reload.
            window.location.href = "/dashboard?welcome=lifetime";
          },
          modal: {
            ondismiss: () => setLoading(null),
          },
        });
        rzp.open();
        // Keep loading state until modal closes via handler/ondismiss
        return;
      } else if (res.status === 410) {
        setError(data.error ?? "Founding member lifetime is sold out.");
      } else if (res.status === 503) {
        setError(
          data.error ?? "Payment gateway is being set up. Please try again later.",
        );
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(null);
    }
  };

  const showLifetimeCard = !lifetime.campaignEnded;

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Simple, honest pricing
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Free to start. Upgrade only when you need the strategy tools.
          </p>
        </div>

        {/* Billing-cycle toggle (controls the Pro card price below). */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
              billingCycle === "monthly"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${
              billingCycle === "yearly"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            Yearly
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                billingCycle === "yearly"
                  ? "bg-primary-foreground/20"
                  : "bg-positive/10 text-positive"
              }`}
            >
              Save {yearlySavingPct}%
            </span>
          </button>
        </div>

        <div
          className={`grid grid-cols-1 ${
            showLifetimeCard ? "lg:grid-cols-3" : "sm:grid-cols-2 max-w-3xl"
          } gap-6 mx-auto`}
        >
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
              href={isLoggedIn ? "/dashboard" : "/login"}
              className="block text-center w-full bg-muted hover:bg-accent text-foreground rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
            >
              {isLoggedIn ? "Go to Dashboard" : "Get Started Free"}
            </Link>
          </div>

          {/* Pro Plan (toggles between monthly and yearly) */}
          <div className="bg-card border-2 border-primary/20 rounded-2xl p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                {userPlan === "pro" && (isOnMonthly || isOnYearly)
                  ? "YOUR PLAN"
                  : "MOST POPULAR"}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-foreground">Pro</h2>
            <div className="mt-3 mb-2">
              <span className="text-3xl font-bold text-foreground">
                ₹
                {billingCycle === "yearly"
                  ? pricing.yearly.toLocaleString("en-IN")
                  : pricing.monthly}
              </span>
              <span className="text-muted-foreground text-sm">
                {billingCycle === "yearly" ? "/year" : "/month"}
              </span>
            </div>
            {billingCycle === "yearly" ? (
              <p className="text-xs text-muted-foreground mb-6">
                That&rsquo;s ₹{yearlyPerMonth}/month, billed yearly.{" "}
                <span className="text-positive font-medium">
                  Save ₹{yearlySaving.toLocaleString("en-IN")} vs monthly.
                </span>
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mb-6">
                Cancel anytime, no lock-in.
              </p>
            )}
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
            {isOnLifetime ? (
              <div className="block text-center w-full bg-pro-subtle text-primary rounded-lg px-4 py-2.5 text-sm font-medium">
                Already covered by Lifetime &#x2713;
              </div>
            ) : userPlan === "pro" ? (
              <div className="block text-center w-full bg-pro-subtle text-primary rounded-lg px-4 py-2.5 text-sm font-medium">
                You&rsquo;re on Pro
              </div>
            ) : isLoggedIn ? (
              <button
                onClick={handleProClick}
                disabled={loading !== null}
                className="block text-center w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loading === "subscription"
                  ? "Redirecting to payment..."
                  : `Get Pro ${billingCycle === "yearly" ? "Yearly" : "Monthly"}`}
              </button>
            ) : (
              <Link
                href="/login"
                className="block text-center w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
              >
                Sign in to upgrade
              </Link>
            )}
          </div>

          {/* Lifetime Founding Member (campaign card) */}
          {showLifetimeCard && (
            <div className="bg-card border-2 border-positive/30 rounded-2xl p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-positive text-white text-xs font-semibold px-3 py-1 rounded-full">
                  FOUNDING MEMBER
                </span>
              </div>
              <h2 className="text-lg font-semibold text-foreground">Lifetime</h2>
              <div className="mt-3 mb-2">
                <span className="text-3xl font-bold text-foreground">
                  ₹{pricing.lifetime.toLocaleString("en-IN")}
                </span>
                <span className="text-muted-foreground text-sm"> one-time</span>
              </div>
              <p className="text-xs text-muted-foreground mb-1">
                Pay once. Pro features for life. No recurring charges, ever.
              </p>
              <p className="text-xs font-medium text-positive mb-6">
                {lifetime.spotsRemaining} of {lifetime.totalSpots} spots left
                {" • "}
                ends {formatEndDate(lifetime.endsAt)}
              </p>
              <ul className="space-y-3 mb-6">
                {LIFETIME_EXTRAS.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <span className="text-positive mt-0.5">&#x2713;</span>
                    {f}
                  </li>
                ))}
              </ul>
              {isOnLifetime ? (
                <div className="block text-center w-full bg-positive/10 text-positive rounded-lg px-4 py-2.5 text-sm font-medium">
                  You&rsquo;re a Founding Member &#x2713;
                </div>
              ) : isLoggedIn ? (
                <button
                  onClick={handleLifetimeClick}
                  disabled={loading !== null}
                  className="block text-center w-full bg-positive hover:bg-positive/90 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {loading === "lifetime"
                    ? "Opening checkout..."
                    : "Become a Founding Member"}
                </button>
              ) : (
                <Link
                  href="/login?ref=lifetime"
                  className="block text-center w-full bg-positive hover:bg-positive/90 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                >
                  Sign in to claim
                </Link>
              )}
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-negative text-center mt-6">{error}</p>
        )}

        <div className="text-center mt-8 space-y-1">
          <p className="text-xs text-muted-foreground">
            All payments via Razorpay (UPI, cards, netbanking). 7-day refund on
            yearly &amp; lifetime if you change your mind.
          </p>
          <p className="text-xs text-muted-foreground">
            Yearly and monthly auto-renew until you cancel. Lifetime is a single
            charge with no renewal.
          </p>
        </div>
      </div>
    </div>
  );
}

function formatEndDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Lazy-load the Razorpay Checkout script. Only invoked when the user
// actually clicks "Become a Founding Member" so we don't ship the script
// to free-plan visitors. Resolves immediately if it's already loaded.
function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("SSR"));
    // @ts-expect-error global injected by the script
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Razorpay script failed to load"));
    document.body.appendChild(script);
  });
}
