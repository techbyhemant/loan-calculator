import Link from "next/link";

import { buildMetadata } from "@/lib/seo/metadata";
import { getCalculatorSchema, getBreadcrumbSchema, getFAQSchema } from "@/lib/seo/schema";

import BalanceTransferCalc from "@/components/calculators/BalanceTransferCalc";

export const metadata = buildMetadata({
  title: "Home Loan Balance Transfer Calculator — Is It Worth Switching?",
  description:
    "Calculate if transferring your home loan to a lower rate actually saves money after processing fees and charges. See the break-even point before you switch.",
  path: "/calculators/balance-transfer",
  keywords: [
    "home loan balance transfer calculator",
    "balance transfer worth it",
    "home loan refinance India",
    "switch home loan lower rate",
    "balance transfer break even",
  ],
});

const faqs = [
  {
    question: "Is home loan balance transfer worth it?",
    answer:
      "Balance transfer is worth it if the net saving (after processing fees and legal charges) exceeds \u20B925,000 and you have at least 5+ years remaining on your loan. For smaller savings, the paperwork hassle outweighs the benefit.",
  },
  {
    question: "Can my bank charge prepayment penalty when I transfer my home loan?",
    answer:
      "No. RBI mandates zero prepayment penalty on floating rate home loans. Your current bank cannot charge any fee for closing the loan before transfer.",
  },
  {
    question: "How long does home loan balance transfer take?",
    answer:
      "The process typically takes 2-4 weeks including property valuation, legal verification, and NOC from the old bank.",
  },
];

export default function BalanceTransferPage() {
  const calcSchema = getCalculatorSchema({
    name: "Home Loan Balance Transfer Calculator",
    description: "Calculate net savings from transferring your home loan to a lower rate. Includes processing fees, legal charges, and break-even analysis.",
    url: "https://lastemi.com/calculators/balance-transfer",
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "LastEMI", url: "https://lastemi.com" },
    { name: "Calculators", url: "https://lastemi.com/calculators/balance-transfer" },
    { name: "Balance Transfer", url: "https://lastemi.com/calculators/balance-transfer" },
  ]);

  const faqSchema = getFAQSchema(faqs);

  return (
    <div className="bg-background min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calcSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main className="max-w-4xl mx-auto py-6 px-3 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Home Loan Balance Transfer Calculator: Is It Worth Switching?
        </h1>
        <p className="text-muted-foreground mb-6 text-sm sm:text-base">
          A lower rate sounds great — but after processing fees, legal charges, and the hassle, is it actually worth it? Enter your numbers to find out.
        </p>

        <BalanceTransferCalc />

        <section className="mt-12 space-y-6 text-foreground text-sm sm:text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-foreground">
            What Is a Home Loan Balance Transfer?
          </h2>
          <p>
            A balance transfer means moving your existing home loan from one bank to another that offers a lower interest rate. Your outstanding principal gets refinanced at the new rate, potentially saving you lakhs in interest over the remaining tenure.
          </p>
          <p>
            However, the transfer isn&apos;t free. Banks charge processing fees (0.25-1% of the outstanding amount), legal and valuation charges (₹10,000-25,000), and the entire process takes 2-4 weeks of paperwork.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            The Break-Even Rule
          </h2>
          <p>
            The break-even point is the number of months it takes for your monthly savings to cover the transfer costs. If your break-even is 18 months and you have 10 years remaining, the transfer is clearly worth it. If the break-even is 5 years and you have 6 years remaining — probably not.
          </p>
          <p>
            <strong>Our honest rule:</strong> If the net saving (after all fees) is less than ₹25,000, the transfer is usually not worth the paperwork and hassle. A bank will never tell you this — they want the new business.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            Important: Zero Prepayment Penalty on Floating Rate
          </h2>
          <p>
            By RBI mandate, your current bank <strong>cannot charge any prepayment penalty</strong> if your loan is on a floating rate. This means the only costs are the new bank&apos;s processing and legal fees. If your current bank threatens a penalty on a floating rate loan, they are violating RBI guidelines.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            Before You Transfer: Try Negotiating First
          </h2>
          <p>
            Before going through the transfer process, call your current bank and ask for a rate reduction. Show them the competing offer. Banks often match or come close to retain existing customers — especially if you have a good repayment track record and CIBIL score above 750.
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
              Already transferred? Track your new loan and plan prepayments.{" "}
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
