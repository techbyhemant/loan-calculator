import Link from "next/link";

import { buildMetadata } from "@/lib/seo/metadata";
import { getCalculatorSchema, getBreadcrumbSchema, getFAQSchema } from "@/lib/seo/schema";

import SalaryToEmiCalc from "@/components/calculators/SalaryToEmiCalc";

export const metadata = buildMetadata({
  title: "How Much Home Loan Can I Get on My Salary? — Calculator",
  description:
    "Enter your monthly salary and see exactly how much home loan you can get. Compare loan amounts across SBI, HDFC, ICICI rates. Uses the FOIR method banks actually use.",
  path: "/calculators/salary-to-emi",
  keywords: [
    "how much home loan on my salary",
    "home loan on 1 lakh salary",
    "salary to loan calculator India",
    "FOIR calculator",
    "home loan eligibility salary",
  ],
});

const faqs = [
  {
    question: "How much home loan can I get on 1 lakh salary?",
    answer:
      "On a \u20B91 lakh monthly salary with no other EMIs, you can typically get \u20B952-65 lakh home loan at 8.5% for 20 years. Banks allow EMI up to 50-60% of net income.",
  },
  {
    question: "What percentage of salary should go to EMI?",
    answer:
      "Financial advisors recommend keeping total EMIs below 40% of net monthly income. Going above 50% puts significant strain on your budget and leaves no room for emergencies.",
  },
];

export default function SalaryToEmiPage() {
  const calcSchema = getCalculatorSchema({
    name: "Salary to Home Loan Calculator",
    description:
      "Calculate how much home loan you can get based on your monthly salary. Uses the FOIR method Indian banks use.",
    url: "https://lastemi.com/calculators/salary-to-emi",
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "LastEMI", url: "https://lastemi.com" },
    { name: "Calculators", url: "https://lastemi.com/calculators/salary-to-emi" },
    { name: "Salary to EMI", url: "https://lastemi.com/calculators/salary-to-emi" },
  ]);

  const faqSchema = getFAQSchema(faqs);

  return (
    <div className="bg-background min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calcSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main className="max-w-4xl mx-auto py-6 px-3 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          How Much Home Loan Can I Get on My Salary?
        </h1>
        <p className="text-muted-foreground mb-6 text-sm sm:text-base">
          Enter your monthly salary to see the maximum home loan you qualify for. Uses the FOIR (Fixed Obligation to Income Ratio) method that Indian banks actually use.
        </p>

        <SalaryToEmiCalc />

        <section className="mt-12 space-y-6 text-foreground text-sm sm:text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-foreground">
            How Banks Calculate Loan Amount From Your Salary
          </h2>
          <p>
            Banks in India use the <strong>FOIR (Fixed Obligation to Income Ratio)</strong> to determine your home loan eligibility. The standard rule: your total EMI burden (including the new home loan) should not exceed <strong>50% of your net monthly income</strong>. Some banks like SBI allow up to 55-60% for high-income salaried borrowers.
          </p>
          <p>
            For example, if your salary is ₹1 lakh per month and you have no existing EMIs, banks will approve a maximum EMI of ₹50,000. At 8.5% for 20 years, that translates to a loan of approximately ₹52-54 lakh.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            What Reduces Your Eligibility
          </h2>
          <p>
            Every existing EMI you pay — car loan, personal loan, credit card minimum dues — gets subtracted from your available EMI capacity. A ₹15,000 car loan EMI on a ₹1 lakh salary reduces your home loan eligibility by approximately ₹15-18 lakh. Consider closing small loans before applying.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            Tips to Maximize Your Loan Amount
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Add a co-applicant:</strong> A working spouse&apos;s income gets clubbed, significantly increasing eligibility.</li>
            <li><strong>Clear credit card dues:</strong> Even minimum due payments count as existing obligations.</li>
            <li><strong>Choose a longer tenure:</strong> 25-30 years reduces the EMI, letting you qualify for more.</li>
            <li><strong>Improve your CIBIL score:</strong> Above 750 gets you lower rates, which means higher loan for the same EMI.</li>
          </ul>

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
              Got your loan? Track your EMIs and plan part payments.{" "}
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
