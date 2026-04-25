import Link from "next/link";
import { calculateEMI } from "@/lib/calculations/loanCalcs";
import { formatINR } from "@/lib/utils/formatters";
import { buildMetadata } from "@/lib/seo/metadata";
import { getFAQSchema, getBreadcrumbSchema } from "@/lib/seo/schema";
import { RelatedCalculators } from "@/components/ui/RelatedCalculators";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata = buildMetadata({
  title: "Personal Loan EMI Calculator — Reducing Balance, India 2026",
  description:
    "Free personal loan EMI calculator. Compare reducing-balance vs flat-rate, see processing fee impact, and find effective interest rate. Banks charge 10.5–24% — calculate before you sign.",
  path: "/calculators/personal-loan-emi",
  keywords: [
    "personal loan emi calculator",
    "personal loan calculator india",
    "personal loan interest rate calculator",
    "instant personal loan emi calculator",
    "personal loan emi formula",
  ],
});

const SAMPLE_AMOUNT = 500_000; // 5 lakh
const RATES = [10.5, 14, 18];
const TENURES_YEARS = [1, 3, 5];

const faqs = [
  {
    question: "What is the formula for personal loan EMI?",
    answer:
      "Banks use the reducing-balance formula: EMI = [P × R × (1+R)^N] / [(1+R)^N − 1], where P is the principal, R is the monthly interest rate (annual ÷ 12 ÷ 100), and N is the tenure in months. Watch out for lenders quoting flat rate — a 'flat rate of 12%' is roughly equivalent to a reducing-balance rate of 21–22%, nearly double.",
  },
  {
    question: "What's the difference between flat rate and reducing balance?",
    answer:
      "On a flat rate loan, interest is calculated on the original principal for the entire tenure, regardless of how much you've already paid. On a reducing-balance loan, interest is calculated on the outstanding balance, which shrinks every month. For the same headline percentage, reducing-balance is dramatically cheaper. RBI requires lenders to disclose the effective reducing-balance rate (APR) — always ask for it.",
  },
  {
    question: "How does processing fee affect my effective rate?",
    answer:
      "Personal loans charge a processing fee of 1–3% of the loan amount, deducted upfront. On a ₹5 lakh loan with a 2% processing fee, you actually receive ₹4.9 lakh but repay EMI on ₹5 lakh. This bumps your effective annual rate by about 0.7–1% over the headline rate. Always compute the effective rate before comparing offers — a loan at 10.5% with 3% processing fee can be more expensive than 11.5% with zero fee.",
  },
  {
    question: "Can I prepay my personal loan?",
    answer:
      "Yes, but most lenders charge a prepayment penalty of 2–4% on the outstanding amount, especially within the first 12 months. RBI's zero-prepayment-penalty rule applies only to floating-rate home loans, not personal loans. Some private banks (HDFC, IDFC First) offer no-prepayment-penalty personal loans — read the sanction letter carefully before signing.",
  },
  {
    question: "What's a reasonable personal loan EMI for my income?",
    answer:
      "A safe rule: total EMI obligations (all loans combined) should not exceed 40% of your net monthly income. For a ₹5 lakh personal loan at 14% over 3 years, the EMI is around ₹17,100, which means your minimum take-home should be ₹42,500/month. Use our salary-to-EMI calculator for the full eligibility breakdown including existing obligations.",
  },
];

export default function PersonalLoanEmiPage() {
  const matrix = RATES.map((rate) => ({
    rate,
    emis: TENURES_YEARS.map((y) => ({ years: y, emi: calculateEMI(SAMPLE_AMOUNT, rate, y * 12) })),
  }));

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "https://lastemi.com" },
    { name: "Calculators", url: "https://lastemi.com/calculators" },
    { name: "Personal Loan EMI", url: "https://lastemi.com/calculators/personal-loan-emi" },
  ]);
  const faqSchema = getFAQSchema(faqs);
  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Personal Loan EMI Calculator — LastEMI",
    url: "https://lastemi.com/calculators/personal-loan-emi",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description:
      "Free personal loan EMI calculator with reducing-balance math, flat-rate comparison, and processing-fee impact.",
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
            { name: "Calculators", href: "/calculators" },
            { name: "Personal Loan EMI", href: "/calculators/personal-loan-emi" },
          ]}
        />

        <h1 className="text-2xl sm:text-4xl font-bold text-foreground mt-3 mb-3">
          Personal Loan EMI Calculator
        </h1>
        <p className="text-muted-foreground mb-6 text-sm sm:text-base">
          Calculate your personal loan EMI using the reducing-balance formula every
          Indian bank actually uses. Compare offers across HDFC, ICICI, Axis, SBI,
          IDFC First, and NBFCs — and see how processing fees inflate your real
          interest rate.
        </p>

        <Link
          href="/?type=personal"
          className="block bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-5 py-4 mb-10 text-center font-semibold shadow-sm transition-colors"
        >
          Open the Full Interactive Calculator &rarr;
          <span className="block text-xs font-normal opacity-90 mt-1">
            Try different amounts, rates, and tenures
          </span>
        </Link>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Sample EMI — ₹{(SAMPLE_AMOUNT / 100000).toFixed(0)} Lakh Personal Loan
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            10.5% is the floor for top-tier salaried borrowers. 14% is mid-market.
            18% is what most NBFCs charge for instant approvals.
          </p>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">Rate / Tenure</th>
                  {TENURES_YEARS.map((y) => (
                    <th key={y} className="text-right px-3 py-2 font-semibold">
                      {y} {y === 1 ? "year" : "years"}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row) => (
                  <tr key={row.rate} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{row.rate}%</td>
                    {row.emis.map((c) => (
                      <td key={c.years} className="text-right px-3 py-2">
                        {formatINR(c.emi)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 space-y-5 text-foreground text-sm sm:text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-foreground">
            The Flat Rate Trap (Most Borrowers Miss This)
          </h2>
          <p>
            Some lenders, especially small NBFCs and consumer durable financiers,
            quote a flat rate. A flat rate of 12% sounds reasonable until you
            realize it&apos;s charged on the original loan amount for the full
            tenure — even though your outstanding shrinks every month. The
            equivalent reducing-balance rate is roughly{" "}
            <strong>1.8× the flat rate</strong>, so a 12% flat rate is closer to a
            21–22% reducing-balance rate. Always ask for the APR (effective annual
            rate) — RBI requires disclosure.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            Processing Fee: The Hidden 0.7–1% Rate Hike
          </h2>
          <p>
            Personal loans charge a processing fee of 1–3% upfront. On a ₹5 lakh
            loan with a 2% fee, you receive ₹4.9 lakh but pay EMI on ₹5 lakh — your
            effective rate is roughly 0.7% higher than the headline number. When
            comparing two offers, always compute: total interest paid + processing
            fee, divided by amount actually received, divided by tenure in years.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            When a Personal Loan Is the Wrong Choice
          </h2>
          <p>
            Personal loans are the most expensive form of unsecured borrowing in
            India. Before signing, check if any of these alternatives apply: gold
            loan (8–12%, secured against your gold), loan against fixed deposit
            (1–2% above FD rate), loan against mutual funds (9–10%), top-up home
            loan (8.5–10% if you have an existing home loan), or even a credit-card
            EMI conversion (often 14–16% for short tenures). Only take a personal
            loan when other options aren&apos;t viable.
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
