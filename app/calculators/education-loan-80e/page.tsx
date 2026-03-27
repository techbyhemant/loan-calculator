import Link from "next/link";

import { buildMetadata } from "@/lib/seo/metadata";
import { getCalculatorSchema, getBreadcrumbSchema, getFAQSchema } from "@/lib/seo/schema";

import EducationLoan80ECalc from "@/components/calculators/EducationLoan80ECalc";
import { RelatedCalculators } from "@/components/ui/RelatedCalculators";

export const metadata = buildMetadata({
  title:
    "Education Loan Section 80E Calculator — Tax Benefit & Repayment Planner",
  description:
    "Calculate Section 80E tax savings on your education loan. See effective interest rate after tax benefit, moratorium impact, and year-by-year deduction breakdown.",
  path: "/calculators/education-loan-80e",
  keywords: [
    "education loan 80E calculator India",
    "education loan repayment strategy",
    "section 80E tax benefit calculator",
    "education loan moratorium calculator",
    "education loan interest deduction",
  ],
});

const faqs = [
  {
    question: "Is there a limit on Section 80E deduction?",
    answer:
      "No upper limit \u2014 the entire interest amount is deductible for 8 years from the year you start repaying. This makes education loans one of the cheapest after-tax borrowing options.",
  },
  {
    question: "What happens during the moratorium period of an education loan?",
    answer:
      "Interest accrues on your loan during the moratorium (course duration + 1 year) but you pay no EMIs. When EMIs start, your outstanding will be higher than the original loan amount.",
  },
];

export default function EducationLoan80EPage() {
  const calcSchema = getCalculatorSchema({
    name: "Education Loan Section 80E Calculator",
    description:
      "Calculate Section 80E tax benefits on education loans. Shows effective rate after deduction, moratorium interest accrual, and year-by-year tax savings.",
    url: "https://lastemi.com/calculators/education-loan-80e",
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "LastEMI", url: "https://lastemi.com" },
    {
      name: "Calculators",
      url: "https://lastemi.com/calculators/education-loan-80e",
    },
    {
      name: "Education Loan 80E",
      url: "https://lastemi.com/calculators/education-loan-80e",
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
          Education Loan Section 80E Calculator: Tax Benefit &amp; Repayment
          Planner
        </h1>
        <p className="text-muted-foreground mb-6 text-sm sm:text-base">
          Education loans are unique &mdash; they come with a moratorium period
          (no EMIs while you study) and unlimited interest deduction under
          Section 80E. This calculator shows you the real cost of your loan
          after tax benefits and the hidden impact of moratorium interest.
        </p>

        <EducationLoan80ECalc />

        <section className="mt-12 space-y-6 text-foreground text-sm sm:text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-foreground">
            What Is Section 80E and Why It Matters
          </h2>
          <p>
            Section 80E of the Income Tax Act allows you to deduct the{" "}
            <strong>entire interest paid</strong> on an education loan from your
            taxable income. Unlike Section 24(b) for home loans (capped at
            &#8377;2,00,000) or Section 80C (capped at &#8377;1,50,000), Section 80E
            has <strong>no upper limit</strong> on the deduction amount. If you
            pay &#8377;1,50,000 in interest, the full amount is deductible.
          </p>
          <p>
            This deduction is available for up to 8 assessment years from the
            year you start repaying the loan, or until the interest is fully
            repaid &mdash; whichever comes first. The loan must be taken from a
            recognised financial institution or approved charitable institution.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            The Moratorium Trap: Hidden Interest Capitalisation
          </h2>
          <p>
            Most education loans offer a moratorium period &mdash; typically the
            course duration plus 6-12 months &mdash; during which you don&apos;t
            pay EMIs. This sounds great, but interest continues to accrue
            during this period. Worse, this interest gets{" "}
            <strong>capitalised</strong> (added to your principal), meaning you
            end up paying interest on interest.
          </p>
          <p>
            For example, on a &#8377;10,00,000 loan at 10.5%, a 24-month
            moratorium adds approximately &#8377;2,10,000 to your outstanding.
            Your EMIs are then calculated on &#8377;12,10,000 &mdash; not the
            original &#8377;10,00,000. If you can afford to pay even the
            interest during the moratorium period, you&apos;ll save significantly.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            Smart Repayment Strategy for Education Loans
          </h2>
          <p>
            <strong>During moratorium:</strong> Pay at least the monthly
            interest to prevent capitalisation. Even partial payments help.
          </p>
          <p>
            <strong>After moratorium:</strong> Compare your effective rate (after
            80E benefit) with risk-free returns like PPF (7.1%). If your
            effective rate is below PPF, invest surplus in PPF rather than
            prepaying. If above, prepay the loan. Education loans typically
            have zero prepayment penalty, so there&apos;s no cost to paying early.
          </p>
          <p>
            <strong>Tax optimisation:</strong> If you&apos;re in the 30% bracket, a
            10.5% education loan effectively costs only 7.35%. This is close to
            PPF returns, making the decision between prepayment and investment
            a close call. In lower tax brackets, the effective rate is higher,
            making prepayment more attractive.
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
              Managing multiple loans including education?{" "}
              <Link href="/login" className="underline font-semibold">
                Track all your loans and find your debt-free date &rarr;
              </Link>
            </p>
          </div>
        </section>

        <RelatedCalculators />
      </main>
    </div>
  );
}
