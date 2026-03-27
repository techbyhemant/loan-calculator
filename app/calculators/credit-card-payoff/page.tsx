import Link from "next/link";

import { buildMetadata } from "@/lib/seo/metadata";
import { getCalculatorSchema, getBreadcrumbSchema, getFAQSchema } from "@/lib/seo/schema";

import CCPayoffCalc from "@/components/calculators/CCPayoffCalc";
import { RelatedCalculators } from "@/components/ui/RelatedCalculators";

export const metadata = buildMetadata({
  title: "Credit Card Payoff Calculator — How Long to Clear Your Balance?",
  description:
    "Calculate exactly how long it will take to pay off your credit card debt. Compare minimum due vs fixed payment strategies. See the real cost of credit card interest at 42% PA.",
  path: "/calculators/credit-card-payoff",
  keywords: [
    "credit card payoff calculator India",
    "credit card debt calculator",
    "how long to clear credit card",
    "credit card interest calculator",
    "42% credit card interest",
  ],
});

const faqs = [
  {
    question: "How is credit card interest calculated in India?",
    answer:
      "Banks charge 2.5-3.5% per month (30-42% PA) on your unpaid balance. Interest is calculated daily on the average daily balance. Additionally, 18% GST is charged on the interest amount.",
  },
  {
    question: "What happens if I pay only the minimum due?",
    answer:
      "Paying only the minimum due (5% of balance) means your debt takes 8-15 years to clear and you pay 3-5x the original amount in interest + GST. Use our minimum due trap calculator to see exact numbers.",
  },
  {
    question: "Does GST apply on credit card interest?",
    answer:
      "Yes. 18% GST is charged on ALL credit card fees including interest on unpaid balance, late payment charges, annual fees, and processing fees.",
  },
];

export default function CreditCardPayoffPage() {
  const calcSchema = getCalculatorSchema({
    name: "Credit Card Payoff Calculator",
    description:
      "Calculate how long it takes to pay off credit card debt with a fixed monthly payment. Compare minimum due vs fixed payment strategies and see the real cost of 42% PA interest.",
    url: "https://lastemi.com/calculators/credit-card-payoff",
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "LastEMI", url: "https://lastemi.com" },
    { name: "Calculators", url: "https://lastemi.com/calculators/credit-card-payoff" },
    { name: "Credit Card Payoff", url: "https://lastemi.com/calculators/credit-card-payoff" },
  ]);

  const faqSchema = getFAQSchema(faqs);

  return (
    <div className="bg-background min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calcSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main className="max-w-4xl mx-auto py-6 px-3 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Credit Card Payoff Calculator: How Long to Clear Your Balance?
        </h1>
        <p className="text-muted-foreground mb-6 text-sm sm:text-base">
          Credit cards charge 3.5% per month — that&apos;s 42% per annum. Enter your balance and monthly payment to see exactly how long it will take to become debt-free, and how much interest you&apos;ll pay along the way.
        </p>

        <CCPayoffCalc />

        <section className="mt-12 space-y-6 text-foreground text-sm sm:text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-foreground">
            How Credit Card Interest Works in India
          </h2>
          <p>
            Most Indian credit cards charge a monthly interest rate of 3.5%, which translates to approximately 42% per annum. This is significantly higher than any other form of consumer credit — home loans are 8-10%, personal loans are 12-18%, and even gold loans are 7-12%.
          </p>
          <p>
            The interest is calculated on a daily balance basis. If your outstanding balance is ₹1,00,000 and you don&apos;t pay the full amount by the due date, you&apos;ll be charged roughly ₹3,500 in interest for that month alone. Over a year, that&apos;s ₹42,000 — nearly half your original balance — without reducing the principal by a single rupee if you only pay minimum due.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            The Minimum Due Trap
          </h2>
          <p>
            Banks set the minimum due at just 5% of the outstanding balance (or ₹200, whichever is higher). This seems convenient — you stay &quot;current&quot; on your credit report, no late fees, and a small monthly outflow. But here&apos;s what they don&apos;t tell you:
          </p>
          <p>
            On a ₹50,000 balance at 3.5% monthly interest, paying only minimum due means it will take you <strong>over 8 years</strong> to clear the debt, and you&apos;ll pay over <strong>₹1,00,000 in interest alone</strong> — more than double your original balance. The minimum due shrinks as your balance shrinks, so you never build momentum.
          </p>
          <p>
            Use our{" "}
            <Link href="/calculators/minimum-due-trap" className="text-primary underline font-medium">
              Minimum Due Trap Calculator
            </Link>{" "}
            to see the exact cost for your balance.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            When to Consider a Personal Loan Instead
          </h2>
          <p>
            If your credit card outstanding is above ₹50,000 and you can&apos;t clear it within 3-4 months, a personal loan at 12-18% PA is almost always cheaper than revolving credit card interest at 42% PA. Yes, there&apos;s a processing fee (1-2%), but the interest saving over 12-24 months can be substantial.
          </p>
          <p>
            Use our{" "}
            <Link href="/calculators/cc-vs-personal-loan" className="text-primary underline font-medium">
              Credit Card vs Personal Loan Calculator
            </Link>{" "}
            to see if switching makes sense for your situation — including processing fees and break-even analysis.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            The Interest-Free Period Rule You Must Know
          </h2>
          <p>
            If you pay the <strong>full outstanding</strong> by the due date every month, you get 20-50 days of interest-free credit. But the moment you pay even ₹1 less than the full amount, the interest-free period is lost — and interest is charged on the <strong>entire balance from the transaction date</strong>, not just the unpaid portion. This is why partial payments on credit cards are far more expensive than people realize.
          </p>

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
              Struggling with credit card debt? Track all your debts and get a personalized payoff plan.{" "}
              <Link href="/login" className="underline font-semibold">
                Start your free debt-free plan &rarr;
              </Link>
            </p>
          </div>
        </section>

        <RelatedCalculators />
      </main>
    </div>
  );
}
