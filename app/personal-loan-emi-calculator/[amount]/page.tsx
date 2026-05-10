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

// ─── Programmatic SEO config ─────────────────────────
// One template, 6 statically-generated pages targeting long-tail
// "₹X lakh personal loan EMI calculator" queries. GSC validated demand
// (~30 imp/90d across 12 unique queries) before this batch was built.

interface AmountConfig {
  slug: string;
  amountInRupees: number;
  displayLabel: string;
  shortLabel: string;
}

const AMOUNTS: AmountConfig[] = [
  { slug: "1-lakh", amountInRupees: 100_000, displayLabel: "1 Lakh", shortLabel: "1L" },
  { slug: "2-lakh", amountInRupees: 200_000, displayLabel: "2 Lakh", shortLabel: "2L" },
  { slug: "3-lakh", amountInRupees: 300_000, displayLabel: "3 Lakh", shortLabel: "3L" },
  { slug: "5-lakh", amountInRupees: 500_000, displayLabel: "5 Lakh", shortLabel: "5L" },
  { slug: "10-lakh", amountInRupees: 1_000_000, displayLabel: "10 Lakh", shortLabel: "10L" },
  { slug: "20-lakh", amountInRupees: 2_000_000, displayLabel: "20 Lakh", shortLabel: "20L" },
];

// Personal loan rate scenarios — wider band than home loans because the
// segment spans top-tier salaried (10.5%) all the way to NBFC subprime (24%).
const RATES = [11, 14, 18];
// Typical personal loan tenures (banks cap at 5-7 years for most products).
const TENURES_YEARS = [1, 2, 3, 5, 7];

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
    title: `₹${config.displayLabel} Personal Loan EMI Calculator — All Tenures, All Rates`,
    description: `Calculate EMI for a ₹${config.displayLabel} personal loan at 11%, 14%, and 18% over 1-7 years. See total interest, processing fee impact, and how foreclosure compares to letting the loan run. Free, no sign-up.`,
    path: `/personal-loan-emi-calculator/${config.slug}`,
    keywords: [
      `${config.shortLabel.toLowerCase()} personal loan emi`,
      `${config.displayLabel.toLowerCase()} personal loan emi calculator`,
      `${config.displayLabel.toLowerCase()} personal loan emi`,
      `personal loan ${config.displayLabel.toLowerCase()}`,
      `emi for ${config.displayLabel.toLowerCase()} personal loan`,
      `${config.displayLabel.toLowerCase()} loan emi calculator india`,
    ],
  });
}

