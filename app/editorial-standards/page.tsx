import { buildMetadata } from "@/lib/seo/metadata";
import Link from "next/link";

export const metadata = buildMetadata({
  title: "Editorial Standards — How We Verify Our Content",
  description:
    "LastEMI's editorial standards: how we verify calculations, cite RBI rules, and ensure every number in our articles is accurate.",
  path: "/editorial-standards",
  keywords: [
    "LastEMI editorial standards",
  ],
});

export default function EditorialStandardsPage() {
  return (
    <div className="bg-background min-h-screen">
      <main className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
          Editorial Standards
        </h1>

        <div className="prose prose-gray max-w-none text-sm sm:text-base leading-relaxed space-y-6">
          <p>
            Every calculation, article, and recommendation on LastEMI follows
            these standards. We take accuracy seriously because your financial
            decisions depend on it.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Calculation Verification
          </h2>
          <p>
            All EMI calculations use the standard reducing balance formula used
            by Indian banks. Our amortization schedules are verified against RBI
            guidelines and cross-checked with actual bank statements.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Primary Sources We Cite
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>RBI circulars</strong> — for prepayment penalty rules,
              repo rate changes, and lending rate regulations
            </li>
            <li>
              <strong>Income Tax Act</strong> — Section 80C (₹1.5L cap),
              Section 24(b) (₹2L cap), Section 80E (no cap)
            </li>
            <li>
              <strong>Bank rate cards</strong> — SBI, HDFC Bank, ICICI Bank,
              Axis Bank, Kotak Mahindra Bank
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Affiliate Disclosure
          </h2>
          <p>
            When we show affiliate links (balance transfer, consolidation), we
            disclose this clearly. Affiliate links only appear when our
            calculation shows a genuine net saving of ₹25,000+ after all fees.
            We never show affiliate links when the math does not support the
            recommendation.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Content Review
          </h2>
          <p>
            Blog articles are reviewed against real amortization calculations
            before publishing. Tax-related content is reviewed before each new
            financial year (April) to ensure accuracy with current rules.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            What We Do Not Do
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>We do not give specific investment advice</li>
            <li>We do not recommend specific mutual funds</li>
            <li>We do not act as debt settlement services</li>
            <li>
              We do not capture phone numbers for bank or DSA referrals
            </li>
          </ul>

          <p className="mt-8">
            Questions about our editorial process?{" "}
            <Link href="/about" className="text-primary underline">
              Contact us
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
