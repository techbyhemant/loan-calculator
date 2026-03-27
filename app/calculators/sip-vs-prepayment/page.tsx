import Link from "next/link";
import SipVsPrepaymentCalc from "@/components/calculators/SipVsPrepaymentCalc";
import { getFAQSchema, getHowToSchema } from "@/lib/seo/schema";
import { RelatedCalculators } from "@/components/ui/RelatedCalculators";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "SIP vs Home Loan Prepayment Calculator — Which is Better?",
  description:
    "Should you invest your extra money in SIP mutual funds or prepay your home loan? Compare returns after LTCG tax, interest saved, and find the optimal split.",
  path: "/calculators/sip-vs-prepayment",
  keywords: [
    "sip vs home loan prepayment",
    "sip vs prepayment calculator",
    "invest or prepay home loan",
    "mutual fund vs loan prepayment",
    "extra money invest or prepay",
  ],
});

const faqs = [
  {
    question: "Should I invest in SIP or prepay my home loan?",
    answer:
      "If your loan rate is below 9% and you're in the 30% tax bracket, SIP in equity mutual funds (12-15% historical returns) usually wins over the long term. But if your loan rate is above 10% or you have no tax benefit, prepaying is almost always better.",
  },
  {
    question: "What is the effective home loan rate after tax benefit?",
    answer:
      "For a home loan at 8.5% with Section 24(b) deduction in the 30% tax bracket, the effective rate drops to about 6.3%. This makes SIP more attractive since equity returns typically exceed 6.3%.",
  },
  {
    question: "Can I do both SIP and prepayment?",
    answer:
      "Yes, splitting your surplus 50-50 between SIP and prepayment is often the optimal strategy. This gives you wealth creation plus debt reduction.",
  },
];

export default function SipVsPrepaymentPage() {
  const faqSchema = getFAQSchema(faqs);

  const howToSchema = getHowToSchema({
    name: "How to Compare SIP vs Home Loan Prepayment",
    description: "Calculate whether investing in SIP mutual funds or prepaying your home loan saves more money.",
    steps: [
      { name: "Select your loan type", text: "Choose home loan, car loan, or personal loan from the type selector." },
      { name: "Enter loan details", text: "Enter your outstanding balance, interest rate, and remaining tenure." },
      { name: "Set your monthly surplus", text: "Enter the extra amount you can invest or use for prepayment each month." },
      { name: "Compare results", text: "See the side-by-side comparison of SIP corpus vs prepayment interest saved." },
    ],
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SIP vs Home Loan Prepayment Calculator",
    url: "https://lastemi.com/calculators/sip-vs-prepayment",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description:
      "Compare SIP mutual fund returns with home loan prepayment savings. Free calculator with LTCG tax and optimal split recommendation.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
  };

  return (
    <div className="bg-background min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <main className="max-w-4xl mx-auto py-6 px-3 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          SIP vs Home Loan Prepayment: Which is Better for You?
        </h1>
        <p className="text-muted-foreground mb-6 text-sm sm:text-base">
          Got extra cash each month? Use this calculator to compare whether investing
          in SIP mutual funds or prepaying your home loan builds more wealth for you.
        </p>

        <SipVsPrepaymentCalc />

        {/* SEO Content */}
        <section className="mt-12 space-y-6 text-foreground text-sm sm:text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-foreground">
            Understanding SIP and Loan Prepayment
          </h2>
          <p>
            A <strong>Systematic Investment Plan (SIP)</strong> is a method of investing a fixed amount
            every month into mutual funds. Over time, your money grows through the power of compounding
            and rupee cost averaging. Equity mutual funds have historically delivered 10–14% annual
            returns in India over long periods, though past performance does not guarantee future results.
          </p>
          <p>
            <strong>Home loan prepayment</strong> means making an extra payment toward your loan principal
            beyond your regular EMI. This directly reduces your outstanding balance, which means you pay
            less interest for the remaining tenure. For floating-rate home loans in India, RBI mandates
            zero prepayment penalty, making it a completely free option.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            The Simple Rule of Thumb
          </h2>
          <p>
            The decision largely depends on comparing your <strong>home loan interest rate</strong> with
            the <strong>expected post-tax return from SIP</strong>. If your loan rate is 8.5% and you
            expect SIP to return 12% annually, the SIP appears better on paper. However, SIP returns
            are market-linked and not guaranteed, while interest saved through prepayment is a certainty.
            A conservative approach would be: if your loan rate is above 9%, prepayment is almost always
            better. If your loan rate is below 7.5% and you have a long investment horizon (10+ years),
            SIP could generate more wealth.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            Why Your Tax Bracket Matters
          </h2>
          <p>
            Under the old tax regime, Section 24(b) allows a deduction of up to ₹2 lakh per year
            on home loan interest. If you are in the 30% tax bracket, this deduction saves you up to
            ₹60,000 in taxes annually. When you prepay your loan and reduce the interest component,
            you lose a portion of this tax benefit. This is why the effective cost of your loan is lower
            than the stated rate for higher tax brackets. For someone in the 30% bracket with an 8.5%
            loan, the effective rate drops to around 5.95% after accounting for the Section 24 deduction.
            Our calculator factors this in to give you an accurate comparison.
          </p>
          <p>
            Under the new tax regime, there is no Section 24 deduction for self-occupied property.
            So if you have opted for the new regime, prepayment becomes relatively more attractive
            since there is no tax benefit to lose.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            Important Considerations
          </h2>
          <p>
            Equity SIP gains above ₹1.25 lakh in a financial year attract Long Term Capital Gains
            (LTCG) tax at 12.5%. This reduces your effective SIP returns. Additionally, SIP returns
            are volatile in the short term — if your loan tenure is less than 5 years, prepayment
            is almost always the safer and better choice.
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
              Want to track your prepayments and see your updated debt-free date?{" "}
              <Link href="/login" className="underline font-semibold">
                Save your results to your free loan dashboard &rarr;
              </Link>
            </p>
          </div>
        </section>

        <RelatedCalculators />
      </main>
    </div>
  );
}
