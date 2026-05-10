import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { calculateEMI } from "@/lib/calculations/loanCalcs";
import { formatINR, formatLakhs } from "@/lib/utils/formatters";
import { buildMetadata } from "@/lib/seo/metadata";
import { getFAQSchema, getBreadcrumbSchema } from "@/lib/seo/schema";
import { RelatedCalculators } from "@/components/ui/RelatedCalculators";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LoanCalculatorTool } from "@/features/loan-calculator/LoanCalculatorTool";
import { AmountSiblingNav } from "@/components/ui/AmountSiblingNav";
import { LastReviewed } from "@/components/ui/LastReviewed";

// Single source of truth for when this template's content was last
// human-verified for accuracy. Bump whenever rates, lender bands, or
// RBI rules covered on these pages change.
const LAST_REVIEWED = "2026-05-10";

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

  // Tenure-specific FAQ entries — generated from real EMI math at 8.5%
  // for the page's specific amount. These target the long-tail queries
  // GSC shows borrowers actually search for (e.g. "1 crore home loan emi
  // for 20 years" — 7 impressions/month at position 60).
  const refRate = 8.5;
  const emi10 = calculateEMI(config.amountInRupees, refRate, 120);
  const emi15 = calculateEMI(config.amountInRupees, refRate, 180);
  const emi20 = calculateEMI(config.amountInRupees, refRate, 240);
  const emi25 = calculateEMI(config.amountInRupees, refRate, 300);
  const emi30 = calculateEMI(config.amountInRupees, refRate, 360);
  const int10 = emi10 * 120 - config.amountInRupees;
  const int15 = emi15 * 180 - config.amountInRupees;
  const int20 = emi20 * 240 - config.amountInRupees;
  const int25 = emi25 * 300 - config.amountInRupees;
  const int30 = emi30 * 360 - config.amountInRupees;

  const faqs = [
    {
      question: `What is the EMI on a ₹${config.displayLabel} home loan for 30 years?`,
      answer: `At 8.5% interest, the EMI on a ₹${config.displayLabel} home loan for 30 years is ${formatINR(emi30)}. Total interest over the full tenure works out to ${formatLakhs(int30)}, which is roughly ${Math.round((int30 / config.amountInRupees) * 100)}% of the principal. 30 years gives you the lowest monthly EMI but the highest interest cost overall.`,
    },
    {
      question: `What is the EMI on a ₹${config.displayLabel} home loan for 25 years?`,
      answer: `EMI at 8.5% over 25 years comes to ${formatINR(emi25)}. You'll pay ${formatLakhs(int25)} in total interest, which is ${formatLakhs(int30 - int25)} less than what a 30-year tenure costs. Most borrowers don't realise how much that small difference in tenure saves over the long run.`,
    },
    {
      question: `What is the EMI on a ₹${config.displayLabel} home loan for 20 years?`,
      answer: `For 20 years at 8.5%, the EMI is ${formatINR(emi20)} and total interest is ${formatLakhs(int20)}. This is the most common tenure choice for first-time buyers in India — it balances a manageable EMI with sensible interest cost.`,
    },
    {
      question: `What is the EMI on a ₹${config.displayLabel} home loan for 15 years?`,
      answer: `15 years at 8.5% gives you an EMI of ${formatINR(emi15)} and total interest of ${formatLakhs(int15)}. That's ${formatLakhs(int20 - int15)} less interest than the 20-year option. If your salary supports the higher monthly outgo, 15 years is almost always the better pick on paper.`,
    },
    {
      question: `What is the EMI on a ₹${config.displayLabel} home loan for 10 years?`,
      answer: `A 10-year tenure at 8.5% means an EMI of ${formatINR(emi10)} and total interest of just ${formatLakhs(int10)}. The monthly payment is steep, but you finish the loan in a third of the time of a 30-year tenure and save nearly ${formatLakhs(int30 - int10)} in interest. Best suited for borrowers in the second half of their career.`,
    },
    {
      question: `Should I pick 20 years or 30 years for a ₹${config.displayLabel} home loan?`,
      answer: `30 years gives you a smaller EMI (${formatINR(emi30)} vs ${formatINR(emi20)}) but you end up paying ${formatLakhs(int30 - int20)} more in interest over the loan's life. The Section 24(b) tax benefit is capped at ₹2 lakh of interest per year regardless of how long your tenure is, so dragging the loan out doesn't translate into a bigger tax shield. If your cash flow handles the 20-year EMI without strain, take the shorter tenure.`,
    },
    {
      question: `What salary do I need for a ₹${config.displayLabel} home loan?`,
      answer: `Banks typically cap your EMI at 40-50% of your net monthly take-home (the FOIR rule). For a ₹${config.displayLabel} loan at 9% over 20 years, the EMI is around ${formatINR(headlineEmi)}, which means a take-home of about ${formatINR(minMonthlyIncome)} or higher gets you through. Existing EMIs eat directly into that ceiling, so closing a personal loan or car loan before applying can meaningfully boost your eligibility.`,
    },
    {
      question: `Can I prepay my ₹${config.displayLabel} home loan without penalty?`,
      answer: `Yes. RBI rules prohibit prepayment penalty on floating-rate home loans for individual borrowers. You can make a part payment of any size, any time, with no extra charge. For a ₹${config.displayLabel} loan, even a 10% part payment in year 3 can save you over ${formatLakhs(interestSaved)} in interest and shorten the tenure by roughly ${Math.round(monthsSaved / 12)} years.`,
    },
    {
      question: `Is it better to reduce EMI or tenure after a part payment?`,
      answer: `Almost always tenure. Keeping the EMI fixed and shortening tenure means you knock off the highest-interest months at the end of the loan, which is where total interest savings come from. Reducing EMI feels nicer in your monthly cash flow but you keep paying interest for the full original tenure. Most banks default to the tenure option unless you specifically ask in writing for the EMI to drop.`,
    },
    {
      question: `How is the EMI on a home loan actually calculated?`,
      answer: `Indian banks use the standard reducing-balance formula: EMI = [P × R × (1+R)^N] / [(1+R)^N − 1]. P is the principal (₹${config.displayLabel} in your case), R is the monthly interest rate (annual rate ÷ 12 ÷ 100), and N is the tenure in months. This calculator uses the same formula, so the EMI shown matches your bank statement to the rupee.`,
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

        <div className="mt-3 mb-3">
          <LastReviewed date={LAST_REVIEWED} />
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-3">
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

        {/* Live calculator pre-set to this page's specific amount @ 9% / 20yr.
            Loan type locked since the URL fixes the amount and the page
            identity is home-loan-specific. Users can change rate, tenure,
            and simulate part-payments freely without leaving the page. */}
        <div className="mb-6">
          <LoanCalculatorTool
            initial={{
              loanType: "home",
              amount: config.amountInRupees,
              rate: 9,
              tenure: 20,
            }}
            lockType
          />
        </div>

        {/* Inline "Save this calculation" callout — non-sticky to avoid
            UX clash with each amount page's own structure. The homepage's
            sticky bar serves the same purpose for the universal calculator. */}
        <div className="mb-10 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-foreground">
            Track this ₹{config.displayLabel} loan in your dashboard — see
            real-time payoff progress, log part-payments, get RBI rate alerts.
          </p>
          <Link
            href="/login?ref=amount-page&save=true"
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-3 py-1.5 text-sm font-medium transition-colors flex-shrink-0"
          >
            Save to dashboard &rarr;
          </Link>
        </div>

        {/* Sibling amount navigation — lets users hop between common
            home loan amounts without bouncing through the hub. */}
        <AmountSiblingNav
          basePath="/home-loan-emi-calculator"
          currentSlug={config.slug}
          amounts={AMOUNTS.map((a) => ({ slug: a.slug, label: a.displayLabel }))}
          hubHref="/home-loan-emi-calculator"
        />

        {/* EMI matrix — kept as a static reference table users can scan
            without interacting. Useful for "I just want to see all my
            options at a glance". */}
        <section className="mt-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3">
            Quick reference — EMI for ₹{config.displayLabel} at common rates and tenures
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
          <a
            href="#amortization-table"
            className="inline-flex items-center gap-1.5 bg-positive hover:bg-positive/90 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
          >
            Simulate part payments above &uarr;
          </a>
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
            EMI for ₹{config.displayLabel} at Every Common Tenure
          </h2>
          <p>
            All numbers below assume an 8.5% floating rate (the rough floor for
            prime salaried borrowers in 2026). Notice how dropping the tenure
            from 30 years to 20 years pushes the EMI up by about
            {" "}{formatINR(emi20 - emi30)}, but cuts your total interest cost by
            roughly {formatLakhs(int30 - int20)}.
          </p>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold text-foreground">Tenure</th>
                  <th className="text-right px-3 py-2 font-semibold text-foreground">EMI</th>
                  <th className="text-right px-3 py-2 font-semibold text-foreground">Total Interest</th>
                  <th className="text-right px-3 py-2 font-semibold text-foreground">Total Payment</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { years: 10, emi: emi10, interest: int10 },
                  { years: 15, emi: emi15, interest: int15 },
                  { years: 20, emi: emi20, interest: int20 },
                  { years: 25, emi: emi25, interest: int25 },
                  { years: 30, emi: emi30, interest: int30 },
                ].map((row) => (
                  <tr key={row.years} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{row.years} years</td>
                    <td className="text-right px-3 py-2">{formatINR(row.emi)}</td>
                    <td className="text-right px-3 py-2">{formatLakhs(row.interest)}</td>
                    <td className="text-right px-3 py-2">{formatLakhs(row.interest + config.amountInRupees)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-semibold text-foreground">
            Where the Rate on a ₹{config.displayLabel} Home Loan Comes From in 2026
          </h2>
          <p>
            The rate your bank quotes is the RBI repo rate plus a spread the
            lender chooses based on your CIBIL score, employer category, and the
            loan-to-value ratio. As of mid-2026, indicative bands look like this:
          </p>
          <ul className="list-disc list-inside space-y-1.5">
            <li>
              <strong>Public sector banks</strong> — SBI, PNB, BoB, Canara: 8.40% to 8.75%
              for prime borrowers. Government employees and PSU staff get the
              floor.
            </li>
            <li>
              <strong>Top private banks</strong> — HDFC, ICICI, Axis, Kotak: 8.55% to 9.10%.
              The lower end requires CIBIL above 750 and an approved-employer tag.
            </li>
            <li>
              <strong>Housing finance NBFCs</strong> — LIC HF, Bajaj Housing Finance:
              9.00% to 9.50%. Easier approval but the spread costs you.
            </li>
          </ul>
          <p>
            On a ₹{config.displayLabel} loan, the difference between an 8.5% and a
            9.0% rate over 20 years adds up. EMI moves from {formatINR(emi20)} to{" "}
            {formatINR(calculateEMI(config.amountInRupees, 9, 240))}, and total
            interest grows by{" "}
            {formatLakhs(
              calculateEMI(config.amountInRupees, 9, 240) * 240 -
                config.amountInRupees -
                int20,
            )}{" "}
            over the loan's life. Always negotiate the spread before signing — a
            0.25% improvement is usually possible if your profile is clean.
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
