import Link from "next/link";
import { calculateEMI } from "@/lib/calculations/loanCalcs";
import { formatINR, formatLakhs } from "@/lib/utils/formatters";
import { buildMetadata } from "@/lib/seo/metadata";
import { getFAQSchema, getBreadcrumbSchema } from "@/lib/seo/schema";
import { RelatedCalculators } from "@/components/ui/RelatedCalculators";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

// Hub page for the amount-specific home loan EMI calculator family.
// Targets the broad "home loan emi calculator india" head term.

const AMOUNTS = [
  { slug: "15-lakh", amountInRupees: 1_500_000, label: "15 Lakh" },
  { slug: "20-lakh", amountInRupees: 2_000_000, label: "20 Lakh" },
  { slug: "25-lakh", amountInRupees: 2_500_000, label: "25 Lakh" },
  { slug: "50-lakh", amountInRupees: 5_000_000, label: "50 Lakh" },
  { slug: "60-lakh", amountInRupees: 6_000_000, label: "60 Lakh" },
  { slug: "75-lakh", amountInRupees: 7_500_000, label: "75 Lakh" },
  { slug: "90-lakh", amountInRupees: 9_000_000, label: "90 Lakh" },
  { slug: "1-crore", amountInRupees: 10_000_000, label: "1 Crore" },
];

export const metadata = buildMetadata({
  title: "Home Loan EMI Calculator India — All Amounts, Rates, Tenures",
  description:
    "Free home loan EMI calculator for India. Pick your loan amount — ₹15L, ₹25L, ₹50L, ₹1Cr — and see EMI, total interest, and salary needed at every common rate. RBI-accurate. No phone number.",
  path: "/home-loan-emi-calculator",
  keywords: [
    "home loan emi calculator",
    "home loan emi calculator india",
    "home loan calculator",
    "house loan emi calculator",
    "online home loan emi calculator",
    "best home loan emi calculator",
    "home loan emi calculator services india",
  ],
});

const faqs = [
  {
    question: "How is home loan EMI calculated in India?",
    answer:
      "Indian banks use the reducing-balance EMI formula: EMI = [P × R × (1+R)^N] / [(1+R)^N − 1], where P is the principal, R is the monthly interest rate (annual ÷ 12 ÷ 100), and N is the tenure in months. The interest is calculated on the outstanding balance every month, so as you pay down the principal, the interest portion of your EMI shrinks.",
  },
  {
    question: "What is the difference between fixed and floating home loan rates?",
    answer:
      "Fixed-rate home loans keep the same interest rate for the full tenure (or a fixed number of years, after which they reset). Floating-rate loans move with the bank's reference rate, which is linked to the RBI repo rate. RBI mandates zero prepayment penalty on floating-rate home loans, so most Indian borrowers prefer floating.",
  },
  {
    question: "Does LastEMI work for all home loan amounts?",
    answer:
      "Yes. The calculator supports any amount from ₹1 lakh to ₹20 crore. We've also published dedicated landing pages for the most common loan sizes — ₹15L, ₹20L, ₹25L, ₹50L, ₹60L, ₹75L, ₹90L, and ₹1Cr — with pre-calculated EMI tables, total interest, and salary requirements for each.",
  },
  {
    question: "What's the typical home loan interest rate in India in 2026?",
    answer:
      "Top public-sector banks like SBI offer floating-rate home loans starting around 8.4–8.6% for prime borrowers. Private banks (HDFC, ICICI, Axis) range from 8.5% to 9.5%. NBFCs charge 9.5–11%. Your rate depends on your CIBIL score, employer category, loan-to-value ratio, and the bank's spread over the repo rate.",
  },
  {
    question: "Does LastEMI ask for a phone number?",
    answer:
      "No. We never capture phone numbers, never sell your data to DSAs, and never run lead-gen funnels disguised as calculators. The math runs entirely in your browser — close the tab and nothing is stored.",
  },
];

export default function HomeLoanEmiCalculatorHub() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "https://lastemi.com" },
    { name: "Home Loan EMI Calculator", url: "https://lastemi.com/home-loan-emi-calculator" },
  ]);
  const faqSchema = getFAQSchema(faqs);
  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Home Loan EMI Calculator India — LastEMI",
    url: "https://lastemi.com/home-loan-emi-calculator",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description:
      "RBI-accurate home loan EMI calculator for India. Supports any loan amount, all rates, all tenures. No phone number, no sign-up.",
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
            { name: "Home Loan EMI Calculator", href: "/home-loan-emi-calculator" },
          ]}
        />

        <h1 className="text-2xl sm:text-4xl font-bold text-foreground mt-3 mb-3">
          Home Loan EMI Calculator (India)
        </h1>
        <p className="text-muted-foreground mb-6 text-sm sm:text-base">
          Pick your loan amount below to see EMI, total interest, salary needed, and
          part-payment savings — all pre-calculated server-side using the same RBI
          reducing-balance formula your bank uses. No sign-up, no phone number, no
          spam calls.
        </p>

        <Link
          href="/?type=home"
          className="block bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-5 py-4 mb-10 text-center font-semibold shadow-sm transition-colors"
        >
          Open the Full Interactive Calculator &rarr;
          <span className="block text-xs font-normal opacity-90 mt-1">
            Adjust rate, tenure, simulate part payments live
          </span>
        </Link>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3">
            Pick Your Loan Amount
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {AMOUNTS.map((a) => {
              const emi = calculateEMI(a.amountInRupees, 9, 240);
              const totalInterest = emi * 240 - a.amountInRupees;
              return (
                <Link
                  key={a.slug}
                  href={`/home-loan-emi-calculator/${a.slug}`}
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
            All numbers shown above use 9% rate over 20-year tenure. Each page lets
            you see the matrix at 8.5% / 9% / 9.5% across 15/20/25/30 year tenures.
          </p>
        </section>

        <section className="mt-10 space-y-5 text-foreground text-sm sm:text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-foreground">
            How to Use the Home Loan EMI Calculator
          </h2>
          <p>
            Enter three numbers — loan amount, interest rate, and tenure — and
            LastEMI shows your EMI, the total interest you&apos;ll pay over the life
            of the loan, and the exact month and year your loan will end. Slide the
            inputs to see how a half-percent rate change or 5-year shorter tenure
            affects your finances. Then add a simulated part payment to see your
            new debt-free date.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            Why Most Indian EMI Calculators Get the Math Wrong
          </h2>
          <p>
            Many lead-gen sites (Bankbazaar, Paisabazaar, Bajaj Finserv) hide a
            phone-number wall behind their EMI calculator. Some apply rounding that
            shifts the EMI by ₹50–₹200 from your actual bank statement. LastEMI uses
            the standard reducing-balance formula and matches your bank&apos;s number
            to the rupee — the only variable is whether your bank uses a
            partial-period calculation in the first month based on disbursement date.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            Floating vs Fixed Rate: Pick the Right One
          </h2>
          <p>
            For most home loan borrowers in India, floating-rate loans are the
            obvious choice — RBI mandates zero prepayment penalty on them. Fixed-rate
            loans charge a 2–4% prepayment penalty, which destroys part-payment
            savings. The only case for fixed is if you expect rates to rise
            dramatically and want certainty for the next 5 years. Most fixed-rate
            home loans in India are actually &quot;fixed for first 3–5 years, then
            floating&quot; anyway.
          </p>

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
