import Link from "next/link";
import EligibilityCalc from "@/components/calculators/EligibilityCalc";
import { getFAQSchema, getHowToSchema } from "@/lib/seo/schema";
import { RelatedCalculators } from "@/components/ui/RelatedCalculators";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Home Loan Eligibility Calculator — Check Your Loan Amount",
  description:
    "Check how much home loan you can get based on your salary, existing EMIs and interest rate. Compare eligibility across SBI, HDFC, ICICI, and Kotak with the FOIR method.",
  path: "/calculators/home-loan-eligibility",
  keywords: [
    "home loan eligibility calculator",
    "home loan eligibility calculator salary",
    "how much home loan can I get",
    "loan eligibility calculator india",
    "maximum home loan amount",
  ],
});

const faqs = [
  {
    question: "How much home loan can I get on my salary?",
    answer:
      "On a \u20B91 lakh net monthly salary with no other EMIs, banks will typically sanction around \u20B952 to 65 lakh at 8.5% for 20 years. The headline rule is simple: total EMIs (including the new home loan) should stay under roughly half your net take-home. Existing EMIs, the rate offered to you, and the tenure you choose all push the final number up or down.",
  },
  {
    question: "Will a co-applicant actually increase my eligibility?",
    answer:
      "Yes, but the co-applicant has to be earning. Banks add the spouse, parent or sibling's documented income to yours and recompute the FOIR \u2014 which can almost double the eligible loan. Both names go on the loan, both are equally liable for repayment, and both can claim the Section 24(b) and 80C tax benefits proportionally if the property is jointly owned.",
  },
  {
    question: "What is FOIR?",
    answer:
      "FOIR stands for Fixed Obligation to Income Ratio. It's the share of your monthly income that already goes to EMIs. Banks want this number to stay below 50% (some go up to 60% for high-income borrowers). The lower your FOIR before applying, the more home loan they'll sanction.",
  },
  {
    question: "I'm self-employed. Is the calculation different?",
    answer:
      "Quite a bit. Banks look at the net profit on your last 2 to 3 years of ITRs and your audited financials, not your gross turnover. They typically discount that figure by 20 to 30% to account for variability, and apply a slightly tighter FOIR around 40 to 45%. Business vintage (2+ years operating), GST filings, and your existing net worth carry more weight than they do for a salaried applicant.",
  },
  {
    question: "How does my age affect this?",
    answer:
      "Your age caps the tenure. Most banks insist the loan be fully repaid by 60 to 65 (for salaried) or 70 (for self-employed). A 30-year-old can get a full 30-year tenure, while a 50-year-old is usually capped at 10 to 15 years. Shorter tenure means a higher EMI, which lowers the loan amount eligible at your salary.",
  },
  {
    question: "What CIBIL score do I need?",
    answer:
      "750+ gets you the best advertised rates. 700 to 749 will get approval but at a slightly higher rate. Below 700, you're either rejected or charged 9.5%+. Pull your CIBIL report from cibil.com (it's free) at least 6 months before applying \u2014 if there are errors, the dispute resolution process takes 30 to 45 days, sometimes longer.",
  },
  {
    question: "Can I include my rental income or bonus?",
    answer:
      "Yes. Banks consider 50 to 75% of documented rental income (you'll need a registered rent agreement plus the income on your ITR), and around 50% of your variable pay or annual bonus, averaged over the last 2 to 3 years. Always declare these on the application properly. Inflating income is fraud, but understating it costs you eligibility.",
  },
  {
    question: "What's the difference between eligibility and LTV?",
    answer:
      "Eligibility is what your income supports. LTV is what the property value supports \u2014 and RBI caps it: 90% of the property value for homes under \u20B930 lakh, 80% for \u20B930 to 75 lakh, and 75% above \u20B975 lakh. Your final sanction is whichever number is smaller. A \u20B92 lakh salary won't get you a 100% loan against a \u20B940 lakh flat, because LTV stops at 80%.",
  },
  {
    question: "My friend has the same salary but got a higher loan. Why?",
    answer:
      "Five usual suspects: more existing EMIs eating into your FOIR, a lower CIBIL pushing your offered rate up, a shorter tenure preference, an employer outside the bank's preferred-employer list (government and Tier-1 corporate get higher FOIR caps), or an age difference that limits your maximum tenure. It's almost always one of those.",
  },
  {
    question: "What documents do I need to submit?",
    answer:
      "Salaried: PAN, Aadhaar, last 3 months' salary slips, last 6 months' bank statements showing salary credits, and Form 16 or your last 2 years' ITRs. Self-employed: PAN, Aadhaar, last 2 to 3 years' ITRs with computation sheets, audited P&L and balance sheet, last 12 months' business bank statements, and GST returns if applicable. KYC for any co-applicant is required separately.",
  },
];

