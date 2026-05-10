import Link from "next/link";
import { buildMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LastReviewed } from "@/components/ui/LastReviewed";
import { getBreadcrumbSchema } from "@/lib/seo/schema";

export const metadata = buildMetadata({
  title: "Glossary of Indian Loan and Banking Terms — LastEMI",
  description:
    "Plain-English definitions of the loan and banking terms Indian borrowers actually run into. EMI, FOIR, EBLR, MCLR, CIBIL, LTV, repo rate, prepayment penalty — all explained with the math and the RBI rules behind them.",
  path: "/glossary",
  keywords: [
    "loan glossary india",
    "EMI definition",
    "FOIR meaning",
    "EBLR vs MCLR",
    "CIBIL score explained",
    "RBI repo rate explained",
    "home loan terms explained",
  ],
});

const LAST_REVIEWED = "2026-05-10";

interface Term {
  id: string;
  term: string;
  short?: string;
  definition: string; // Plain-English explanation
  link?: { href: string; label: string }; // Optional cross-link to a relevant calculator
}

const TERMS: Term[] = [
  {
    id: "emi",
    term: "EMI (Equated Monthly Instalment)",
    definition:
      "The fixed monthly payment you make to your bank against a loan. It bundles interest and principal in one number, calculated using the reducing-balance formula every Indian bank follows. As you pay down principal each month, the interest portion of each EMI shrinks and the principal portion grows.",
    link: { href: "/", label: "Calculate your EMI" },
  },
  {
    id: "foir",
    term: "FOIR (Fixed Obligation to Income Ratio)",
    definition:
      "The share of your net monthly income that already goes to EMIs and other fixed obligations. Indian banks cap FOIR at 40-55% when assessing a new loan. If you earn ₹1 lakh net monthly and already pay ₹20,000 in existing EMIs (FOIR 20%), you can typically support another ₹30,000-35,000 of EMI. Lower FOIR before applying = higher loan eligibility.",
    link: { href: "/calculators/home-loan-eligibility", label: "Eligibility calculator" },
  },
  {
    id: "cibil",
    term: "CIBIL Score",
    definition:
      "A credit score between 300 and 900 from TransUnion CIBIL, India's largest credit bureau. 750+ unlocks the lowest interest rates from major banks. 700-749 means approval at slightly higher rates. Below 700, expect rejection or NBFC-tier rates above 14%. Pull your report free at cibil.com — disputes take 30-45 days to resolve.",
  },
  {
    id: "ltv",
    term: "LTV (Loan-to-Value Ratio)",
    definition:
      "The percentage of an asset's value that a bank will lend against. RBI caps home loan LTV at 90% for properties under ₹30 lakh, 80% for ₹30-75 lakh, and 75% above ₹75 lakh. Gold loan LTV is capped at 75% of market value. So if you want a ₹1 crore home, you bring ₹25 lakh in down payment and the bank lends the remaining ₹75 lakh maximum.",
  },
  {
    id: "repo-rate",
    term: "Repo Rate",
    definition:
      "The interest rate at which the RBI lends short-term money to commercial banks against government securities. The most-watched policy rate in India because EBLR-linked retail loans use the repo rate as their benchmark. When RBI cuts, your home loan EMI eventually drops; when RBI hikes, your EMI eventually rises.",
    link: { href: "/rbi-rates", label: "Live repo rate tracker" },
  },
  {
    id: "eblr",
    term: "EBLR (External Benchmark Lending Rate)",
    definition:
      "Mandatory benchmark for all floating-rate retail loans sanctioned after October 2019. Most banks use the RBI repo rate as the external benchmark, so the formula is: lending rate = repo rate + spread (typically 1.5-3% for home loans). Reset cycle is every 3 months, which means EBLR loans pass on RBI rate changes faster than older MCLR loans.",
    link: { href: "/rbi-rates", label: "How rates transmit" },
  },
  {
    id: "mclr",
    term: "MCLR (Marginal Cost of Funds-based Lending Rate)",
    definition:
      "Internal benchmark used by Indian banks between April 2016 and September 2019. Banks calculate MCLR monthly from their own cost of deposits, operating costs, and CRR balances. Reset cycles are 6 or 12 months, so MCLR loans see RBI rate cuts much later than EBLR ones. If your loan is on MCLR, ask your bank for a conversion to EBLR.",
  },
  {
    id: "rllr",
    term: "RLLR (Repo-Linked Lending Rate)",
    definition:
      "A specific type of EBLR where the external benchmark is, explicitly, the RBI repo rate. Most major Indian banks use RLLR for their home loan products. Mathematically identical to EBLR-tied-to-repo; the naming differs by bank.",
  },
  {
    id: "spread",
    term: "Spread",
    definition:
      "The margin a bank adds on top of the benchmark rate (repo or EBLR) to arrive at your actual loan rate. The spread depends on your CIBIL score, employer category, loan amount, and the bank's lending appetite. A clean profile typically gets a 2.0-2.5% spread on home loans. The headline 'lowest rate' you see in advertising is for the lowest-spread customer.",
  },
  {
    id: "section-24b",
    term: "Section 24(b)",
    definition:
      "Income Tax Act provision that lets you deduct up to ₹2 lakh per year of home loan interest paid (self-occupied property, old tax regime). One of the two main tax benefits available to home loan borrowers, alongside Section 80C principal repayment.",
    link: { href: "/calculators/tax-benefit", label: "Tax benefit calculator" },
  },
  {
    id: "section-80c",
    term: "Section 80C",
    definition:
      "Income Tax Act section allowing up to ₹1.5 lakh per year deduction for specified investments and payments — including home loan principal repayment, ELSS mutual funds, PPF, EPF, life insurance premiums. The cap is shared across all 80C instruments combined, not per item.",
    link: { href: "/calculators/tax-benefit", label: "Tax benefit calculator" },
  },
  {
    id: "section-80e",
    term: "Section 80E",
    definition:
      "Income Tax Act provision letting you deduct ALL the interest paid on an education loan, with no upper cap. Available for 8 consecutive years from the start of repayment. Applies to loans for higher education in India or abroad, taken for self, spouse, children, or a legally adopted child.",
    link: { href: "/calculators/education-loan-80e", label: "80E calculator" },
  },
  {
    id: "prepayment-penalty",
    term: "Prepayment / Foreclosure Penalty",
    definition:
      "A fee charged by lenders when you pay off a loan earlier than scheduled. RBI explicitly forbids this on floating-rate home loans for individual borrowers. Personal loans, car loans, and fixed-rate home loans typically carry a 2-5% penalty on the outstanding amount. Always check your sanction letter before paying off early.",
    link: { href: "/calculators/sip-vs-prepayment", label: "Prepay vs invest calculator" },
  },
  {
    id: "processing-fee",
    term: "Processing Fee",
    definition:
      "Upfront fee banks charge to process a loan application. Typically 0.5-1% on home loans, 1-3% on personal loans. Plus 18% GST on top of the fee. Deducted from your disbursement amount, but you still owe interest on the full sanctioned principal. A common 'real cost' borrowers underestimate when comparing offers.",
  },
  {
    id: "amortization-schedule",
    term: "Amortization Schedule",
    definition:
      "A month-by-month breakdown of your loan: each row shows the EMI paid, how much went to interest, how much to principal, and the remaining outstanding. In early years, interest dominates each EMI; in later years, principal dominates. Lets you see exactly where your money is going and time part-payments for maximum impact.",
    link: { href: "/", label: "See your schedule" },
  },
  {
    id: "balance-transfer",
    term: "Balance Transfer",
    definition:
      "Moving your existing loan from one bank to another, usually to get a lower interest rate. Worth doing when the rate gap is at least 0.4% and you have 5+ years of tenure remaining. Watch for processing fees and legal charges at the new bank — they can eat the first year of savings if the rate gap is small.",
    link: { href: "/calculators/balance-transfer", label: "Break-even calculator" },
  },
  {
    id: "part-payment",
    term: "Part Payment",
    definition:
      "Any extra payment you make on top of your regular EMI, beyond the schedule. Reduces your outstanding principal directly, which means less interest accrues from that month onwards. On floating-rate home loans (no penalty), this is one of the cheapest ways to save lakhs in interest. Most banks default to keeping your EMI fixed and shortening tenure unless you ask for the EMI to drop.",
    link: { href: "/", label: "Simulate part payments" },
  },
  {
    id: "moratorium",
    term: "Moratorium",
    definition:
      "A temporary pause in EMI payments, usually granted at the start of an education loan (covering the study period plus 6-12 months) or in financial hardship situations. Interest accrues during the moratorium and gets added to the outstanding principal — so the loan is more expensive after a moratorium than without one.",
  },
  {
    id: "ecs-mandate",
    term: "ECS / NACH / E-Mandate",
    definition:
      "Auto-debit mandates that authorise your bank to deduct your EMI from your account each month without manual intervention. NACH (National Automated Clearing House) replaced ECS for most banks. E-Mandate is the digital, paperless version. RBI's e-mandate framework caps recurring auto-debit transactions and requires customer notification 24 hours before each debit.",
  },
  {
    id: "crr",
    term: "CRR (Cash Reserve Ratio)",
    definition:
      "The percentage of bank deposits banks must park with RBI in cash, earning no interest. Currently around 4%. Higher CRR tightens money supply (less cash in the banking system); lower CRR loosens it. The MPC adjusts CRR alongside the repo rate to manage liquidity.",
  },
  {
    id: "slr",
    term: "SLR (Statutory Liquidity Ratio)",
    definition:
      "The percentage of bank deposits banks must invest in approved liquid assets, mainly government bonds. Currently around 18%. A regulatory cushion ensuring banks can meet withdrawal demands without panic-selling other assets.",
  },
  {
    id: "mpc",
    term: "MPC (Monetary Policy Committee)",
    definition:
      "The six-member panel that sets the RBI repo rate and other policy levers. Three RBI officials, three external experts appointed by the Government of India. Meets six times a year (Feb, Apr, Jun, Aug, Oct, Dec) and publishes meeting minutes 14 days after each decision.",
  },
  {
    id: "tenor",
    term: "Tenor / Tenure",
    definition:
      "The total duration over which a loan is repaid, expressed in years or months. Common home loan tenures in India range from 5 to 30 years; personal loans 1 to 7 years; car loans 1 to 7 years. Longer tenure means lower EMI but higher total interest. Each loan type has a maximum allowed tenure that depends on your age — banks insist the loan close before retirement (60-65 for salaried, 70 for self-employed).",
  },
  {
    id: "co-applicant",
    term: "Co-applicant",
    definition:
      "A second borrower on a loan whose income is added to yours when computing FOIR. Almost always a spouse, parent, or sibling with a separate income source. Adding an earning co-applicant can nearly double your eligible loan amount. Both names go on the loan, both are jointly liable for repayment, and both can claim tax benefits proportionally if the property is jointly owned.",
  },
  {
    id: "lap",
    term: "LAP (Loan Against Property)",
    definition:
      "A secured loan where you pledge a residential or commercial property as collateral. Typical LTV is 50-70% of the property value (lower than home loan LTV because the bank already has alternative recourse). Used for business expansion, education, or medical needs. Rates sit between home loan rates and personal loan rates — usually 9.5-12%.",
  },
  {
    id: "no-cost-emi",
    term: "No-Cost EMI",
    definition:
      "A marketing label for consumer financing schemes (mostly on electronics and white goods). Despite the name, the interest is real — it's either built into the product price (you pay more than the cash price) or charged as a discount loss to the merchant. RBI banned true zero-percent interest schemes in 2013, so anything labelled no-cost EMI is using one of these tricks. Plus 18% GST on the interest component, which the marketing page never mentions.",
    link: { href: "/calculators/consumer-emi-true-cost", label: "Real-cost calculator" },
  },
];

