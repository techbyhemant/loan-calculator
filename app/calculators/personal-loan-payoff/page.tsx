import Link from "next/link";

import { buildMetadata } from "@/lib/seo/metadata";
import { getCalculatorSchema, getBreadcrumbSchema } from "@/lib/seo/schema";

import PersonalLoanPayoffCalc from "@/components/calculators/PersonalLoanPayoffCalc";
import { RelatedCalculators } from "@/components/ui/RelatedCalculators";

export const metadata = buildMetadata({
  title:
    "Personal Loan Prepayment Calculator — Is It Worth the Penalty?",
  description:
    "Calculate if prepaying your personal loan saves money after foreclosure charges. See net savings, penalty amount, and months reduced instantly.",
  path: "/calculators/personal-loan-payoff",
  keywords: [
    "personal loan prepayment calculator India",
    "personal loan foreclosure charges",
    "personal loan part payment calculator",
    "personal loan penalty calculator",
    "should I prepay personal loan",
  ],
});

export default function PersonalLoanPayoffPage() {
  const calcSchema = getCalculatorSchema({
    name: "Personal Loan Prepayment Calculator",
    description:
      "Calculate net savings from prepaying a personal loan after accounting for foreclosure penalty, lock-in period, and interest saved.",
    url: "https://lastemi.com/calculators/personal-loan-payoff",
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "LastEMI", url: "https://lastemi.com" },
    {
      name: "Calculators",
      url: "https://lastemi.com/calculators/personal-loan-payoff",
    },
    {
      name: "Personal Loan Payoff",
      url: "https://lastemi.com/calculators/personal-loan-payoff",
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
          Personal Loan Prepayment Calculator: Is It Worth the Penalty?
        </h1>
        <p className="text-muted-foreground mb-6 text-sm sm:text-base">
          Personal loans carry high interest (11-24%) but also charge 2-5%
          foreclosure penalty. Enter your numbers to see if prepaying actually
          saves you money after the penalty.
        </p>

        <PersonalLoanPayoffCalc />

        <section className="mt-12 space-y-6 text-foreground text-sm sm:text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-foreground">
            How Personal Loan Foreclosure Charges Work in India
          </h2>
          <p>
            Unlike home loans on floating rates (where RBI mandates zero
            prepayment penalty), personal loans are unsecured and banks are
            legally allowed to charge foreclosure fees. Most banks charge 2-5%
            of the outstanding principal as a penalty. Some banks also impose a
            lock-in period of 3-12 months during which prepayment is not
            allowed at all.
          </p>
          <p>
            The penalty is typically calculated on the prepaid amount, not the
            original loan amount. So if your outstanding is &#8377;3,00,000 and
            you prepay &#8377;1,00,000, the penalty applies only to
            &#8377;1,00,000. Always confirm this with your lender before
            making the payment.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            When Should You Prepay a Personal Loan?
          </h2>
          <p>
            <strong>Prepay when:</strong> Your interest rate is above 14%, you
            have surplus funds earning less than the loan rate (savings account
            at 3-4%), and the net saving after penalty exceeds &#8377;5,000.
            The higher your rate, the more prepayment makes sense despite the
            penalty.
          </p>
          <p>
            <strong>Don&apos;t prepay when:</strong> You&apos;re within the lock-in
            period, the penalty wipes out your interest savings, or you have
            higher-interest credit card debt to clear first. Always attack the
            most expensive debt first.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            Personal Loan vs Home Loan: Prepayment Rules Compared
          </h2>
          <p>
            RBI&apos;s 2014 circular protects floating-rate home loan borrowers
            with zero prepayment penalty. Personal loans have no such
            protection. This means your bank can legally charge whatever
            penalty is mentioned in your loan agreement. Always read the
            foreclosure clause before signing.
          </p>
          <p>
            This is also why personal loans should be your top priority for
            prepayment in a multi-loan portfolio &mdash; they have the highest
            rates and no penalty protection. Clear personal loans before making
            extra home loan payments.
          </p>

          <div className="bg-accent border border-primary/20 rounded-lg p-4 mt-6">
            <p className="text-primary font-medium">
              Have multiple loans? See which to pay first.{" "}
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
