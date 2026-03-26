import Link from "next/link";

import { buildMetadata } from "@/lib/seo/metadata";
import { getCalculatorSchema, getBreadcrumbSchema } from "@/lib/seo/schema";

import CCvsPLCalc from "@/components/calculators/CCvsPLCalc";
import { RelatedCalculators } from "@/components/ui/RelatedCalculators";

export const metadata = buildMetadata({
  title: "Credit Card vs Personal Loan — Should You Switch? Honest Calculator",
  description:
    "Your credit card charges 42% PA. A personal loan charges 14%. Sounds obvious — but after processing fees, the math isn't always clear. See the honest comparison.",
  path: "/calculators/cc-vs-personal-loan",
  keywords: [
    "personal loan to clear credit card India",
    "credit card vs personal loan",
    "should I take personal loan for credit card",
    "credit card debt consolidation",
  ],
});

export default function CCvsPersonalLoanPage() {
  const calcSchema = getCalculatorSchema({
    name: "Credit Card vs Personal Loan Calculator",
    description:
      "Compare the true cost of credit card debt vs a personal loan including processing fees, break-even analysis, and honest recommendation.",
    url: "https://lastemi.com/calculators/cc-vs-personal-loan",
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "LastEMI", url: "https://lastemi.com" },
    { name: "Calculators", url: "https://lastemi.com/calculators/cc-vs-personal-loan" },
    { name: "CC vs Personal Loan", url: "https://lastemi.com/calculators/cc-vs-personal-loan" },
  ]);

  return (
    <div className="bg-background min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calcSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <main className="max-w-4xl mx-auto py-6 px-3 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Credit Card vs Personal Loan: Should You Switch?
        </h1>
        <p className="text-muted-foreground mb-6 text-sm sm:text-base">
          Your credit card charges 3.5% per month (42% PA). A personal loan charges 12-18% PA. The rate gap is massive — but after processing fees and the fine print, is switching always the right move? Enter your numbers to find out.
        </p>

        <CCvsPLCalc />

        <section className="mt-12 space-y-6 text-foreground text-sm sm:text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-foreground">
            When Does a Personal Loan Make Sense?
          </h2>
          <p>
            Credit cards charge 3.5% per month — that&apos;s 42% per annum on any outstanding balance. A personal loan typically costs 12-18% per annum. The rate difference alone can save you tens of thousands of rupees in interest. But the math only works under specific conditions:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Outstanding above ₹50,000:</strong> For smaller amounts, the processing fee (1.5-3% of the loan amount) eats into your savings. On a ₹30,000 balance, a 2% fee is ₹600 — the interest saving over 12 months may not justify the effort.</li>
            <li><strong>You can commit to EMIs:</strong> A personal loan has fixed EMIs. If you miss one, it hurts your CIBIL score more than a missed credit card minimum due. Only switch if your cash flow supports the EMI.</li>
            <li><strong>You won&apos;t run up the card again:</strong> The biggest trap — people take a PL to clear the card, then spend on the card again. Now they have both EMI and fresh card debt. If this is a risk, cut the card first.</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground">
            The Hidden Costs Banks Won&apos;t Tell You
          </h2>
          <p>
            Banks aggressively push personal loans to credit card holders — it&apos;s their most profitable conversion. But they don&apos;t highlight these costs:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Processing fee:</strong> Typically 1.5-3% of the loan amount, deducted upfront. On a ₹2 lakh loan, that&apos;s ₹3,000-6,000 you pay before a single EMI.</li>
            <li><strong>Prepayment penalty:</strong> Unlike floating rate home loans (where RBI mandates zero penalty), personal loans often carry a 2-4% prepayment charge. If you get a bonus and want to close early, you&apos;ll pay for the privilege.</li>
            <li><strong>Insurance bundling:</strong> Many banks bundle loan protection insurance, adding 0.5-1% to the effective rate. Always ask if insurance is included and if it&apos;s optional.</li>
            <li><strong>CIBIL impact:</strong> A new personal loan temporarily dips your credit score (hard inquiry + new account). If you&apos;re planning a home loan in the next 6 months, the timing matters.</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground">
            The Honest Verdict
          </h2>
          <p>
            If your credit card outstanding is above ₹1 lakh and you can get a personal loan below 16% with processing fee under 2%, the switch almost always saves money. For amounts below ₹50,000, it&apos;s usually better to just pay ₹5,000-10,000 extra per month on the card directly — you&apos;ll clear it in under a year without any fees.
          </p>
          <p>
            The calculator above accounts for all of this — processing fees, the exact interest differential, and the break-even month. We only recommend switching when the net saving exceeds ₹5,000, because anything less isn&apos;t worth the paperwork and CIBIL impact.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Link
              href="/calculators/minimum-due-trap"
              className="text-primary hover:text-primary underline font-medium"
            >
              See the Minimum Due Trap Calculator →
            </Link>
            <Link
              href="/calculators/credit-card-payoff"
              className="text-primary hover:text-primary underline font-medium"
            >
              Credit Card Payoff Calculator →
            </Link>
          </div>

          <div className="bg-accent border border-primary/20 rounded-lg p-4 mt-6">
            <p className="text-primary font-medium">
              Struggling with multiple credit cards? Track all your debts and get a personalized payoff plan.{" "}
              <Link href="/login" className="underline font-semibold">
                Start your free debt-free plan →
              </Link>
            </p>
          </div>
        </section>

        <RelatedCalculators />
      </main>
    </div>
  );
}
