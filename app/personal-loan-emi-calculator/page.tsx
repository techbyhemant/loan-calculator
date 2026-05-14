import Link from "next/link";
import { calculateEMI } from "@/lib/calculations/loanCalcs";
import { formatINR, formatLakhs } from "@/lib/utils/formatters";
import { buildMetadata } from "@/lib/seo/metadata";
import { getFAQSchema, getBreadcrumbSchema } from "@/lib/seo/schema";
import { RelatedCalculators } from "@/components/ui/RelatedCalculators";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LoanCalculatorTool } from "@/features/loan-calculator/LoanCalculatorTool";
import { LastReviewed } from "@/components/ui/LastReviewed";

const LAST_REVIEWED = "2026-05-10";

// Hub page for the amount-specific personal loan EMI calculator family.
// Mirrors the home-loan-emi-calculator hub. Targets the broad
// "personal loan emi calculator india" head term.

const AMOUNTS = [
  { slug: "1-lakh", amountInRupees: 100_000, label: "1 Lakh" },
  { slug: "2-lakh", amountInRupees: 200_000, label: "2 Lakh" },
  { slug: "3-lakh", amountInRupees: 300_000, label: "3 Lakh" },
  { slug: "5-lakh", amountInRupees: 500_000, label: "5 Lakh" },
  { slug: "10-lakh", amountInRupees: 1_000_000, label: "10 Lakh" },
  { slug: "20-lakh", amountInRupees: 2_000_000, label: "20 Lakh" },
];

export const metadata = buildMetadata({
  title: "Personal Loan EMI Calculator India — All Amounts, Rates, Tenures",
  description:
    "Free personal loan EMI calculator. Pick ₹1L–₹20L and see EMI, total interest, processing fee impact, and salary needed at every common rate. No DSA calls.",
  path: "/personal-loan-emi-calculator",
  keywords: [
    "personal loan emi calculator",
    "personal loan emi calculator india",
    "personal loan calculator",
    "online personal loan emi calculator",
    "personal loan emi by amount",
  ],
});

const faqs = [
  {
    question: "How is personal loan EMI calculated in India?",
    answer:
      "Indian banks use the standard reducing-balance formula: EMI = [P × R × (1+R)^N] / [(1+R)^N − 1], where P is the principal, R is the monthly interest rate (annual ÷ 12 ÷ 100), and N is the tenure in months. The calculator on this page uses the same formula your bank does — the EMI matches your sanction letter to the rupee.",
  },
  {
    question: "What's the typical personal loan rate in India in 2026?",
    answer:
      "Top private banks (HDFC, ICICI, Axis, Kotak) start at 10.5-11% for prime salaried borrowers. Public sector banks like SBI sit in the 11-14% range. Mid-tier banks and digital NBFCs span 13-18%. Subprime app-based lenders go up to 24%. Your offered rate depends primarily on your CIBIL score, employer category, and existing EMI obligations.",
  },
  {
    question: "Is there a prepayment penalty on a personal loan?",
    answer:
      "Unlike floating-rate home loans (where RBI mandates zero penalty), personal loans typically carry a 2-5% prepayment penalty on the outstanding amount. Some banks waive this after 12 EMIs, others don't. Check your sanction letter before paying off early. Even with the penalty, prepaying usually saves money over the long run if you have at least 18 months of tenure left.",
  },
  {
    question: "Can I claim tax benefits on a personal loan?",
    answer:
      "No direct tax deduction is available on personal loans in India. Sections 24(b), 80C, and 80E are all restricted to home loans or education loans. The sole exception: if you can document that the personal loan was used for business expansion, the interest may be deductible against business income — but only for self-employed borrowers with proper records.",
  },
  {
    question: "What's the maximum personal loan amount I can get?",
    answer:
      "Most banks cap personal loans at 20-30 times your net monthly income, subject to your CIBIL score and employer profile. For someone earning ₹1 lakh/month, the typical ceiling is ₹20-25 lakh. Salaried borrowers at top-tier corporates often qualify for higher limits. Self-employed applicants face stricter caps based on ITR-declared income.",
  },
];