export default function HomeLoanEligibilityPage() {
  const faqSchema = getFAQSchema(faqs);

  const howToSchema = getHowToSchema({
    name: "How to Check Your Home Loan Eligibility",
    description: "Find out the maximum home loan amount you qualify for based on your salary and existing obligations.",
    steps: [
      { name: "Enter your monthly income", text: "Enter your net monthly salary (take-home pay after tax deductions)." },
      { name: "Add existing EMIs", text: "Enter the total of all existing EMIs you pay each month — car loan, personal loan, credit card dues, etc." },
      { name: "Set loan parameters", text: "Choose your preferred interest rate and loan tenure. Longer tenure means higher eligibility but more interest." },
      { name: "View your eligibility", text: "See the maximum loan amount you qualify for based on the FOIR (Fixed Obligation to Income Ratio) method used by banks." },
    ],
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Home Loan Eligibility Calculator",
    url: "https://lastemi.com/calculators/home-loan-eligibility",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description:
      "Check your home loan eligibility based on salary and existing obligations. Compare across top Indian banks.",
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
          Home Loan Eligibility Calculator: How Much Loan Can You Get?
        </h1>
        <p className="text-muted-foreground mb-6 text-sm sm:text-base">
          Find out the maximum home loan amount you qualify for based on your monthly
          income, existing obligations, and preferred tenure.
        </p>

        <EligibilityCalc />

        {/* SEO Content */}
        <section className="mt-12 space-y-6 text-foreground text-sm sm:text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-foreground">
            How banks actually calculate your eligibility
          </h2>
          <p>
            Every Indian bank uses a version of the <strong>Fixed Obligation to
            Income Ratio (FOIR)</strong> to decide how much you can borrow.
            FOIR is the share of your monthly take-home that already goes to
            EMIs and other fixed obligations: credit card minimums, car loan,
            personal loan, child's education loan, anything that shows up on
            CIBIL. The bank works out your spare EMI capacity and reverses
            it into a loan amount at their offered rate and tenure.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            What FOIR limit does each major bank use?
          </h2>
          <p>
            The 50% FOIR is the textbook number, but banks adjust it based on
            income band and employer category. The published policies of the
            major retail lenders look roughly like this:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-border rounded-lg">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left px-4 py-2 font-medium text-foreground">Bank</th>
                  <th className="text-left px-4 py-2 font-medium text-foreground">FOIR (salaried)</th>
                  <th className="text-left px-4 py-2 font-medium text-foreground">FOIR (self-employed)</th>
                  <th className="text-left px-4 py-2 font-medium text-foreground">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr><td className="px-4 py-2">SBI</td><td className="px-4 py-2">50–60%</td><td className="px-4 py-2">50%</td><td className="px-4 py-2">Higher band for govt employees and PSUs</td></tr>
                <tr><td className="px-4 py-2">HDFC Bank</td><td className="px-4 py-2">50–55%</td><td className="px-4 py-2">45–50%</td><td className="px-4 py-2">Stricter for variable-pay-heavy roles</td></tr>
                <tr><td className="px-4 py-2">ICICI Bank</td><td className="px-4 py-2">45–55%</td><td className="px-4 py-2">40–50%</td><td className="px-4 py-2">Income-band slabs apply</td></tr>
                <tr><td className="px-4 py-2">Axis Bank</td><td className="px-4 py-2">45–55%</td><td className="px-4 py-2">40–50%</td><td className="px-4 py-2">Approved-employer list gets the upper band</td></tr>
                <tr><td className="px-4 py-2">Kotak Mahindra</td><td className="px-4 py-2">45–55%</td><td className="px-4 py-2">40–50%</td><td className="px-4 py-2">Income proof requirements are stricter</td></tr>
                <tr><td className="px-4 py-2">PNB / BoB / Canara</td><td className="px-4 py-2">50–65%</td><td className="px-4 py-2">50–55%</td><td className="px-4 py-2">PSU banks go higher for govt and PSU borrowers</td></tr>
              </tbody>
            </table>
          </div>
          <p>
            Two things to read between the lines. First, your employer matters
            as much as your salary. A ₹1 lakh salary at Infosys gets a different
            FOIR cap from a ₹1 lakh salary at an unrated SME, even from the
            same bank. Second, income bands matter: most banks quietly use a
            sliding scale, applying a higher FOIR for monthly incomes above
            ₹1.5 lakh and a stricter one below ₹40,000.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            Roughly what loan does each salary range support?
          </h2>
          <p>
            Indicative figures, assuming a 50% FOIR, no existing EMIs, an 8.5%
            rate, and a 20-year tenure. A co-applicant doubles each row. Real
            sanctions vary by bank, employer, and tenure, but the table is a
            useful reality check before you start house-hunting.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-border rounded-lg">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left px-4 py-2 font-medium text-foreground">Net monthly salary</th>
                  <th className="text-left px-4 py-2 font-medium text-foreground">Max EMI capacity</th>
                  <th className="text-left px-4 py-2 font-medium text-foreground">Approx loan eligibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr><td className="px-4 py-2">₹30,000</td><td className="px-4 py-2">₹15,000</td><td className="px-4 py-2">~₹17 lakh</td></tr>
                <tr><td className="px-4 py-2">₹50,000</td><td className="px-4 py-2">₹25,000</td><td className="px-4 py-2">~₹29 lakh</td></tr>
                <tr><td className="px-4 py-2">₹75,000</td><td className="px-4 py-2">₹37,500</td><td className="px-4 py-2">~₹43 lakh</td></tr>
                <tr><td className="px-4 py-2">₹1,00,000</td><td className="px-4 py-2">₹50,000</td><td className="px-4 py-2">~₹58 lakh</td></tr>
                <tr><td className="px-4 py-2">₹1,50,000</td><td className="px-4 py-2">₹75,000</td><td className="px-4 py-2">~₹86 lakh</td></tr>
                <tr><td className="px-4 py-2">₹2,00,000</td><td className="px-4 py-2">₹1,00,000</td><td className="px-4 py-2">~₹1.15 crore</td></tr>
                <tr><td className="px-4 py-2">₹3,00,000</td><td className="px-4 py-2">₹1,50,000</td><td className="px-4 py-2">~₹1.73 crore</td></tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-semibold text-foreground">
            Why existing EMIs matter so much
          </h2>
          <p>
            Every rupee of an existing EMI eats directly into your home loan
            eligibility. With a ₹1 lakh salary and ₹15,000 of existing EMIs,
            your spare EMI capacity drops from ₹50,000 to ₹35,000, which lops
            roughly ₹17 lakh off the loan you can get. The cleanest move
            before applying for a home loan is closing small high-interest
            debts: credit card balances, a personal loan with 12 months
            remaining, an old consumer-durable EMI. Each ₹10,000 of EMI you
            kill adds about ₹11&ndash;12 lakh to your home loan eligibility.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            How self-employed eligibility differs
          </h2>
          <p>
            For business owners and professionals, the FOIR check is the
            same in spirit, but the income figure goes through more filters.
            Banks take the average net profit (not turnover) from your last
            2 to 3 ITRs. They then haircut that by 20 to 30% to account for
            year-to-year volatility, and apply a slightly tighter FOIR around
            40 to 45%. Business vintage matters: most banks insist on at
            least 2 years of continuous operation. GST returns, audited
            financials, and consistent monthly credits in your business
            current account are all weighed alongside the ITR.
          </p>
          <p>
            One quirk worth knowing: banks like HDFC and ICICI run a separate
            "Loan Against Property" track for self-employed borrowers, which
            sometimes sanctions more than a regular home loan would. Worth
            asking about if you own commercial space or a second residential
            property.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            What pushes your eligibility higher
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Add an earning co-applicant.</strong> A working spouse
              or parent's income clubs with yours and the bank reworks the
              FOIR on the combined figure. Easiest single lever.
            </li>
            <li>
              <strong>Close small debts before applying.</strong> Every
              ₹10,000 in existing EMI you eliminate frees up roughly
              ₹11&ndash;12 lakh of home loan eligibility. Credit card
              balances are the highest-yield ones to clear.
            </li>
            <li>
              <strong>Pick a longer tenure.</strong> A 30-year tenure has a
              smaller monthly EMI than a 20-year, which inflates the loan
              you qualify for at the same FOIR. You can always prepay later
              and shorten the effective tenure (no penalty on floating-rate
              loans).
            </li>
            <li>
              <strong>Fix your CIBIL.</strong> 750+ unlocks lower offered
              rates, which lowers the EMI on a given loan amount, which
              raises eligibility. Pull your free report at cibil.com first
              and clean up errors.
            </li>
            <li>
              <strong>Disclose all income sources properly.</strong> Banks
              count 50&ndash;75% of documented rental income, 50% of
              averaged annual bonus, and reimbursements where they show on
              Form 16. Hiding these costs you eligibility.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground">
            What to do if you've been rejected
          </h2>
          <p>
            Rejections at the eligibility stage usually come down to one of
            three things: a CIBIL flag (defaults, write-offs, settled accounts),
            FOIR already crossing the bank's cap, or income-document mismatch
            (different ITR vs Form 16 numbers, missing GST returns for
            self-employed). The right play is to ask the bank for the specific
            reason in writing under their grievance policy. Most banks will
            tell you. Once you know, the fix is usually 6 to 12 months of
            cleaning up: pay off the smaller debts, get CIBIL errors disputed,
            file consistent ITRs. Try a different bank in the meantime —
            FOIR caps and approved-employer lists differ, so the same
            application can pass at PNB and fail at HDFC.
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
              Planning to take a home loan?{" "}
              <Link href="/login" className="underline font-semibold">
                Save your calculation &rarr;
              </Link>{" "}
              Track your loans and get a personalized debt-free plan.
            </p>
          </div>
        </section>

        <RelatedCalculators />
      </main>
    </div>
  );
}
