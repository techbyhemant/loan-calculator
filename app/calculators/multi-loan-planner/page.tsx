import Link from "next/link";

import { buildMetadata } from "@/lib/seo/metadata";
import { getCalculatorSchema, getBreadcrumbSchema } from "@/lib/seo/schema";

import MultiLoanPlannerCalc from "@/components/calculators/MultiLoanPlannerCalc";

export const metadata = buildMetadata({
  title: "Which Loan to Pay Off First? Multi-Loan Payoff Planner",
  description:
    "Compare effective after-tax rates across all Indian loan types — home, personal, car, education, gold. Find the optimal payoff order using tax-adjusted rates and save lakhs in interest.",
  path: "/calculators/multi-loan-planner",
  keywords: [
    "which loan to pay off first India",
    "multi loan planner",
    "debt payoff order",
    "loan payoff priority calculator",
    "effective interest rate after tax",
    "home loan vs personal loan payoff",
    "loan prepayment order India",
  ],
});

export default function MultiLoanPlannerPage() {
  const calcSchema = getCalculatorSchema({
    name: "Multi-Loan Payoff Planner",
    description:
      "Compare effective after-tax interest rates across all your loans — home, personal, car, education, gold — and find the optimal payoff order to save the most interest.",
    url: "https://lastemi.com/calculators/multi-loan-planner",
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "LastEMI", url: "https://lastemi.com" },
    { name: "Calculators", url: "https://lastemi.com/calculators/multi-loan-planner" },
    { name: "Multi-Loan Planner", url: "https://lastemi.com/calculators/multi-loan-planner" },
  ]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calcSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main className="max-w-4xl mx-auto py-6 px-3 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Which Loan Should You Pay Off First? Multi-Loan Payoff Planner
        </h1>
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          Most people pay off whichever loan feels most annoying. But the mathematically
          optimal order depends on <strong>effective after-tax rates</strong>, not headline
          rates. Enter your loans below to see the smartest payoff sequence for your tax
          bracket.
        </p>

        <MultiLoanPlannerCalc />

        <section className="mt-12 space-y-6 text-gray-700 text-sm sm:text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-gray-900">
            Why Effective Rate Matters More Than Headline Rate
          </h2>
          <p>
            An 8.5% home loan and a 10% personal loan look similar on paper. But
            Section 24(b) of the Income Tax Act lets you deduct up to ₹2,00,000 of
            home loan interest from your taxable income each year. For someone in
            the 30% tax bracket, this effectively reduces the home loan cost to around
            6.3% — making the personal loan almost 60% more expensive in real terms.
          </p>
          <p>
            The effective rate is what you actually pay after accounting for all
            tax deductions. This calculator computes it automatically for each loan
            type based on your tax bracket, so you can see the true cost side by side.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">
            Why Your Home Loan Should Almost Always Go Last
          </h2>
          <p>
            Home loans in India enjoy the most generous tax benefits of any debt
            instrument. Under Section 24(b), up to ₹2 lakh of interest is deductible.
            Under Section 80C, up to ₹1.5 lakh of principal repayment qualifies for
            deduction (shared with other 80C investments). For first-time buyers under
            PMAY, there&apos;s an additional ₹1.5 lakh under Section 80EEA.
          </p>
          <p>
            These benefits stack up. A home loan at 8.5% PA can effectively cost as
            little as 5.5-6.5% depending on your tax bracket. Meanwhile, personal
            loans at 14-18% have zero tax benefit — every rupee of interest is a pure
            cost. The math clearly says: pay off your personal loan, car loan, and
            credit card debt before making extra home loan prepayments.
          </p>
          <p>
            The exception? If you have already exhausted your Section 24(b) limit
            (because your interest exceeds ₹2 lakh), the additional interest has no
            tax benefit. In that case, the effective rate on the portion above ₹2 lakh
            equals the headline rate.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">
            Education Loans and Section 80E: The Hidden Benefit
          </h2>
          <p>
            Education loans have a unique advantage under Section 80E — the{" "}
            <strong>entire interest amount</strong> is tax-deductible with{" "}
            <strong>no upper limit</strong>. This is different from home loans where
            the deduction is capped at ₹2 lakh. For a 30% bracket borrower, an
            education loan at 10.5% effectively costs only 7.35%.
          </p>
          <p>
            The 80E deduction is available for 8 years from the year you start repaying.
            This makes education loans one of the cheapest forms of debt in real terms —
            often cheaper than home loans for borrowers with large education loan balances.
            Always factor this in before rushing to prepay an education loan.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <p className="text-blue-800 font-medium">
              Have multiple loans and want a personalised payoff strategy?{" "}
              <Link href="/login" className="underline font-semibold">
                Create your free debt-free plan →
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
