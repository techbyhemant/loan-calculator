import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — Free vs Pro | EMIPartPay",
  description:
    "Compare EMIPartPay Free and Pro plans. Track loans for free or upgrade to Pro for payoff strategies, consolidation analysis, and tax benefits.",
  alternates: { canonical: "/pricing" },
  robots: { index: true, follow: true },
};

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

export default function PricingPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
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
              <span className="text-3xl font-bold text-gray-900">
                &#x20B9;0
              </span>
              <span className="text-gray-500 text-sm">/forever</span>
            </div>
            <ul className="space-y-3 mb-6">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-500 mt-0.5">&#x2713;</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="block text-center w-full bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-white border-2 border-purple-300 rounded-2xl p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                MOST POPULAR
              </span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Pro</h2>
            <div className="mt-3 mb-6">
              <span className="text-3xl font-bold text-gray-900">
                &#x20B9;299
              </span>
              <span className="text-gray-500 text-sm">/month</span>
            </div>
            <ul className="space-y-3 mb-6">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-purple-500 mt-0.5">&#x2713;</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="block text-center w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            Cancel anytime. No lock-in. Payments via Razorpay (UPI, cards,
            netbanking).
          </p>
        </div>
      </main>
    </div>
  );
}
