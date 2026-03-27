import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "About LastEMI — India's Honest Debt Freedom Platform",
  description:
    "LastEMI was built because Indian borrowers deserved a calculator with no conflicts of interest. No commissions, no cold calls, no hidden agenda.",
  path: "/about",
  keywords: [
    "about LastEMI",
    "Indian debt platform",
  ],
});

export default function AboutPage() {
  return (
    <div className="bg-background min-h-screen">
      <main className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
          About LastEMI
        </h1>

        <div className="prose prose-gray max-w-none text-sm sm:text-base leading-relaxed space-y-6">
          <p>
            <strong>LastEMI</strong> exists because Indian home loan borrowers
            deserve honest, math-backed tools — without being sold to, called by
            DSAs, or tricked into affiliate links.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Why We Built This
          </h2>
          <p>
            Every existing home loan calculator in India is built by a bank, an
            NBFC, or an aggregator. They all have a conflict of interest — they
            want you to take more debt, not less. LastEMI has no such conflict.
            We make money from a Pro plan, not from selling your phone number.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            What Makes Us Different
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>No lead generation</strong> — we never ask for your phone
              number or sell your data to banks or DSAs.
            </li>
            <li>
              <strong>Honest calculations</strong> — we show you when prepayment
              does NOT make sense, not just when it does.
            </li>
            <li>
              <strong>RBI rules cited</strong> — we explicitly state that
              floating rate loans have zero prepayment penalty by RBI mandate.
            </li>
            <li>
              <strong>Indian context</strong> — ₹ format, financial year
              grouping (April–March), SBI/HDFC/ICICI rates by name.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Our Calculators
          </h2>
          <p>
            All calculators are free, require no registration, and work on
            mobile. The Pro plan (₹299/month) adds loan tracking, payoff
            planning, and consolidation analysis for borrowers with multiple
            loans.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Privacy Pledge
          </h2>
          <p>
            We do not capture phone numbers. We do not make cold calls. We do
            not share your data with banks, NBFCs, or DSAs. Calculator inputs
            stay in your browser unless you explicitly create an account.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">Contact</h2>
          <p>
            Email:{" "}
            <a
              href="mailto:hello@lastemi.com"
              className="text-primary underline"
            >
              hello@lastemi.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
