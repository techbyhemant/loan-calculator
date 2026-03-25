import Link from "next/link";

import { buildMetadata } from "@/lib/seo/metadata";
import { getCalculatorSchema, getBreadcrumbSchema } from "@/lib/seo/schema";

import ConsumerEMITrueCostCalc from "@/components/calculators/ConsumerEMITrueCostCalc";

export const metadata = buildMetadata({
  title:
    "0% EMI True Cost Calculator — What 'No Cost EMI' Actually Costs",
  description:
    "Uncover the hidden processing fees in 0% EMI offers. Enter the purchase price and tenure to see the effective annual interest rate, GST on fees, and total extra cost vs paying cash.",
  path: "/calculators/consumer-emi-true-cost",
  keywords: [
    "no cost EMI hidden charges India",
    "0% EMI real cost",
    "consumer EMI processing fee",
    "no cost EMI calculator",
    "0 percent EMI true cost",
    "EMI processing fee calculator",
  ],
});

export default function ConsumerEMITrueCostPage() {
  const calcSchema = getCalculatorSchema({
    name: "0% EMI True Cost Calculator",
    description:
      "Calculate the real cost of '0% EMI' offers. See the hidden processing fee, effective annual interest rate, and how much more you pay compared to cash.",
    url: "https://lastemi.com/calculators/consumer-emi-true-cost",
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "LastEMI", url: "https://lastemi.com" },
    {
      name: "Calculators",
      url: "https://lastemi.com/calculators/consumer-emi-true-cost",
    },
    {
      name: "0% EMI True Cost",
      url: "https://lastemi.com/calculators/consumer-emi-true-cost",
    },
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
          0% EMI True Cost Calculator: What &quot;No Cost EMI&quot; Actually
          Costs
        </h1>
        <p className="text-muted-foreground mb-6 text-sm sm:text-base">
          That &quot;0% interest&quot; offer on your new phone or laptop is not
          free. Sellers charge a processing fee of 1-3% upfront — which is the
          interest, just renamed. Enter your purchase details to see the real
          cost.
        </p>

        <ConsumerEMITrueCostCalc />

        <section className="mt-12 space-y-6 text-foreground text-sm sm:text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-foreground">
            How &quot;No Cost EMI&quot; Actually Works in India
          </h2>
          <p>
            When you buy a product on No Cost EMI, the bank or NBFC converts
            the purchase into equated monthly instalments at 0% interest. That
            sounds free — but there is always a processing fee, typically 1.5%
            to 3% of the purchase price. This fee is deducted upfront or added
            to the first EMI. Since the fee is proportional to the price and
            tenure, it functions exactly like interest — it is just not called
            that.
          </p>
          <p>
            For example, a {"\u20B9"}50,000 phone on 12-month No Cost EMI with
            a 2% processing fee costs you {"\u20B9"}1,000 extra. Add 18% GST on
            that fee ({"\u20B9"}180), and you have paid {"\u20B9"}1,180 more
            than the cash price. The effective annual rate works out to roughly
            3.7% — not zero.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            Why Banks Can Legally Call It &quot;0% Interest&quot;
          </h2>
          <p>
            RBI regulations require transparency on interest rates, but
            processing fees fall outside the &quot;interest&quot; definition.
            Banks and NBFCs exploit this loophole: they set the interest rate to
            0% and recover their cost through the processing fee instead. Since
            the fee is disclosed (usually in small print), it is technically
            legal. The result is that consumers see &quot;0% EMI&quot; in big
            bold text and miss the fee buried in the terms and conditions.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Processing fee:</strong> 1-3% of purchase price, charged
              upfront. This is the hidden interest.
            </li>
            <li>
              <strong>GST on processing fee:</strong> 18% GST is charged on the
              fee itself, adding another layer of cost most people miss.
            </li>
            <li>
              <strong>Subvention model:</strong> Some sellers absorb the
              processing fee to offer truly zero-cost EMI. These are rare and
              usually during festive sales.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground">
            When Should You Use No Cost EMI?
          </h2>
          <p>
            No Cost EMI is not always bad — it depends on the fee and what you
            would do with the cash. If the processing fee is under 1% and you
            can invest the cash in a liquid fund earning 7%+, the EMI option
            actually works in your favour. But if the fee is 2-3% on a short
            tenure, you are better off paying cash and avoiding the extra cost
            entirely.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Use EMI when:</strong> the processing fee is very low
              (&lt;1%), the tenure is long (18-24 months), and you can invest
              the cash meanwhile.
            </li>
            <li>
              <strong>Pay cash when:</strong> the processing fee is 2%+ on a
              short tenure (3-6 months), or the product is under{" "}
              {"\u20B9"}15,000 — the fee plus GST is not worth the hassle.
            </li>
            <li>
              <strong>Always check:</strong> whether the seller is absorbing the
              fee (truly free) or passing it to you (hidden cost).
            </li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Link
              href="/calculators/sip-vs-prepayment"
              className="inline-flex items-center justify-center px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              SIP vs Prepayment Calculator →
            </Link>
            <Link
              href="/calculators/credit-card-payoff"
              className="inline-flex items-center justify-center px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              Credit Card Payoff Calculator →
            </Link>
          </div>

          <div className="bg-accent border border-primary/20 rounded-lg p-4 mt-6">
            <p className="text-primary font-medium">
              Tracking multiple loans and EMIs? See your exact debt-free date
              and save lakhs in interest.{" "}
              <Link href="/login" className="underline font-semibold">
                Start your free debt-free plan →
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