export default function PersonalLoanEmiCalculatorHub() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "https://lastemi.com" },
    {
      name: "Personal Loan EMI Calculator",
      url: "https://lastemi.com/personal-loan-emi-calculator",
    },
  ]);
  const faqSchema = getFAQSchema(faqs);
  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Personal Loan EMI Calculator India — LastEMI",
    url: "https://lastemi.com/personal-loan-emi-calculator",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description:
      "RBI-accurate personal loan EMI calculator for India. Supports any amount, all rates, all tenures, factors in processing fee. No phone number required.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  };

  return (
    <div className="bg-background min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webApp) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="max-w-4xl mx-auto py-6 px-3 sm:px-6">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Personal Loan EMI Calculator", href: "/personal-loan-emi-calculator" },
          ]}
        />

        <div className="mt-3 mb-3">
          <LastReviewed date={LAST_REVIEWED} />
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-3">
          Personal Loan EMI Calculator (India)
        </h1>
        <p className="text-muted-foreground mb-6 text-sm sm:text-base">
          Pick your loan amount below to see EMI, total interest, processing fee
          impact, and salary needed — pre-calculated using the same
          reducing-balance formula your bank uses. No sign-up, no phone number,
          no spam calls.
        </p>

        {/* Live calculator pre-set to mid-market personal loan defaults */}
        <div className="mb-10">
          <LoanCalculatorTool
            initial={{ loanType: "personal", amount: 500_000, rate: 14, tenure: 5 }}
            lockType
          />
        </div>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3">
            Or pick a common loan amount
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {AMOUNTS.map((a) => {
              const emi = calculateEMI(a.amountInRupees, 14, 60);
              const totalInterest = emi * 60 - a.amountInRupees;
              return (
                <Link
                  key={a.slug}
                  href={`/personal-loan-emi-calculator/${a.slug}`}
                  className="block bg-card border border-border hover:border-primary hover:shadow-sm rounded-xl p-4 transition-all"
                >
                  <p className="text-base font-bold text-foreground">₹{a.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">EMI from {formatINR(emi)}/mo</p>
                  <p className="text-xs text-muted-foreground">Interest {formatLakhs(totalInterest)}</p>
                  <p className="text-xs text-primary mt-2 font-medium">View details &rarr;</p>
                </Link>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            All numbers above use a 14% mid-market rate over 5 years. Each
            page lets you see the matrix at 11% / 14% / 18% across 1-7 year
            tenures, and factors in the 2% processing fee.
          </p>
        </section>

        <section className="mt-10 space-y-5 text-foreground text-sm sm:text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-foreground">
            How a Personal Loan EMI Differs from Home or Car Loan EMI
          </h2>
          <p>
            The math is identical — same reducing-balance formula every Indian
            bank uses. What differs is the rate band (10.5-24% vs 8.5-9.5% for
            home loans), the tenure (typically 1-7 years, capped at 5 for many
            banks), and the processing fee (1-3% upfront, taxed at 18% GST).
            Personal loans also don&apos;t carry the RBI&apos;s zero-prepayment-penalty
            rule, so check your sanction letter for the foreclosure terms.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            What Banks Look at Before Approving
          </h2>
          <p>
            CIBIL score is the dominant factor — 750+ unlocks the headline rates,
            700-749 means a higher offered rate, below 700 typically means
            rejection or NBFC-tier rates. Beyond that: your employer&apos;s
            category (govt and Tier-1 corporate get the best rates), how long
            you&apos;ve been in your current job (most banks want 2+ years),
            net monthly take-home, existing EMI obligations, and age. The bank
            wants your total EMIs (including the new personal loan) below 50-55%
            of net income.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            The Real Cost: Beyond the Headline Rate
          </h2>
          <p>
            Two costs banks don&apos;t put in the brochure:
          </p>
          <ul className="list-disc list-inside space-y-1.5">
            <li>
              <strong>Processing fee + GST.</strong> 1-3% of the loan amount,
              with 18% GST on the fee. Deducted from your disbursement, but you
              still owe interest on the full sanctioned amount.
            </li>
            <li>
              <strong>Insurance premium.</strong> Many banks bundle a credit-life
              or job-loss insurance policy with personal loans. It&apos;s
              usually optional but the loan officer rarely tells you that.
              Decline unless you actually want the cover.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground">Frequently Asked Questions</h2>
          <dl className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <dt className="font-semibold text-foreground">{faq.question}</dt>
                <dd className="mt-1 text-muted-foreground">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <RelatedCalculators />
      </main>
    </div>
  );
}
