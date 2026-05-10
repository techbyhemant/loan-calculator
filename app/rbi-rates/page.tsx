import Link from "next/link";
import { RbiEmiImpact } from "./RbiEmiImpact";
import { buildMetadata } from "@/lib/seo/metadata";
import { getFAQSchema } from "@/lib/seo/schema";
import { getLatestRateEntry, getRateHistory } from "@/lib/data/rbi-rates";
import { LastReviewed } from "@/components/ui/LastReviewed";

export const metadata = buildMetadata({
  title: "RBI Repo Rate Today — Live Tracker, History & Home Loan Impact",
  description:
    "Live RBI repo rate, MPC history, and how every cut or hike actually moves your home loan EMI. Includes EBLR vs MCLR explainer, bank-by-bank transmission lag, and a free EMI impact calculator.",
  path: "/rbi-rates",
  keywords: [
    "RBI repo rate 2026",
    "repo rate today",
    "current repo rate India",
    "RBI MPC meeting",
    "EBLR vs MCLR",
    "repo rate home loan impact",
    "floating rate transmission",
    "RBI monetary policy 2026",
  ],
});

const LAST_REVIEWED = "2026-05-10";

const faqs = [
  {
    question: "What is the current RBI repo rate?",
    answer:
      "The repo rate is the interest at which RBI lends short-term money to commercial banks. The latest figure and the date it took effect are shown live at the top of this page.",
  },
  {
    question: "If RBI cuts rates today, when does my EMI actually drop?",
    answer:
      "Depends on your loan type. EBLR or RLLR loans (anything sanctioned after October 2019) reset every three months, so the cut shows up at your next quarterly reset. MCLR loans take 6 to 12 months. Most banks also keep your EMI fixed by default and shorten the tenure instead. If you want the EMI to reduce, you usually have to send a written request to the branch.",
  },
  {
    question: "EBLR vs RLLR vs MCLR — what's the practical difference?",
    answer:
      "EBLR is any benchmark tied to a rate outside the bank's control. RLLR is the most common version, where the benchmark is the RBI repo rate. MCLR is the older internal benchmark banks compute themselves from their deposit costs. EBLR and RLLR pass RBI cuts on in about three months. MCLR can take a year. If you're still on MCLR, ask for a conversion.",
  },
  {
    question: "How often does RBI change the repo rate?",
    answer:
      "The Monetary Policy Committee meets six times a year, roughly every two months — February, April, June, August, October, December. They can also call an unscheduled meeting in a crisis (the COVID emergency cuts in 2020 are an example).",
  },
  {
    question: "Which banks pass on rate changes fastest?",
    answer:
      "Any bank with EBLR-linked loans is going to be quicker than the MCLR ones. Beyond that, the date of your bank's monthly reset matters more than the bank itself. SBI typically resets on the 15th, ICICI/HDFC/Axis on the 1st or 7th, most PSU banks on the 1st. The actual cut still hits your account at the next reset, regardless of when RBI announced it.",
  },
  {
    question: "Should I move from MCLR to EBLR after a rate cut?",
    answer:
      "If RBI has just cut rates, EBLR will pass that on quickly while MCLR will sit on it for 6 to 12 months. Most banks charge ₹5,000 to ₹10,000 to convert. Take that fee, divide it by the monthly interest you'd save under the better benchmark, and you have your payback period. Under 12 months, switch.",
  },
  {
    question: "What is 'spread' on a home loan?",
    answer:
      "On EBLR-linked loans, your actual rate is the repo rate plus a spread the bank decides. The spread depends on your CIBIL, loan size, and which bank you went to. It usually sits between 1.5% and 3% for home loans. A clean profile with a 750+ CIBIL and a ₹50 lakh loan typically gets 2.0% to 2.5%. At a 5.25% repo, that's 7.25% to 7.75% on the actual loan.",
  },
  {
    question: "Can I force my bank to pass on an RBI rate cut immediately?",
    answer:
      "No. Banks are bound by the reset cycle in your sanction letter. If they haven't reduced the spread on EBLR loans even after the reset, you have leverage to ask for a switch to their current EBLR product — usually for a small admin fee. The RBI requires transparent transmission but doesn't force banks to break their own contracts mid-cycle.",
  },
];

