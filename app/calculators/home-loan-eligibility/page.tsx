import { Metadata } from "next";
import Link from "next/link";
import EligibilityCalc from "@/components/calculators/EligibilityCalc";
import { getFAQSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "Home Loan Eligibility Calculator — Check Your Loan Amount | LastEMI",
  description:
    "Check how much home loan you can get based on your salary, existing EMIs and interest rate. Compare eligibility across SBI, HDFC, ICICI, and Kotak with the FOIR method.",
  keywords: [
    "home loan eligibility calculator",
    "home loan eligibility calculator salary",
    "how much home loan can I get",
    "loan eligibility calculator india",
    "maximum home loan amount",
  ],
  alternates: { canonical: "/calculators/home-loan-eligibility" },
  openGraph: {
    title: "Home Loan Eligibility Calculator — How Much Can You Borrow?",
    url: "/calculators/home-loan-eligibility",
    siteName: "LastEMI",
    locale: "en_IN",
    type: "website",
  },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    question: "How much home loan can I get on my salary?",
    answer:
      "Banks typically allow EMI up to 50-60% of your net monthly income (called FOIR). On a \u20B91 lakh salary with no other EMIs, you can get approximately \u20B952-65 lakh home loan at 8.5% for 20 years.",
  },
  {
    question: "Does a co-applicant increase home loan eligibility?",
    answer:
      "Yes, adding a co-applicant (usually spouse) clubs their income with yours, potentially doubling your eligible loan amount. Both incomes are considered for FOIR calculation.",
  },
  {
    question: "What is FOIR in home loan eligibility?",
    answer:
      "FOIR (Fixed Obligation to Income Ratio) is the percentage of your monthly income that goes toward EMIs. Banks prefer FOIR below 50-60%. Lower FOIR means higher loan eligibility.",
  },
];

export default function HomeLoanEligibilityPage() {
  const faqSchema = getFAQSchema(faqs);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Home Loan Eligibility Calculator",
    url: "https://lastemi.com/calculators/home-loan-eligibility",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description:
      "Check your home loan eligibility based on salary and existing obligations. Compare across top Indian banks.",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="max-w-4xl mx-auto py-6 px-3 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Home Loan Eligibility Calculator: How Much Loan Can You Get?
        </h1>
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          Find out the maximum home loan amount you qualify for based on your monthly
          income, existing obligations, and preferred tenure.
        </p>

        <EligibilityCalc />

        {/* SEO Content */}
        <section className="mt-12 space-y-6 text-gray-700 text-sm sm:text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-gray-900">
            How Banks Calculate Your Home Loan Eligibility
          </h2>
          <p>
            Banks in India use the <strong>Fixed Obligation to Income Ratio (FOIR)</strong> method to
            determine how much loan you can afford. FOIR measures what percentage of your monthly
            income goes toward paying EMIs and other fixed obligations like credit card payments,
            car loans, and personal loans. The remaining income should be sufficient to cover your
            living expenses and leave a comfortable margin.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">
            What is the Typical FOIR Ratio?
          </h2>
          <p>
            Most banks cap the FOIR at <strong>40–50% of your net monthly income</strong>. This
            means if you earn ₹1 lakh per month, banks will allow a maximum EMI burden of
            ₹40,000 to ₹50,000 including all existing loans. Some banks like SBI may allow
            up to 55–60% for high-income salaried individuals with stable employment in government
            or large corporates. Our calculator uses the standard 50% FOIR as the baseline, which
            is the most common threshold for salaried applicants.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">
            How Existing EMIs Affect Your Eligibility
          </h2>
          <p>
            If you are already paying EMIs on a car loan, personal loan, or credit card dues, these
            amounts are subtracted from your maximum EMI capacity. For example, with a ₹1 lakh
            salary and ₹15,000 in existing EMIs, your available EMI capacity for a home loan
            drops to ₹35,000 (50% of income minus existing EMIs). This directly reduces the
            loan amount you can qualify for. Before applying for a home loan, consider closing
            smaller outstanding loans to maximize your eligibility.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">
            Tips to Increase Your Home Loan Eligibility
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Add a co-applicant:</strong> A working spouse&apos;s income can be clubbed with
              yours, significantly increasing the eligible loan amount.
            </li>
            <li>
              <strong>Clear existing debts:</strong> Pay off credit card dues, personal loans, or
              other small EMIs before applying. Every ₹10,000 reduction in existing EMIs
              can increase your loan eligibility by ₹10–12 lakhs.
            </li>
            <li>
              <strong>Choose a longer tenure:</strong> Opting for a 25–30 year tenure reduces
              the EMI, allowing you to qualify for a higher loan amount. You can always prepay later
              to reduce the effective tenure.
            </li>
            <li>
              <strong>Improve your credit score:</strong> A CIBIL score above 750 qualifies you for
              lower interest rates, which translates to a higher eligible loan amount for the same EMI.
            </li>
            <li>
              <strong>Show all income sources:</strong> Include rental income, bonuses, and variable
              pay with proper documentation. Banks consider up to 50% of variable income.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>
          <dl className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <dt className="font-semibold text-gray-900">{faq.question}</dt>
                <dd className="mt-1 text-gray-600">{faq.answer}</dd>
              </div>
            ))}
          </dl>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <p className="text-blue-800 font-medium">
              Planning to take a home loan?{" "}
              <Link href="/login" className="underline font-semibold">
                Save your calculation &rarr;
              </Link>{" "}
              Track your loans and get a personalized debt-free plan.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