export default async function PersonalLoanAmountPage({
  params,
}: {
  params: Promise<{ amount: string }>;
}) {
  const { amount } = await params;
  const config = getConfig(amount);
  if (!config) notFound();

  // Server-side EMI matrix
  type Cell = { tenureYears: number; rate: number; emi: number; totalInterest: number };
  const matrix: Cell[] = [];
  for (const rate of RATES) {
    for (const years of TENURES_YEARS) {
      const months = years * 12;
      const emi = calculateEMI(config.amountInRupees, rate, months);
      const totalInterest = emi * months - config.amountInRupees;
      matrix.push({ tenureYears: years, rate, emi, totalInterest });
    }
  }

  // Headline scenario: 14% / 5 years (mid-market default)
  const headlineEmi = calculateEMI(config.amountInRupees, 14, 60);
  const headlineInterest = headlineEmi * 60 - config.amountInRupees;
  const minMonthlyIncome = headlineEmi * 2; // 50% FOIR rule

  // Tenure-specific EMIs at 14% reference rate
  const refRate = 14;
  const emi1 = calculateEMI(config.amountInRupees, refRate, 12);
  const emi2 = calculateEMI(config.amountInRupees, refRate, 24);
  const emi3 = calculateEMI(config.amountInRupees, refRate, 36);
  const emi5 = calculateEMI(config.amountInRupees, refRate, 60);
  const emi7 = calculateEMI(config.amountInRupees, refRate, 84);
  const int1 = emi1 * 12 - config.amountInRupees;
  const int2 = emi2 * 24 - config.amountInRupees;
  const int3 = emi3 * 36 - config.amountInRupees;
  const int5 = emi5 * 60 - config.amountInRupees;
  const int7 = emi7 * 84 - config.amountInRupees;

  // Processing fee impact (typical 2% for personal loans)
  const processingFeePct = 2;
  const processingFeeAmount = config.amountInRupees * (processingFeePct / 100);
  const gstOnFee = processingFeeAmount * 0.18;
  const totalProcessingCost = processingFeeAmount + gstOnFee;
  // Effective rate after factoring in processing fee on a 5-year loan
  const totalCost5yr = headlineEmi * 60;
  const effectiveCost5yr = totalCost5yr + totalProcessingCost;

  const faqs = [
    {
      question: `What is the EMI on a ₹${config.displayLabel} personal loan for 5 years?`,
      answer: `At 14% interest (a typical mid-market rate), the EMI on a ₹${config.displayLabel} personal loan for 5 years is ${formatINR(emi5)}. Total interest over the tenure works out to ${formatLakhs(int5)}. Add a 2% processing fee plus 18% GST and the real cost goes up by ${formatINR(totalProcessingCost)} on day one, before the first EMI even hits.`,
    },
    {
      question: `What is the EMI on a ₹${config.displayLabel} personal loan for 3 years?`,
      answer: `At 14%, a 3-year tenure gives an EMI of ${formatINR(emi3)} and total interest of ${formatLakhs(int3)}. Compared to 5 years, you save ${formatLakhs(int5 - int3)} in interest. Most banks prefer 3-5 year tenures for personal loans because shorter tenure means lower default risk for them.`,
    },
    {
      question: `What is the EMI on a ₹${config.displayLabel} personal loan for 2 years?`,
      answer: `At 14%, a 2-year EMI is ${formatINR(emi2)} with total interest of just ${formatLakhs(int2)}. The monthly payment is steep, but you finish the loan in less than half the time of a 5-year option and save nearly ${formatLakhs(int5 - int2)} in interest. Best when you have a clear path to repaying — say, an upcoming bonus or maturity.`,
    },
    {
      question: `What is the EMI on a ₹${config.displayLabel} personal loan for 1 year?`,
      answer: `A 12-month tenure at 14% means an EMI of ${formatINR(emi1)} and total interest of only ${formatLakhs(int1)}. This is essentially using the personal loan as a bridging instrument — useful when you need cash now and have certain repayment capacity coming. If you can manage a 1-year EMI, you'd usually be better off saving and avoiding the loan altogether.`,
    },
    {
      question: `What salary do I need for a ₹${config.displayLabel} personal loan?`,
      answer: `Banks cap your total EMIs at 50-55% of your net monthly take-home (FOIR). For a ₹${config.displayLabel} loan at 14% over 5 years, the EMI is ${formatINR(emi5)}, which means a net monthly income of at least ${formatINR(minMonthlyIncome)} typically gets you through. Existing EMIs (credit card, car loan, other personal loans) eat into that ceiling, so closing them before you apply meaningfully boosts your eligibility.`,
    },
    {
      question: `Should I pick 3 years or 5 years for a ₹${config.displayLabel} personal loan?`,
      answer: `5 years gives you a smaller EMI (${formatINR(emi5)} vs ${formatINR(emi3)}) but you pay ${formatLakhs(int5 - int3)} more in interest. Personal loans don't qualify for any tax deduction, so there's no Section 24-style cap working in your favour with longer tenure. If your monthly cash flow handles the 3-year EMI, that's the better pick. The shorter the tenure, the lower the cumulative interest cost.`,
    },
    {
      question: `What is the processing fee on a ₹${config.displayLabel} personal loan?`,
      answer: `Most Indian banks charge 1-3% as processing fee, plus 18% GST on the fee. For a ₹${config.displayLabel} loan at the 2% bank rate, that comes to ${formatINR(processingFeeAmount)} fee + ${formatINR(gstOnFee)} GST = ${formatINR(totalProcessingCost)} total upfront cost. This is deducted from your loan disbursement (you receive ${formatINR(config.amountInRupees - totalProcessingCost)} but you owe interest on the full ${formatINR(config.amountInRupees)}). Always factor this into the real cost of borrowing.`,
    },
    {
      question: `Can I prepay a ₹${config.displayLabel} personal loan?`,
      answer: `Yes, but unlike home loans, personal loans typically carry a 2-5% prepayment penalty on the outstanding amount. Some banks waive this after 12 EMIs are paid; some don't. Read your sanction letter carefully. If you have a windfall, it's still usually worth prepaying — even with a 4% penalty, the interest you save over the remaining tenure usually beats the penalty cost. Run the math on our ${"calculator above"} before signing the prepayment cheque.`,
    },
    {
      question: `How does a ₹${config.displayLabel} personal loan compare to a credit card balance?`,
      answer: `Credit card debt at 36-42% APR is dramatically more expensive than a personal loan at 11-18%. If you have a ₹${config.displayLabel} balance running on a card, transferring it to a personal loan can save you 20+ percentage points in annualised cost. Even with the personal loan's 2% processing fee, the breakeven is usually within 4-6 months. The mistake to avoid is taking a personal loan AND continuing to spend on the card — you end up with both debts.`,
    },
    {
      question: `Are there any tax benefits on a personal loan?`,
      answer: `Personal loans don't qualify for any direct tax deduction in India. Section 24(b) interest deduction is restricted to home loans, Section 80C principal repayment is also home-loan-only, and Section 80E covers only education loans. The sole exception: if you can prove the personal loan was used specifically for business expansion, the interest may be deductible against business income — but this needs documentary proof and only applies to self-employed borrowers.`,
    },
  ];

  const faqSchema = getFAQSchema(faqs);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "https://lastemi.com" },
    {
      name: "Personal Loan EMI Calculator",
      url: "https://lastemi.com/personal-loan-emi-calculator",
    },
    {
      name: `₹${config.displayLabel}`,
      url: `https://lastemi.com/personal-loan-emi-calculator/${config.slug}`,
    },
  ]);
  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `₹${config.displayLabel} Personal Loan EMI Calculator`,
    url: `https://lastemi.com/personal-loan-emi-calculator/${config.slug}`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description: `Free EMI calculator for a ₹${config.displayLabel} personal loan. Compare EMI across all rates and tenures, factor in processing fees, see total cost.`,
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
            { name: `₹${config.displayLabel}`, href: `/personal-loan-emi-calculator/${config.slug}` },
          ]}
        />

        <h1 className="text-2xl sm:text-4xl font-bold text-foreground mt-3 mb-3">
          ₹{config.displayLabel} Personal Loan EMI Calculator
        </h1>
        <p className="text-muted-foreground mb-6 text-sm sm:text-base">
          See your EMI, total interest, and the real cost of a ₹{config.displayLabel} personal
          loan after factoring in the 2% processing fee and 18% GST. Adjust rate and
          tenure to match your bank&apos;s offer.
        </p>

        {/* At-a-glance numbers — what someone Googling this query wants
            to see in the snippet */}
        <section className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">EMI at 14% / 5 yrs</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{formatINR(headlineEmi)}</p>
            <p className="text-xs text-muted-foreground mt-1">per month</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Interest</p>
            <p className="text-xl sm:text-2xl font-bold text-warning mt-1">{formatLakhs(headlineInterest)}</p>
            <p className="text-xs text-muted-foreground mt-1">over 5 years</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 col-span-2 sm:col-span-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Min. Salary Needed</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{formatINR(minMonthlyIncome)}</p>
            <p className="text-xs text-muted-foreground mt-1">net monthly income</p>
          </div>
        </section>

        {/* Live calculator pre-set to this page's specific amount */}
        <div className="mb-10">
          <LoanCalculatorTool
            initial={{
              loanType: "personal",
              amount: config.amountInRupees,
              rate: 14,
              tenure: 5,
            }}
            lockType
          />
        </div>

        {/* Quick-reference matrix */}
        <section className="mt-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3">
            Quick reference — EMI for ₹{config.displayLabel} at common rates and tenures
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Pick the rate-tenure combination closest to your bank&apos;s offer.
            All numbers exclude processing fee and GST.
          </p>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold text-foreground">Rate / Tenure</th>
                  {TENURES_YEARS.map((y) => (
                    <th key={y} className="text-right px-3 py-2 font-semibold text-foreground">
                      {y} {y === 1 ? "yr" : "yrs"}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RATES.map((rate) => (
                  <tr key={rate} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{rate}%</td>
                    {TENURES_YEARS.map((y) => {
                      const cell = matrix.find((c) => c.rate === rate && c.tenureYears === y);
                      return (
                        <td key={y} className="text-right px-3 py-2">
                          {cell ? formatINR(cell.emi) : "—"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SEO body copy */}
        <section className="mt-10 space-y-5 text-foreground text-sm sm:text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-foreground">
            EMI for ₹{config.displayLabel} at Every Common Tenure
          </h2>
          <p>
            All rows below assume a 14% rate (the typical mid-market rate for
            salaried borrowers in 2026). Notice how dropping from 5 years to
            3 years pushes the EMI up by about {formatINR(emi3 - emi5)}, but
            cuts your total interest cost by {formatINR(int5 - int3)}.
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
                  { years: 1, emi: emi1, interest: int1 },
                  { years: 2, emi: emi2, interest: int2 },
                  { years: 3, emi: emi3, interest: int3 },
                  { years: 5, emi: emi5, interest: int5 },
                  { years: 7, emi: emi7, interest: int7 },
                ].map((row) => (
                  <tr key={row.years} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{row.years} {row.years === 1 ? "year" : "years"}</td>
                    <td className="text-right px-3 py-2">{formatINR(row.emi)}</td>
                    <td className="text-right px-3 py-2">{formatINR(row.interest)}</td>
                    <td className="text-right px-3 py-2">{formatINR(row.interest + config.amountInRupees)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-semibold text-foreground">
            What ₹{config.displayLabel} Actually Costs After Processing Fee
          </h2>
          <p>
            Personal loan brochures quote an interest rate, but the real cost of
            borrowing is higher because of the processing fee. Most banks charge
            1-3% on the loan amount, plus 18% GST on the fee itself. For a ₹
            {config.displayLabel} loan at the typical 2% bank rate, that&apos;s{" "}
            {formatINR(processingFeeAmount)} in processing fee plus{" "}
            {formatINR(gstOnFee)} in GST, totalling {formatINR(totalProcessingCost)}{" "}
            deducted from your disbursement. So you actually receive{" "}
            {formatINR(config.amountInRupees - totalProcessingCost)} but you owe
            interest on the full ₹{config.displayLabel}.
          </p>
          <p>
            Over a 5-year tenure at 14%, your total outflow ends up around{" "}
            {formatINR(effectiveCost5yr)} (EMI total of {formatINR(totalCost5yr)}{" "}
            plus the upfront fee). That&apos;s an effective cost roughly 0.4-0.6%
            higher than the headline rate — small but non-trivial when you&apos;re
            comparing loan offers from two banks.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            Where the Rate Comes From
          </h2>
          <p>
            Personal loan rates in India in 2026 cover a much wider band than
            home loans because the segment runs from prime salaried borrowers all
            the way down to subprime NBFC customers. Indicative bands:
          </p>
          <ul className="list-disc list-inside space-y-1.5">
            <li>
              <strong>Top private banks for prime salaried</strong> — HDFC, ICICI,
              Axis, Kotak: 10.50% to 13.50%. Requires a CIBIL above 750, an
              approved-employer tag, and at least two years in current job.
            </li>
            <li>
              <strong>Public sector banks</strong> — SBI, PNB, BoB: 11% to 14%.
              Government employees and PSU staff often get the floor.
            </li>
            <li>
              <strong>Mid-tier and salaried mass-market</strong> — IDFC First,
              IndusInd, RBL: 12% to 18% depending on profile.
            </li>
            <li>
              <strong>NBFCs and digital lenders</strong> — Bajaj Finserv, Tata
              Capital, Fullerton, app-based lenders: 14% to 24%. Faster approval,
              less paperwork, but the rate hits hard over a 5-year tenure.
            </li>
          </ul>
          <p>
            The single biggest lever you control is your CIBIL score. Pulling your
            free report at cibil.com a few months before applying gives you time
            to dispute errors and pay down high-utilisation cards before the
            lender pulls it themselves.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            Why a Personal Loan Beats a Credit Card Balance
          </h2>
          <p>
            If you&apos;re carrying ₹{config.displayLabel} on a credit card at
            36-42% APR, switching to a personal loan at 11-18% drops your
            annualised cost by 20+ percentage points. The 2% processing fee is
            usually recovered within 3-4 months of interest savings. The trap to
            avoid: taking the personal loan but continuing to spend on the card.
            That&apos;s how borrowers end up with both debts compounding in
            parallel.
          </p>
          <p>
            Run the comparison on our{" "}
            <Link href="/calculators/cc-vs-personal-loan" className="text-primary underline">
              CC vs Personal Loan calculator
            </Link>{" "}
            before deciding.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            Tax: Personal Loans Don&apos;t Qualify
          </h2>
          <p>
            Unlike home loans (Section 24b, 80C) or education loans (Section 80E),
            personal loans don&apos;t carry any direct tax deduction in India. The
            sole exception: if you can prove the loan was specifically used to
            fund business expansion, the interest paid may be deductible against
            business income. This requires documentary proof and only applies to
            self-employed borrowers — not salaried.
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
