import { Metadata } from "next";
import Link from "next/link";
import TaxBenefitCalc from "@/components/calculators/TaxBenefitCalc";

export const metadata: Metadata = {
  title: "Home Loan Tax Benefit Calculator — Section 80C & 24(b) | EMIPartPay",
  description:
    "Calculate your home loan tax benefits under Section 80C and 24(b). Compare old vs new regime savings and find which tax regime saves you more money.",
  keywords: [
    "home loan tax benefit calculator",
    "section 80C home loan",
    "section 24b deduction",
    "home loan tax saving",
    "old vs new regime home loan",
  ],
  alternates: { canonical: "/calculators/tax-benefit" },
  openGraph: {
    title: "Home Loan Tax Benefit Calculator — Section 80C & 24(b)",
    url: "/calculators/tax-benefit",
    siteName: "EMIPartPay",
    locale: "en_IN",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function TaxBenefitPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Home Loan Tax Benefit Calculator",
    url: "https://emipartpay.com/calculators/tax-benefit",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description:
      "Calculate home loan tax benefits under Section 80C and 24(b). Compare old vs new regime savings.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="max-w-4xl mx-auto py-6 px-3 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Home Loan Tax Benefit Calculator: How Much Tax Do You Save?
        </h1>
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          Find out how much tax you can save on your home loan under Section 80C
          (principal) and Section 24(b) (interest). Compare old regime vs new regime instantly.
        </p>

        <TaxBenefitCalc />

        {/* SEO Content */}
        <section className="mt-12 space-y-6 text-gray-700 text-sm sm:text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-gray-900">
            Understanding Home Loan Tax Benefits in India
          </h2>
          <p>
            A home loan in India offers significant tax deductions under two sections of the Income
            Tax Act. These deductions can reduce your taxable income by up to <strong>&rupee;3.5 lakh
            per year</strong>, translating to substantial tax savings depending on your tax bracket.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">
            Section 80C: Deduction on Principal Repayment
          </h2>
          <p>
            Under Section 80C, you can claim a deduction of up to <strong>&rupee;1.5 lakh per year</strong> on
            the principal portion of your home loan EMI. However, this limit is shared with other
            80C-eligible investments like EPF contributions, ELSS mutual funds, PPF, life insurance
            premiums, and children&apos;s school fees. If your other 80C investments already exhaust the
            limit, the home loan principal deduction provides no additional benefit. Our calculator
            accounts for your existing 80C investments to show you the actual available deduction.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">
            Section 24(b): Deduction on Interest Paid
          </h2>
          <p>
            Section 24(b) allows you to deduct the interest paid on your home loan from your taxable
            income. For a <strong>self-occupied property</strong>, the maximum deduction is capped at
            <strong> &rupee;2 lakh per year</strong>. For a <strong>rented-out property</strong>, there
            is no upper limit on the interest deduction &mdash; you can claim the entire interest paid.
            This makes Section 24(b) particularly valuable in the early years of your loan when the
            interest component of your EMI is highest.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">
            Old Regime vs New Regime: Which Saves More?
          </h2>
          <p>
            Under the <strong>old tax regime</strong>, you can claim both Section 80C and Section 24(b)
            deductions, making it attractive for home loan borrowers. The <strong>new tax regime</strong>,
            introduced in Budget 2020 and made the default from FY 2023&ndash;24, offers lower tax slab
            rates but removes most deductions including Section 80C and Section 24(b) for self-occupied
            properties. For rented-out properties, Section 24(b) deduction is still available under
            the new regime. As a general rule, if your total deductions (80C + 80D + 24b + HRA etc.)
            exceed &rupee;3.75 lakh, the old regime is usually better. Our calculator compares both
            regimes side by side so you can make the right choice.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <p className="text-blue-800 font-medium">
              Want to track your home loan tax benefits every year?{" "}
              <Link href="/login" className="underline font-semibold">
                Track your home loan tax benefits every year &rarr;
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
