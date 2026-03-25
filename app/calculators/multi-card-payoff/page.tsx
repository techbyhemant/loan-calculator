import Link from "next/link";

import { buildMetadata } from "@/lib/seo/metadata";
import { getCalculatorSchema, getBreadcrumbSchema } from "@/lib/seo/schema";

import MultiCardPayoffCalc from "@/components/calculators/MultiCardPayoffCalc";

export const metadata = buildMetadata({
  title:
    "Multi-Card Payoff Calculator — Avalanche vs Snowball Strategy",
  description:
    "Multiple credit cards? Compare avalanche (highest rate first) vs snowball (lowest balance first) strategies. See which one saves you more and plan your payoff order.",
  path: "/calculators/multi-card-payoff",
  keywords: [
    "pay off multiple credit cards India",
    "avalanche vs snowball",
    "multi card payoff calculator",
    "credit card debt strategy",
    "debt payoff order",
  ],
});

export default function MultiCardPayoffPage() {
  const calcSchema = getCalculatorSchema({
    name: "Multi-Card Payoff Calculator",
    description:
      "Compare avalanche vs snowball strategies for paying off multiple credit cards. See total interest, payoff order, and months to debt-free for each approach.",
    url: "https://lastemi.com/calculators/multi-card-payoff",
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "LastEMI", url: "https://lastemi.com" },
    { name: "Calculators", url: "https://lastemi.com/calculators/multi-card-payoff" },
    { name: "Multi-Card Payoff", url: "https://lastemi.com/calculators/multi-card-payoff" },
  ]);

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
      <main className="max-w-4xl mx-auto py-6 px-3 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Multi-Card Payoff Calculator: Avalanche vs Snowball
        </h1>
        <p className="text-muted-foreground mb-6 text-sm sm:text-base">
          Juggling multiple credit cards? Enter your balances and monthly budget
          to see the smartest payoff order. We compare avalanche and snowball
          strategies so you know exactly how much each one costs.
        </p>

        <MultiCardPayoffCalc />

        <section className="mt-12 space-y-6 text-foreground text-sm sm:text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-foreground">
            The Avalanche Method: Pay Less Interest
          </h2>
          <p>
            The avalanche method targets the card with the highest interest rate
            first. You pay minimums on all other cards and throw every extra
            rupee at the most expensive debt. Once that card is cleared, the
            freed-up money rolls to the next highest rate card.
          </p>
          <p>
            This approach is mathematically optimal — it always results in the
            least total interest paid. For Indian credit cards charging 3.5% per
            month (42% per annum), the rate differences between cards might seem
            small, but over 12-24 months of payoff the savings compound
            significantly.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            The Snowball Method: Build Momentum
          </h2>
          <p>
            The snowball method targets the card with the smallest balance first,
            regardless of interest rate. The idea is psychological: clearing a
            card completely gives you a quick win and motivation to keep going.
            Research shows that people who use snowball are more likely to
            actually become debt-free because they stay motivated.
          </p>
          <p>
            The trade-off is that you pay slightly more in total interest. But if
            the alternative is giving up halfway, snowball wins every time.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            Which Strategy Should You Choose?
          </h2>
          <p>
            <strong>Choose avalanche if:</strong> the interest rate difference
            between your cards is large, you are disciplined with money, and
            saving the maximum amount matters most to you.
          </p>
          <p>
            <strong>Choose snowball if:</strong> you have several small balances
            that can be cleared quickly, you need motivation to stick with the
            plan, or the interest difference between strategies is small (under
            ₹500).
          </p>
          <p>
            Either way, the most important thing is to fix a total monthly budget
            and stick to it. Paying just the minimum due on all cards is the
            worst possible strategy — our{" "}
            <Link
              href="/calculators/minimum-due-trap"
              className="text-primary hover:underline font-medium"
            >
              Minimum Due Trap Calculator
            </Link>{" "}
            shows you exactly why.
          </p>

          <p>
            Already know you want to clear a single card fast? Use our{" "}
            <Link
              href="/calculators/credit-card-payoff"
              className="text-primary hover:underline font-medium"
            >
              Credit Card Payoff Calculator
            </Link>{" "}
            for a detailed month-by-month breakdown.
          </p>

          <div className="bg-accent border border-primary/20 rounded-lg p-4 mt-6">
            <p className="text-primary font-medium">
              Want to track your payoff progress and get reminders?{" "}
              <Link href="/login" className="underline font-semibold">
                Create your free debt-free plan →
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
