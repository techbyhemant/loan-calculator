import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { calculateEMI } from "@/lib/calculations/loanCalcs";
import { formatINR, formatLakhs } from "@/lib/utils/formatters";
import { buildMetadata } from "@/lib/seo/metadata";
import { getFAQSchema, getBreadcrumbSchema } from "@/lib/seo/schema";
import { RelatedCalculators } from "@/components/ui/RelatedCalculators";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

// ─── Programmatic SEO config ─────────────────────────
// One template, 8 statically-generated pages. Targets long-tail
// "₹X lakh home loan EMI calculator" queries (5K–25K searches/mo each).

interface AmountConfig {
  slug: string;
  amountInRupees: number;
  displayLabel: string; // "15 Lakh", "1 Crore"
  shortLabel: string; // "15L", "1Cr"
}

const AMOUNTS: AmountConfig[] = [
  { slug: "15-lakh", amountInRupees: 1_500_000, displayLabel: "15 Lakh", shortLabel: "15L" },
  { slug: "20-lakh", amountInRupees: 2_000_000, displayLabel: "20 Lakh", shortLabel: "20L" },
  { slug: "25-lakh", amountInRupees: 2_500_000, displayLabel: "25 Lakh", shortLabel: "25L" },
  { slug: "50-lakh", amountInRupees: 5_000_000, displayLabel: "50 Lakh", shortLabel: "50L" },
  { slug: "60-lakh", amountInRupees: 6_000_000, displayLabel: "60 Lakh", shortLabel: "60L" },
  { slug: "75-lakh", amountInRupees: 7_500_000, displayLabel: "75 Lakh", shortLabel: "75L" },
  { slug: "90-lakh", amountInRupees: 9_000_000, displayLabel: "90 Lakh", shortLabel: "90L" },
  { slug: "1-crore", amountInRupees: 10_000_000, displayLabel: "1 Crore", shortLabel: "1Cr" },
];

// Common rate scenarios borrowers see in 2026
const RATES = [8.5, 9.0, 9.5];
// Common tenure options
const TENURES_YEARS = [15, 20, 25, 30];

export function generateStaticParams() {
  return AMOUNTS.map((a) => ({ amount: a.slug }));
}

function getConfig(slug: string): AmountConfig | undefined {
  return AMOUNTS.find((a) => a.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ amount: string }>;
}): Promise<Metadata> {
  const { amount } = await params;
  const config = getConfig(amount);
  if (!config) return {};

  return buildMetadata({
    title: `₹${config.displayLabel} Home Loan EMI Calculator — All Tenures, All Rates`,
    description: `Calculate EMI for a ₹${config.displayLabel} home loan at 8.5%, 9%, and 9.5% over 15, 20, 25, 30 years. See total interest, salary needed, and how part payments cut years off your tenure. Free, no sign-up.`,
    path: `/home-loan-emi-calculator/${config.slug}`,
    keywords: [
      `${config.shortLabel.toLowerCase()} home loan emi`,
      `${config.displayLabel.toLowerCase()} home loan emi calculator`,
      `${config.displayLabel.toLowerCase()} home loan emi`,
      `home loan ${config.displayLabel.toLowerCase()}`,
      `emi for ${config.displayLabel.toLowerCase()} home loan`,
      `${config.displayLabel.toLowerCase()} loan emi calculator india`,
    ],
  });
}

