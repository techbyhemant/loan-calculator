import Link from "next/link";
import { RbiEmiImpact } from "./RbiEmiImpact";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "RBI Repo Rate 2026 — Impact on Home Loan EMI",
  description:
    "Track the latest RBI repo rate and understand how it affects your floating rate home loan EMI. Historical rate data and EMI impact calculator.",
  path: "/rbi-rates",
  keywords: [
    "RBI repo rate 2026",
    "repo rate today",
    "RBI monetary policy",
    "home loan rate change",
    "floating rate impact",
  ],
});

const RATE_HISTORY = [
  { date: "Feb 2025", rate: 6.25, change: -0.25 },
  { date: "Apr 2025", rate: 6.00, change: -0.25 },
  { date: "Jun 2025", rate: 5.75, change: -0.25 },
  { date: "Aug 2025", rate: 5.50, change: -0.25 },
  { date: "Oct 2025", rate: 5.50, change: 0 },
  { date: "Dec 2025", rate: 5.50, change: 0 },
  { date: "Feb 2026", rate: 5.25, change: -0.25 },
];

const CURRENT_RATE = RATE_HISTORY[RATE_HISTORY.length - 1];

export default function RBIRatesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "RBI Repo Rate Tracker",
    url: "https://lastemi.com/rbi-rates",
    description: metadata.description,
  };

  return (
    <div className="bg-background min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="max-w-4xl mx-auto py-6 px-3 sm:px-6">
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
            How Does the Repo Rate Affect Your Home Loan?
          </h2>
          <p>
            The <strong>repo rate</strong> is the rate at which the Reserve Bank
            of India lends money to commercial banks. When the RBI cuts the repo
            rate, banks can borrow money cheaper, and they typically pass on
            part of this benefit to borrowers by reducing their lending rates
            (MCLR or external benchmark rates like EBLR/RLLR).
          </p>
          <p>
            If your home loan is on a <strong>floating rate</strong> (which most
            Indian home loans are), your EMI or tenure will be adjusted when
            your bank revises its benchmark rate. For external benchmark-linked
            loans (post Oct 2019), the transmission happens within 3 months.
            For older MCLR-linked loans, it may take 6-12 months.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            What Should You Do When Rates Change?
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Rate cut:</strong> Your EMI may reduce automatically, or
              your tenure shortens. Use our{" "}
              <Link href="/" className="text-primary underline">
                EMI calculator
              </Link>{" "}
              to see the exact impact.
            </li>
            <li>
              <strong>Rate hike:</strong> Consider making a part payment to
              offset the increased interest burden. Even a small lump sum can
              save months of tenure.
            </li>
            <li>
              <strong>Balance transfer:</strong> If your current lender hasn&apos;t
              passed on rate cuts, consider transferring to a bank offering
              better rates. RBI mandates zero prepayment penalty on floating
              rate loans.
            </li>
          </ul>

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
