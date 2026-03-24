import Link from "next/link";

import { buildMetadata } from "@/lib/seo/metadata";
import { getCalculatorSchema, getBreadcrumbSchema, getFAQSchema } from "@/lib/seo/schema";

import RentVsBuyCalc from "@/components/calculators/RentVsBuyCalc";

export const metadata = buildMetadata({
  title: "Rent vs Buy Calculator — Should You Buy a House in India?",
  description:
    "Compare the true cost of renting vs buying a home in India. Factors in EMI, property appreciation, rent increases, stamp duty, and investment returns. Get an honest verdict.",
  path: "/calculators/rent-vs-buy",
  keywords: [
    "rent vs buy calculator India",
    "should I buy a house or rent",
    "rent or buy home India",
    "home buying vs renting comparison",
  ],
});

const faqs = [
  {
    question: "Is it better to rent or buy a house in India?",
    answer:
      "If the price-to-rent ratio in your city is above 25, renting is usually cheaper. In most tier-1 Indian cities, buying makes financial sense only if you plan to stay 7+ years and can make a 20%+ down payment.",
  },
  {
    question: "What is the true cost of buying a house vs renting?",
    answer:
      "The true cost of buying includes EMI interest, property tax, maintenance, opportunity cost of down payment, and registration charges. Renting only costs rent plus the returns you earn on the money you didn\u2019t spend on down payment.",
  },
];

export default function RentVsBuyPage() {
  const calcSchema = getCalculatorSchema({
    name: "Rent vs Buy Calculator",
    description: "Compare the real cost of renting vs buying a home in India including EMI, appreciation, and opportunity cost.",
    url: "https://lastemi.com/calculators/rent-vs-buy",
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "LastEMI", url: "https://lastemi.com" },
    { name: "Calculators", url: "https://lastemi.com/calculators/rent-vs-buy" },
    { name: "Rent vs Buy", url: "https://lastemi.com/calculators/rent-vs-buy" },
  ]);

  const faqSchema = getFAQSchema(faqs);

  return (
    <div className="bg-gray-50 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calcSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main className="max-w-4xl mx-auto py-6 px-3 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Rent vs Buy: Should You Buy a House in India?
        </h1>
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          The honest comparison: total cost of buying (EMI + interest + registration + maintenance) vs renting (rent + investing the difference). No bias — just math.
        </p>

        <RentVsBuyCalc />

        <section className="mt-12 space-y-6 text-gray-700 text-sm sm:text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-gray-900">
            The Real Cost of Buying vs Renting
          </h2>
          <p>
            Most people compare EMI to rent and conclude buying is better. That&apos;s incomplete. The true comparison includes: down payment opportunity cost, stamp duty (5-7% of property value), registration charges, society maintenance, home loan interest, and potential property appreciation.
          </p>
          <p>
            On the renting side, you avoid all upfront costs but face annual rent increases (typically 5-8% in Indian cities). The key question: if you invest the down payment and monthly savings (EMI minus rent) in mutual funds at 10-12% returns, does the investment corpus beat the property value?
          </p>

          <h2 className="text-xl font-semibold text-gray-900">
            When Buying Wins
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Property appreciation exceeds 6% p.a. consistently (metros like Bangalore, Pune, Hyderabad)</li>
            <li>You plan to stay 10+ years in the same city</li>
            <li>The rent-to-price ratio is above 3% annually (your rent is more than 3% of property value per year)</li>
            <li>You value the security of ownership and don&apos;t want landlord uncertainty</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900">
            When Renting Wins
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>You might relocate within 5 years</li>
            <li>Property prices in your area are stagnant or overvalued</li>
            <li>You can invest the difference disciplined (SIPs, not spending)</li>
            <li>Your rent is less than 2% of the property value annually</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>
          <dl className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <dt className="font-semibold text-gray-900">{faq.question}</dt>
                <dd className="mt-1 text-gray-600">{faq.answer}</dd>
              </div>
            ))}
          </dl>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <p className="text-blue-800 font-medium">
              Decided to buy? Calculate your{" "}
              <Link href="/calculators/home-loan-eligibility" className="underline font-semibold">
                loan eligibility
              </Link>
              {" "}and start tracking your{" "}
              <Link href="/login" className="underline font-semibold">
                debt-free date →
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