// Data pulled from data/rbi-rates.json via the shared loader so this page
// stays in sync with blog prompts and homepage content automatically.
const RATE_HISTORY = getRateHistory();
const CURRENT_RATE = getLatestRateEntry();

export default function RBIRatesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "RBI Repo Rate Tracker",
    url: "https://lastemi.com/rbi-rates",
    description: metadata.description,
  };

  const faqSchema = getFAQSchema(faqs);

  return (
    <div className="bg-background min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="max-w-4xl mx-auto py-6 px-3 sm:px-6">
        <div className="mb-3">
          <LastReviewed date={LAST_REVIEWED} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          RBI Repo Rate: Impact on Your Home Loan EMI
        </h1>
        <p className="text-muted-foreground mb-6 text-sm sm:text-base">
          The RBI repo rate directly affects floating-rate home loan EMIs. When
          the repo rate changes, banks adjust their lending rates accordingly.
        </p>

        {/* Current Rate Card */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 mb-6 text-center">
          <p className="text-sm text-muted-foreground mb-1">Current RBI Repo Rate</p>
          <p className="text-4xl font-bold text-primary">
            {CURRENT_RATE.rate}%
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            As of {CURRENT_RATE.date}
            {CURRENT_RATE.change !== 0 && (
              <span
                className={
                  CURRENT_RATE.change < 0 ? "text-positive" : "text-negative"
                }
              >
                {" "}
                ({CURRENT_RATE.change > 0 ? "+" : ""}
                {CURRENT_RATE.change}%)
              </span>
            )}
          </p>
        </div>

        {/* Rate History Table */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">
              Recent Rate History
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-background">
                  <th className="text-left px-4 py-3 font-medium text-foreground">
                    MPC Date
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-foreground">
                    Repo Rate
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-foreground">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[...RATE_HISTORY].reverse().map((entry) => (
                  <tr key={entry.date}>
                    <td className="px-4 py-3 text-foreground">{entry.date}</td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">
                      {entry.rate}%
                    </td>
                    <td className="px-4 py-3 text-right">
                      {entry.change === 0 ? (
                        <span className="text-muted-foreground">No change</span>
                      ) : (
                        <span
                          className={
                            entry.change < 0
                              ? "text-positive"
                              : "text-negative"
                          }
                        >
                          {entry.change > 0 ? "+" : ""}
                          {entry.change}%
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <RbiEmiImpact />

        {/* How It Affects You */}
        <section className="space-y-6 text-foreground text-sm sm:text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-foreground">
            What the repo rate actually is
          </h2>
          <p>
            The <strong>repo rate</strong> is the interest rate at which the{" "}
            <a
              href="https://www.rbi.org.in"
              target="_blank"
              rel="noopener"
              className="text-primary underline"
            >
              Reserve Bank of India
            </a>{" "}
            lends short-term money to commercial banks against government
            securities. The bank pledges G-Secs as collateral, takes the cash,
            and buys the securities back a few days later at a slightly higher
            price. That difference is the interest, which is essentially the
            repo rate.
          </p>
          <p>
            When the RBI cuts this rate, banks get money cheaper and most of
            them eventually pass some of that on to home loan, personal loan,
            and car loan customers. A hike works the opposite way: lending gets
            costlier and FD rates inch up.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            Who decides the rate
          </h2>
          <p>
            The repo rate is set by the <strong>Monetary Policy Committee
            (MPC)</strong>, a six-member panel chaired by the RBI Governor.
            Three members are from the RBI; three are external experts
            appointed by the Government of India for a fixed term. The MPC
            holds six scheduled meetings every year, usually in February,
            April, June, August, October, and December.
          </p>
          <p>
            Each member gets one vote. If there is a tie, the Governor has a
            casting vote. The legal mandate is keeping retail CPI inflation
            inside a 4% &plusmn; 2% band. So when inflation runs hot, the MPC
            tends to hike. When growth slows or inflation undershoots, it cuts.
            Full minutes are published 14 days after every meeting and the
            individual votes plus reasoning are public, which makes it possible
            to read where the committee is leaning before the next decision.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            Why some borrowers see rate cuts faster than others
          </h2>
          <p>
            Whether your EMI moves quickly after an RBI cut depends entirely on
            which benchmark your home loan is linked to. There are three you
            will run into:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>EBLR (External Benchmark Lending Rate).</strong> Mandatory
              on all floating-rate retail loans sanctioned by banks from October
              2019 onwards. The benchmark is almost always the RBI repo rate,
              and the maths is simple: repo rate plus spread (typically 1.5% to
              3% for home loans). Reset happens every 3 months. RLLR is just a
              repo-specific subtype of EBLR.
            </li>
            <li>
              <strong>MCLR (Marginal Cost of Funds-based Lending Rate).</strong>
              {" "}This was the standard between April 2016 and September 2019.
              Banks compute it monthly from their own cost of deposits,
              operating costs, and CRR balances. Reset cycles are 6 or 12
              months, so MCLR loans see RBI cuts much later than EBLR ones.
            </li>
            <li>
              <strong>BPLR / Base Rate.</strong> Even older. A handful of legacy
              loans are still parked on these. If yours is one of them, ask
              your bank for a conversion to EBLR. The savings usually pay back
              the small conversion fee inside a year.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground">
            How quickly each major bank actually passes on a cut
          </h2>
          <p>
            Even within EBLR, the day on which your bank refreshes its rate
            varies. Here is the pattern most retail borrowers will see, based
            on the public reset schedules of the largest lenders:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-border rounded-lg">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left px-4 py-2 font-medium text-foreground">Bank</th>
                  <th className="text-left px-4 py-2 font-medium text-foreground">Benchmark</th>
                  <th className="text-left px-4 py-2 font-medium text-foreground">Reset Day</th>
                  <th className="text-left px-4 py-2 font-medium text-foreground">Typical Transmission Lag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr><td className="px-4 py-2">SBI</td><td className="px-4 py-2">EBLR (repo + spread)</td><td className="px-4 py-2">15th of month</td><td className="px-4 py-2">Up to 3 months</td></tr>
                <tr><td className="px-4 py-2">HDFC Bank</td><td className="px-4 py-2">EBLR (repo + spread)</td><td className="px-4 py-2">1st or 7th of month</td><td className="px-4 py-2">Up to 3 months</td></tr>
                <tr><td className="px-4 py-2">ICICI Bank</td><td className="px-4 py-2">EBLR (repo + spread)</td><td className="px-4 py-2">1st of month</td><td className="px-4 py-2">Up to 3 months</td></tr>
                <tr><td className="px-4 py-2">Axis Bank</td><td className="px-4 py-2">EBLR (repo + spread)</td><td className="px-4 py-2">1st of month</td><td className="px-4 py-2">Up to 3 months</td></tr>
                <tr><td className="px-4 py-2">Kotak Mahindra</td><td className="px-4 py-2">EBLR (repo + spread)</td><td className="px-4 py-2">1st of month</td><td className="px-4 py-2">Up to 3 months</td></tr>
                <tr><td className="px-4 py-2">PNB / BoB / Canara</td><td className="px-4 py-2">EBLR (repo + spread)</td><td className="px-4 py-2">1st of month</td><td className="px-4 py-2">Up to 3 months</td></tr>
              </tbody>
            </table>
          </div>
          <p>
            For MCLR-linked loans the gap is typically 6 to 12 months,
            depending on the reset clause baked into your sanction letter.
            One thing worth checking: is your spread fixed for the entire
            tenure, or does the bank reserve the right to revise it later?
            That single line in the sanction letter has cost a lot of
            borrowers a lot of money.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            What to do when the RBI moves
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Rate cut.</strong> Most banks keep your EMI fixed and
              shorten the tenure. That is actually the better outcome on
              paper, since you save more interest overall. If your monthly
              budget is tight and you would rather see the EMI drop, you have
              to ask the branch in writing. Run both scenarios on our{" "}
              <Link href="/" className="text-primary underline">
                EMI calculator
              </Link>{" "}
              first so you know what you are giving up.
            </li>
            <li>
              <strong>Rate hike.</strong> Make a part payment to absorb the
              increase. RBI rules forbid any prepayment penalty on a
              floating-rate home loan to an individual borrower, so this is a
              free move. Even a one-time payment of ₹1&ndash;2 lakh can knock
              months off the tenure.
            </li>
            <li>
              <strong>Balance transfer.</strong> If your bank has not passed
              on a cut even after a full reset cycle, walk into another bank
              and ask for their current EBLR. They will usually quote a lower
              spread to win the loan. A switch starts to make sense once the
              gap is around 0.40% and you have five-plus years of tenure left.{" "}
              <Link
                href="/calculators/balance-transfer"
                className="text-primary underline"
              >
                Run the break-even
              </Link>{" "}
              before signing anything: processing fees, legal charges and
              valuation fees can quietly eat the first year of savings.
            </li>
            <li>
              <strong>MCLR to EBLR.</strong> If you are still on the older
              MCLR system, ask the branch for a conversion to EBLR. Most banks
              charge ₹5,000 to ₹10,000. Divide that fee by the monthly
              interest you save under the new benchmark.
              if it pays back in under 12 months, switch.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground">
            The other rates RBI controls
          </h2>
          <p>
            The repo rate gets all the headlines, but the MPC announcement
            usually mentions four or five other levers that move alongside it.
            A short reference for when you see them in the news:
          </p>
          <dl className="space-y-3">
            <div>
              <dt className="font-semibold text-foreground">Repo Rate</dt>
              <dd className="text-muted-foreground">
                Rate at which RBI lends to commercial banks against government
                securities. The benchmark for EBLR-linked retail loans.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Reverse Repo Rate</dt>
              <dd className="text-muted-foreground">
                Rate at which RBI borrows from commercial banks. Used to
                absorb excess liquidity. Typically 0.25% below the repo rate.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">CRR (Cash Reserve Ratio)</dt>
              <dd className="text-muted-foreground">
                Percentage of bank deposits that must be parked with the RBI
                in cash, earning no interest. Currently around 4%. Higher CRR
                tightens money supply.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">SLR (Statutory Liquidity Ratio)</dt>
              <dd className="text-muted-foreground">
                Percentage of bank deposits that must be invested in approved
                liquid assets like government bonds. Currently around 18%.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Standing Deposit Facility (SDF)</dt>
              <dd className="text-muted-foreground">
                Rate at which RBI accepts deposits from banks without needing
                to provide collateral. Forms the floor of the policy corridor.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">MSF (Marginal Standing Facility)</dt>
              <dd className="text-muted-foreground">
                Emergency lending facility for banks above the repo rate
                (typically +0.25%). Forms the ceiling of the policy corridor.
              </dd>
            </div>
          </dl>

          <h2 className="text-xl font-semibold text-foreground">
            Frequently Asked Questions
          </h2>
          <dl className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <dt className="font-semibold text-foreground">{faq.question}</dt>
                <dd className="mt-1 text-muted-foreground">{faq.answer}</dd>
              </div>
            ))}
          </dl>

          <div className="bg-accent border border-primary/20 rounded-lg p-4 mt-6">
            <p className="text-primary font-medium">
              Track how rate changes affect your specific loans.{" "}
              <Link href="/login" className="underline font-semibold">
                Add your loans to the free dashboard &rarr;
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