// Group by first letter for the alphabetical index. Render terms in the
// order defined above (which is rough relevance order), but provide an
// A-Z jump-nav for users who know what they're looking for.
function groupByLetter(terms: Term[]): Record<string, Term[]> {
  const map: Record<string, Term[]> = {};
  for (const t of terms) {
    const letter = t.term[0].toUpperCase();
    if (!map[letter]) map[letter] = [];
    map[letter].push(t);
  }
  return map;
}

export default function GlossaryPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "https://lastemi.com" },
    { name: "Glossary", url: "https://lastemi.com/glossary" },
  ]);

  // DefinedTermSet schema — Google parses this for richer search results
  // when it surfaces a definition card.
  const definedTermSetSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "LastEMI Glossary of Indian Loan and Banking Terms",
    url: "https://lastemi.com/glossary",
    hasDefinedTerm: TERMS.map((t) => ({
      "@type": "DefinedTerm",
      "@id": `https://lastemi.com/glossary#${t.id}`,
      name: t.term,
      description: t.definition,
      inDefinedTermSet: "https://lastemi.com/glossary",
    })),
  };

  const grouped = groupByLetter(TERMS);
  const letters = Object.keys(grouped).sort();
  const sortedTerms = [...TERMS].sort((a, b) => a.term.localeCompare(b.term));

  return (
    <div className="bg-background min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSetSchema) }}
      />

      <main className="max-w-4xl mx-auto py-6 px-3 sm:px-6">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Glossary", href: "/glossary" },
          ]}
        />
        <div className="mt-3 mb-3">
          <LastReviewed date={LAST_REVIEWED} />
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-3">
          Glossary of Indian Loan &amp; Banking Terms
        </h1>
        <p className="text-muted-foreground mb-6 text-sm sm:text-base">
          Plain-English explanations of the {TERMS.length} terms Indian
          borrowers run into most often. Each definition explains the
          mechanics and links to the calculator that uses the concept where
          relevant.
        </p>

        {/* A-Z jump nav */}
        <nav
          aria-label="Jump to letter"
          className="flex flex-wrap gap-1.5 mb-8 pb-4 border-b border-border"
        >
          {letters.map((l) => (
            <a
              key={l}
              href={`#letter-${l}`}
              className="inline-flex items-center justify-center w-7 h-7 text-xs font-semibold text-foreground bg-muted hover:bg-accent rounded-md transition-colors"
            >
              {l}
            </a>
          ))}
        </nav>

        {/* Definitions grouped alphabetically */}
        <div className="space-y-10">
          {letters.map((letter) => (
            <section key={letter} id={`letter-${letter}`}>
              <h2 className="text-2xl font-bold text-primary mb-3 sticky top-0 bg-background pt-2 pb-1">
                {letter}
              </h2>
              <dl className="space-y-6">
                {sortedTerms
                  .filter((t) => t.term[0].toUpperCase() === letter)
                  .map((t) => (
                    <div
                      key={t.id}
                      id={t.id}
                      className="scroll-mt-20 bg-card border border-border rounded-xl p-5"
                    >
                      <dt className="text-base font-semibold text-foreground mb-2">
                        {t.term}
                      </dt>
                      <dd className="text-sm sm:text-base text-foreground leading-relaxed">
                        {t.definition}
                      </dd>
                      {t.link && (
                        <p className="mt-3 text-sm">
                          <Link
                            href={t.link.href}
                            className="text-primary hover:underline font-medium"
                          >
                            {t.link.label} &rarr;
                          </Link>
                        </p>
                      )}
                    </div>
                  ))}
              </dl>
            </section>
          ))}
        </div>

        <div className="mt-10 bg-accent border border-primary/20 rounded-lg p-4">
          <p className="text-primary font-medium text-sm">
            Spotted a term we&rsquo;re missing? Email{" "}
            <a
              href="mailto:contact@lastemi.com?subject=Glossary%20suggestion"
              className="underline font-semibold"
            >
              contact@lastemi.com
            </a>{" "}
            and we&rsquo;ll add it.
          </p>
        </div>
      </main>
    </div>
  );
}
