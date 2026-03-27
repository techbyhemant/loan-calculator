import Link from "next/link";

import { buildMetadata } from "@/lib/seo/metadata";
import { getCalculatorSchema, getBreadcrumbSchema, getFAQSchema } from "@/lib/seo/schema";

import MinimumDueTrapCalc from "@/components/calculators/MinimumDueTrapCalc";
import { RelatedCalculators } from "@/components/ui/RelatedCalculators";

export const metadata = buildMetadata({
  title:
    "Minimum Due Trap Calculator — What Paying 5% Actually Costs You",
  description:
    "On ₹50,000 outstanding, paying only minimum due means 8+ years and ₹1.8L in interest. See exactly what the minimum due trap costs you and how much to pay instead.",
  path: "/calculators/minimum-due-trap",
  keywords: [
    "credit card minimum due trap India",
    "minimum payment calculator",
    "credit card interest cost",
    "minimum due trap",
    "credit card debt calculator",
  ],
});

const faqs = [
  {
    question: "How long does it take to pay off a credit card with minimum due only?",
    answer:
      "On a \u20B950,000 balance at 3.5% monthly interest, paying only 5% minimum due takes approximately 8-10 years and costs \u20B91.5-2L in total interest + GST.",
  },
  {
    question: "What is the minimum due on a credit card in India?",
    answer:
      "Minimum due is typically 5% of your outstanding balance or \u20B9200, whichever is higher. Banks set this to keep you in debt as long as possible.",
  },
  {
    question: "How to escape the minimum due trap?",
    answer:
      "Pay a fixed amount each month (not the shrinking minimum). Even \u20B93,000/month on a \u20B950,000 balance clears it in 18 months instead of 8+ years.",
  },
];

export default function MinimumDueTrapPage() {
  const calcSchema = getCalculatorSchema({
    name: "Minimum Due Trap Calculator",
    description:
      "Calculate the real cost of paying only minimum due on your credit card. See how many years and how much extra interest the minimum due trap costs you.",
    url: "https://lastemi.com/calculators/minimum-due-trap",
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "LastEMI", url: "https://lastemi.com" },
    {
      name: "Calculators",
      url: "https://lastemi.com/calculators/minimum-due-trap",
    },
    {
      name: "Minimum Due Trap",
      url: "https://lastemi.com/calculators/minimum-due-trap",
    },
  ]);

  const faqSchema = getFAQSchema(faqs);

  return (
    <div className="bg-background min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calcSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="max-w-4xl mx-auto py-6 px-3 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Minimum Due Trap Calculator: What Paying 5% Actually Costs You
        </h1>
        <p className="text-muted-foreground mb-6 text-sm sm:text-base">
          Banks want you to pay minimum due. It keeps you in debt for years and
          earns them massive interest. Enter your balance to see the real cost
          — and what you should pay instead.
        </p>

        <MinimumDueTrapCalc />

        <section className="mt-12 space-y-6 text-foreground text-sm sm:text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-foreground">
            How Credit Card Minimum Due Works in India
          </h2>
          <p>
            Every credit card statement shows a &quot;minimum due&quot; amount — typically
            5% of your outstanding balance or ₹200, whichever is higher. Banks
            frame this as a convenience: &quot;Just pay ₹1,500 instead of ₹30,000
            and stay in good standing.&quot; What they don&apos;t highlight is that the
            remaining 95% continues to attract interest at 3.5% per month (42%
            per annum) — one of the highest interest rates in consumer finance.
          </p>
          <p>
            The minimum due is calculated as: <strong>max(Outstanding x 5%, ₹200)</strong>.
            As your balance slowly reduces, the minimum due shrinks too. This
            creates a vicious cycle — your payments get smaller, more goes toward
            interest, and less toward principal. A ₹30,000 balance can take over
            11 years to clear with minimum payments alone.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            Why the Minimum Due Is a Trap
          </h2>
          <p>
            The minimum due trap works because of three compounding factors that
            banks never explain upfront:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Shrinking payments:</strong> As your balance drops, the 5%
              minimum due also drops. You end up paying ₹500/month on a balance
              that was ₹30,000 — barely covering the monthly interest.
            </li>
            <li>
              <strong>Loss of interest-free period:</strong> The moment you carry
              forward any balance, you lose the interest-free period on ALL
              transactions — including new purchases. Interest is charged from the
              transaction date, not the due date.
            </li>
            <li>
              <strong>42% annual interest:</strong> At 3.5% per month compounding,
              you pay more in interest than the original purchase price. A ₹50,000
              balance paid via minimum due costs over ₹1.8 lakh in total — you pay
              3.6x your original spending.
            </li>
          </ul>
          <p>
            Banks earn their highest margins from customers who pay minimum due.
            That is why they make it the default option and highlight it in bold on
            every statement.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            How to Escape the Minimum Due Trap
          </h2>
          <p>
            The math is simple: pay more than the minimum, and pay as quickly as
            possible. Here are three practical strategies:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Pay the full outstanding every month.</strong> This is the
              only way to avoid interest completely. If you cannot pay the full
              amount, pay as much as you can — every extra rupee above the minimum
              goes directly toward reducing your principal.
            </li>
            <li>
              <strong>Set a fixed monthly payment.</strong> Instead of paying the
              declining minimum, commit to a fixed amount (e.g., ₹3,000/month).
              This dramatically shortens your payoff timeline because the payment
              does not shrink with your balance.
            </li>
            <li>
              <strong>Consider a personal loan for large balances.</strong> If your
              credit card balance exceeds ₹50,000, a personal loan at 12-15% is
              often cheaper than credit card interest at 42%. Use our{" "}
              <Link
                href="/calculators/cc-vs-personal-loan"
                className="text-primary hover:underline font-medium"
              >
                CC vs Personal Loan calculator
              </Link>{" "}
              to compare.
            </li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Link
              href="/calculators/credit-card-payoff"
              className="inline-flex items-center justify-center px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              Credit Card Payoff Calculator →
            </Link>
            <Link
              href="/calculators/cc-vs-personal-loan"
              className="inline-flex items-center justify-center px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              CC vs Personal Loan Calculator →
            </Link>
          </div>

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
              Stuck in credit card debt? Track all your cards, set payoff targets,
              and see your debt-free date.{" "}
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
