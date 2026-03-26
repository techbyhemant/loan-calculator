import Link from "next/link";

import { buildMetadata } from "@/lib/seo/metadata";
import { getCalculatorSchema, getBreadcrumbSchema } from "@/lib/seo/schema";

import CarLoanPrepaymentCalc from "@/components/calculators/CarLoanPrepaymentCalc";
import { RelatedCalculators } from "@/components/ui/RelatedCalculators";

export const metadata = buildMetadata({
  title:
    "Car Loan Prepayment Calculator — Is It Worth the Penalty?",
  description:
    "Calculate if prepaying your car loan saves money after 2-5% penalty. See net savings, penalty amount, months reduced, and whether it's worth it for Indian car loans.",
  path: "/calculators/car-loan-prepayment",
  keywords: [
    "car loan prepayment calculator India",
    "car loan foreclosure charges",
    "car loan part payment calculator",
    "car loan penalty calculator",
    "should I prepay car loan",
    "car loan prepayment penalty",
  ],
});

export default function CarLoanPrepaymentPage() {
  const calcSchema = getCalculatorSchema({
    name: "Car Loan Prepayment Calculator",
    description:
      "Calculate net savings from prepaying a car loan after accounting for foreclosure penalty, lock-in period, and interest saved.",
    url: "https://lastemi.com/calculators/car-loan-prepayment",
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "LastEMI", url: "https://lastemi.com" },
    {
      name: "Calculators",
      url: "https://lastemi.com/calculators/car-loan-prepayment",
    },
    {
      name: "Car Loan Prepayment",
      url: "https://lastemi.com/calculators/car-loan-prepayment",
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
          Car Loan Prepayment Calculator: Is It Worth the Penalty?
        </h1>
        <p className="text-muted-foreground mb-6 text-sm sm:text-base">
          Car loans in India carry 8.5-14% interest and most banks charge 2-5%
          prepayment penalty. Enter your numbers to see if prepaying actually
          saves you money after the penalty is deducted.
        </p>

        <CarLoanPrepaymentCalc />

        <section className="mt-12 space-y-6 text-foreground text-sm sm:text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-foreground">
            How Car Loan Prepayment Penalties Work in India
          </h2>
          <p>
            Unlike floating-rate home loans where RBI mandates zero prepayment
            penalty, car loans are typically fixed-rate and banks are legally
            allowed to charge foreclosure fees. Most car loan agreements include
            a prepayment penalty clause of 2-5% on the outstanding principal.
            Some banks also enforce a lock-in period of 6-12 months during
            which no prepayment is allowed.
          </p>
          <p>
            The penalty is calculated on the prepaid amount, not the original
            loan amount. If your outstanding balance is &#8377;6,00,000 and you
            prepay &#8377;1,00,000 with a 3% penalty, you pay only
            &#8377;3,000 as the fee. However, some banks calculate the penalty
            on the entire outstanding &mdash; always confirm with your lender
            before making the payment.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            When Should You Prepay a Car Loan?
          </h2>
          <p>
            <strong>Prepay when:</strong> You are in the first half of your
            tenure (interest component is highest early on), the net saving
            after penalty exceeds &#8377;5,000, and you have no higher-interest
            debts like personal loans or credit cards to clear first. A car
            depreciates rapidly, so paying off the loan faster reduces the
            financial risk of owing more than the car is worth.
          </p>
          <p>
            <strong>Don&apos;t prepay when:</strong> You are close to the end of
            your tenure (most interest has already been paid), the penalty wipes
            out your interest savings, or you have surplus funds that could earn
            a higher return elsewhere. If your car loan rate is 9% and you can
            invest in a mutual fund SIP at 12-15%, the SIP may deliver better
            returns.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            Car Loan vs Home Loan: Prepayment Rules Compared
          </h2>
          <p>
            RBI&apos;s 2014 circular protects only floating-rate home loan and
            LAP borrowers with zero prepayment penalty. Car loans, being
            mostly fixed-rate, have no such protection. This means your bank
            can legally charge whatever penalty is stated in your loan
            agreement. Additionally, car loans offer zero tax benefit &mdash;
            unlike home loans where interest is deductible under Section 24(b)
            and principal under Section 80C.
          </p>
          <p>
            Because car loans have no tax benefit and the asset depreciates,
            they should be a higher priority for prepayment than home loans in
            a multi-loan portfolio. Clear car loans before making extra home
            loan payments, unless the home loan has a significantly higher
            interest rate.
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
