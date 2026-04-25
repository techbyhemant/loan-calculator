import Link from "next/link";
import { calculateEMI } from "@/lib/calculations/loanCalcs";
import { formatINR } from "@/lib/utils/formatters";
import { buildMetadata } from "@/lib/seo/metadata";
import { getFAQSchema, getBreadcrumbSchema } from "@/lib/seo/schema";
import { RelatedCalculators } from "@/components/ui/RelatedCalculators";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata = buildMetadata({
  title: "Gold Loan EMI Calculator — Rates, LTV, Repayment Options",
  description:
    "Free gold loan EMI calculator for India. Compare bullet repayment, regular EMI, and overdraft schemes at 8–18% rates. Understand RBI's 75% LTV cap and avoid forced auctions.",
  path: "/calculators/gold-loan-emi",
  keywords: [
    "gold loan emi calculator",
    "gold loan calculator india",
    "gold loan interest rate calculator",
    "gold loan repayment calculator",
    "gold loan ltv calculator",
  ],
});

const SAMPLE_AMOUNT = 500_000;
const RATES = [9, 12, 15];
const TENURES_MONTHS = [12, 24, 36];

const faqs = [
  {
    question: "What is the typical interest rate for a gold loan in India?",
    answer:
      "Gold loan interest rates in India range from 8% to 18% per annum in 2026. Public sector banks like SBI offer the lowest rates (8–10%) on gold loans up to ₹35 lakh. Gold loan NBFCs like Muthoot Finance and Manappuram charge 12–18%, with rates inversely related to the loan-to-value (LTV) ratio you choose. A lower LTV gives you a lower interest rate.",
  },
  {
    question: "How much loan can I get against my gold?",
    answer:
      "RBI caps the loan-to-value (LTV) ratio at 75% of the gold's market value for non-agricultural gold loans. So if your gold is worth ₹10 lakh, you can borrow up to ₹7.5 lakh. The bank or NBFC values your gold at 22-karat purity equivalent, regardless of the actual purity, and uses the prevailing market price.",
  },
  {
    question: "What are the repayment options for a gold loan?",
    answer:
      "There are three common repayment structures. Bullet repayment: pay all interest and principal as a lump sum at the end of the tenure (popular for short tenures of 3–12 months). Regular EMI: standard equated monthly instalments. Overdraft: pay only interest monthly with principal due at maturity. Use this calculator to see EMI under the regular structure.",
  },
  {
    question: "What happens if I can't repay my gold loan?",
    answer:
      "If you default, the lender sends a notice and gives a grace period (typically 60–90 days). After that, the lender auctions your gold to recover the dues. If the auction proceeds exceed your outstanding, the surplus is returned to you. To avoid auction, communicate early — most lenders allow tenure extension, partial payment, or interest-only payments during financial stress.",
  },
  {
    question: "Is gold loan better than personal loan?",
    answer:
      "Gold loans are usually cheaper (8–18%) than personal loans (10.5–24%) because they're secured against gold. They also process faster (often within an hour) and don't require strong credit history. The downside: you risk losing your gold if you default. For short-term needs (3–12 months), gold loan typically wins on cost. For longer-term needs without collateral risk, a personal loan may be safer.",
  },
];

export default function GoldLoanEmiPage() {
  const matrix = RATES.map((rate) => ({
    rate,
    emis: TENURES_MONTHS.map((m) => ({ months: m, emi: calculateEMI(SAMPLE_AMOUNT, rate, m) })),
  }));

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "https://lastemi.com" },
    { name: "Calculators", url: "https://lastemi.com/calculators" },
    { name: "Gold Loan EMI", url: "https://lastemi.com/calculators/gold-loan-emi" },
  ]);
  const faqSchema = getFAQSchema(faqs);
  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Gold Loan EMI Calculator — LastEMI",
    url: "https://lastemi.com/calculators/gold-loan-emi",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description: "Free gold loan EMI calculator with LTV check and rate comparison.",
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
            { name: "Gold Loan EMI", href: "/calculators/gold-loan-emi" },
          ]}
        />

        <h1 className="text-2xl sm:text-4xl font-bold text-foreground mt-3 mb-3">
          Gold Loan EMI Calculator
        </h1>
        <p className="text-muted-foreground mb-6 text-sm sm:text-base">
          Calculate EMI, total interest, and effective borrowing cost for any gold
          loan. Compare bullet repayment, regular EMI, and overdraft options at the
          rates Indian banks and NBFCs actually charge in 2026.
        </p>

        <Link
          href="/?type=gold"
          className="block bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-5 py-4 mb-10 text-center font-semibold shadow-sm transition-colors"
        >
          Open the Full Interactive Calculator &rarr;
          <span className="block text-xs font-normal opacity-90 mt-1">
            Enter your gold loan details and simulate part payments
          </span>
        </Link>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Sample EMI Table — ₹{(SAMPLE_AMOUNT / 100000).toFixed(0)} Lakh Gold Loan
          </h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">Rate</th>
                  {TENURES_MONTHS.map((m) => (
                    <th key={m} className="text-right px-3 py-2 font-semibold">
                      {m / 12} {m === 12 ? "year" : "years"}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row) => (
                  <tr key={row.rate} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{row.rate}%</td>
                    {row.emis.map((c) => (
                      <td key={c.months} className="text-right px-3 py-2">
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
            RBI Rules: 75% LTV Cap and What It Means for You
          </h2>
          <p>
            The Reserve Bank of India caps the loan-to-value (LTV) ratio for
            non-agricultural gold loans at 75%. If your gold is valued at ₹10 lakh,
            the maximum loan a regulated lender can offer is ₹7.5 lakh. This cap
            protects you from over-borrowing and protects the lender from gold price
            volatility. Some NBFCs offer LTV up to 75% only on bullet repayment
            schemes, with stricter limits on EMI structures.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            Three Repayment Schemes — Pick the Right One
          </h2>
          <p>
            <strong>Bullet repayment</strong> works for short-term needs (3–12
            months) where you expect a lump-sum inflow (bonus, sale of asset,
            harvest). You pay zero EMIs during the tenure and clear principal +
            accumulated interest at the end. Cheaper than EMI when used correctly.
          </p>
          <p>
            <strong>Regular EMI</strong> is what this calculator shows. You pay equal
            monthly instalments over 12–36 months. Best for predictable income and
            longer tenures.
          </p>
          <p>
            <strong>Overdraft / Interest-only</strong> lets you pay just the monthly
            interest, with principal due at maturity. Useful for working capital or
            when you can clear principal in chunks but want low monthly outgo.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            Avoid the Forced Auction Trap
          </h2>
          <p>
            The biggest risk with a gold loan is missing payments and having your
            gold auctioned. This often happens because the borrower under-estimates
            EMI strain or the loan tenure was too short. Use this calculator to
            stress-test your repayment capacity before signing. If you&apos;re
            already struggling, contact the lender before the 90-day notice — most
            lenders prefer restructuring over auction.
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