export default async function AmountLandingPage({
  params,
}: {
  params: Promise<{ amount: string }>;
}) {
  const { amount } = await params;
  const config = getConfig(amount);
  if (!config) notFound();

  // Server-side EMI matrix — real numbers, indexable as text content
  type Cell = { tenureYears: number; rate: number; emi: number; totalInterest: number; totalPayment: number };
  const matrix: Cell[] = [];
  for (const rate of RATES) {
    for (const years of TENURES_YEARS) {
      const months = years * 12;
      const emi = calculateEMI(config.amountInRupees, rate, months);
      const totalPayment = emi * months;
      const totalInterest = totalPayment - config.amountInRupees;
      matrix.push({ tenureYears: years, rate, emi, totalInterest, totalPayment });
    }
  }

  // Salary required (rule of thumb: EMI ≤ 50% of net monthly income).
  // We pick a representative scenario (9% / 20yr) for the headline number.
  const headlineEmi = calculateEMI(config.amountInRupees, 9.0, 20 * 12);
  const minMonthlyIncome = headlineEmi * 2;
  const minAnnualIncome = minMonthlyIncome * 12;

  // Part payment savings example (real math)
  const baseTotalInterest =
    calculateEMI(config.amountInRupees, 9.0, 20 * 12) * 20 * 12 - config.amountInRupees;
  const partPayment = config.amountInRupees * 0.1; // 10% part payment in year 3
  const newPrincipal = config.amountInRupees - partPayment;
  // Quick approximation of interest saved (use original EMI, recompute tenure)
  const monthlyRate = 9.0 / 12 / 100;
  const newTenureMonths =
    Math.log(headlineEmi / (headlineEmi - newPrincipal * monthlyRate)) /
    Math.log(1 + monthlyRate);
  const newTotalInterest = headlineEmi * newTenureMonths - newPrincipal;
  const interestSaved = Math.max(0, baseTotalInterest - newTotalInterest);
  const monthsSaved = Math.max(0, 20 * 12 - newTenureMonths);

  const faqs = [
    {
      question: `What is the EMI for a ₹${config.displayLabel} home loan?`,
      answer: `The EMI for a ₹${config.displayLabel} home loan depends on the interest rate and tenure. At 9% for 20 years, the EMI is approximately ${formatINR(calculateEMI(config.amountInRupees, 9, 240))}. At 8.5% for 30 years, it drops to ${formatINR(calculateEMI(config.amountInRupees, 8.5, 360))}. Use the calculator on the homepage to see your exact EMI for any rate and tenure combination.`,
    },
    {
      question: `What salary do I need for a ₹${config.displayLabel} home loan?`,
      answer: `As a thumb rule, your EMI should not exceed 50% of your net monthly income. For a ₹${config.displayLabel} loan at 9% for 20 years, the EMI is around ${formatINR(headlineEmi)}, which means your minimum monthly take-home should be about ${formatINR(minMonthlyIncome)} (annual income of around ${formatINR(minAnnualIncome)}). Banks typically use a similar FOIR (Fixed Obligations to Income Ratio) of 40-50% when assessing eligibility.`,
    },
    {
      question: `Can I prepay my ₹${config.displayLabel} home loan without penalty?`,
      answer: `Yes. RBI mandates that floating-rate home loans in India have zero prepayment penalty. You can make part payments any time and reduce either your tenure or your EMI. For a ₹${config.displayLabel} loan, even a 10% part payment in year 3 can save you over ${formatLakhs(interestSaved)} in interest and cut around ${Math.round(monthsSaved / 12)} years off your tenure.`,
    },
    {
      question: `Is it better to reduce EMI or tenure after part payment?`,
      answer: `Reducing tenure almost always saves more interest because you pay off principal faster. Reducing EMI improves monthly cash flow but you continue paying interest for the original tenure. For most ₹${config.displayLabel} borrowers, keeping the EMI the same and shortening tenure is the math-optimal choice.`,
    },
    {
      question: `How is the EMI calculated for a home loan?`,
      answer: `The standard formula is EMI = [P × R × (1+R)^N] / [(1+R)^N − 1], where P is the principal (₹${config.displayLabel} in your case), R is the monthly interest rate (annual rate ÷ 12 ÷ 100), and N is the tenure in months. This is the same reducing-balance formula every Indian bank uses, so your EMI will match your bank statement to the rupee.`,
    },
  ];

  const faqSchema = getFAQSchema(faqs);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "https://lastemi.com" },
    { name: "Home Loan EMI Calculator", url: "https://lastemi.com/home-loan-emi-calculator" },
    { name: `₹${config.displayLabel}`, url: `https://lastemi.com/home-loan-emi-calculator/${config.slug}` },
  ]);
  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `₹${config.displayLabel} Home Loan EMI Calculator`,
    url: `https://lastemi.com/home-loan-emi-calculator/${config.slug}`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description: `Free EMI calculator for a ₹${config.displayLabel} home loan. Compare EMI across all rates and tenures, see total interest, find your debt-free date.`,
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
            { name: `₹${config.displayLabel}`, href: `/home-loan-emi-calculator/${config.slug}` },
          ]}
        />

        <h1 className="text-2xl sm:text-4xl font-bold text-foreground mt-3 mb-3">
          ₹{config.displayLabel} Home Loan EMI Calculator
        </h1>
        <p className="text-muted-foreground mb-6 text-sm sm:text-base">
          The exact EMI for a ₹{config.displayLabel} home loan at every common interest
          rate and tenure — calculated with the same RBI-aligned reducing-balance
          formula your bank uses. Free, no sign-up, no phone number.
        </p>

        {/* Headline numbers */}
        <section className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">EMI (9%, 20 yrs)</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{formatINR(headlineEmi)}</p>
            <p className="text-xs text-muted-foreground mt-1">per month</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Interest</p>
            <p className="text-xl sm:text-2xl font-bold text-warning mt-1">{formatLakhs(baseTotalInterest)}</p>
            <p className="text-xs text-muted-foreground mt-1">over 20 years</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 col-span-2 sm:col-span-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Min. Salary Needed</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{formatINR(minMonthlyIncome)}</p>
            <p className="text-xs text-muted-foreground mt-1">net monthly income</p>
          </div>
        </section>

        {/* Primary CTA to interactive calculator */}
        <Link
          href={`/?amount=${config.amountInRupees}&type=home`}
          className="block bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-5 py-4 mb-10 text-center font-semibold shadow-sm transition-colors"
        >
          Open the Full Interactive Calculator &rarr;
          <span className="block text-xs font-normal opacity-90 mt-1">
            Adjust rate, tenure, and simulate part payments live
          </span>
        </Link>

        {/* EMI matrix */}
        <section className="mt-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3">
            EMI for ₹{config.displayLabel} at Different Rates and Tenures
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Each cell shows your monthly EMI. Pick the closest combination to what
            your bank has offered.
          </p>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold text-foreground">Rate / Tenure</th>
                  {TENURES_YEARS.map((y) => (
                    <th key={y} className="text-right px-3 py-2 font-semibold text-foreground">
                      {y} yrs
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RATES.map((rate) => (
                  <tr key={rate} className="border-t border-border">
                    <td className="px-3 py-2 font-medium text-foreground">{rate}%</td>
                    {TENURES_YEARS.map((years) => {
                      const cell = matrix.find((c) => c.rate === rate && c.tenureYears === years)!;
                      return (
                        <td key={years} className="text-right px-3 py-2 text-foreground">
                          {formatINR(cell.emi)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Total interest paid */}
        <section className="mt-10">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3">
            Total Interest You&apos;ll Pay on a ₹{config.displayLabel} Loan
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            The EMI is the same every month, but interest is heavily front-loaded.
            Here&apos;s the total interest cost for each tenure at 9% — the longer the
            tenure, the more you pay overall.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {TENURES_YEARS.map((years) => {
              const cell = matrix.find((c) => c.rate === 9.0 && c.tenureYears === years)!;
              return (
                <div key={years} className="bg-card border border-border rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">{years}-year tenure</p>
                  <p className="text-base font-semibold text-foreground mt-1">
                    EMI {formatINR(cell.emi)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total interest:{" "}
                    <span className="font-semibold text-warning">
                      {formatLakhs(cell.totalInterest)}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Part payment story */}
        <section className="mt-10 rounded-xl border border-positive/30 bg-positive/5 p-5">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            One Part Payment Could Save You {formatLakhs(interestSaved)}
          </h2>
          <p className="text-sm text-foreground leading-relaxed mb-3">
            Take this ₹{config.displayLabel} loan at 9% for 20 years. If you make a
            single part payment of {formatLakhs(partPayment)} (10% of the principal) in
            year 3 — say, from your bonus — you&apos;d save{" "}
            <strong className="text-positive">{formatLakhs(interestSaved)}</strong> in
            interest and become debt-free roughly{" "}
            <strong className="text-positive">{Math.round(monthsSaved / 12)} years</strong>{" "}
            sooner. RBI rules mean zero prepayment penalty on floating-rate home loans.
          </p>
          <Link
            href={`/?amount=${config.amountInRupees}&type=home`}
            className="inline-flex items-center gap-1.5 bg-positive hover:bg-positive/90 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
          >
            Simulate part payments on this loan &rarr;
          </Link>
        </section>

        {/* SEO body copy */}
        <section className="mt-10 space-y-5 text-foreground text-sm sm:text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-foreground">
            How the EMI is Calculated for a ₹{config.displayLabel} Home Loan
          </h2>
          <p>
            Every Indian bank uses the same reducing-balance EMI formula:{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
              EMI = [P × R × (1+R)^N] / [(1+R)^N − 1]
            </code>
            . For a ₹{config.displayLabel} loan, P = {formatINR(config.amountInRupees)},
            R is your monthly rate (annual ÷ 12 ÷ 100), and N is your tenure in months.
            That means an 8.5% rate gives you a monthly R of 0.7083% and a 240-month
            tenure for a 20-year loan.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            Salary You Need for a ₹{config.displayLabel} Home Loan
          </h2>
          <p>
            Most banks limit your total EMI obligations to 40–50% of your net monthly
            income (FOIR). For a ₹{config.displayLabel} loan at 9% over 20 years, the
            EMI of {formatINR(headlineEmi)} means you typically need a take-home of at
            least {formatINR(minMonthlyIncome)}/month — roughly an annual gross income
            of {formatINR(minAnnualIncome * 1.3)} after factoring in deductions and
            other obligations. Use our{" "}
            <Link href="/calculators/home-loan-eligibility" className="text-primary underline">
              home loan eligibility calculator
            </Link>{" "}
            for a precise number based on your salary, age, and existing EMIs.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            Tax Benefits Available on This Loan
          </h2>
          <p>
            Under Section 24(b), you can claim up to ₹2,00,000 per year on home loan
            interest paid (self-occupied property, old tax regime). Under Section 80C,
            principal repayment up to ₹1,50,000 is deductible. For a ₹
            {config.displayLabel} loan in early years where interest dominates the EMI,
            the Section 24 cap will likely be the binding limit. Run the numbers in our{" "}
            <Link href="/calculators/tax-benefit" className="text-primary underline">
              tax benefit calculator
            </Link>
            .
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
