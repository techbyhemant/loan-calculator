import Link from "next/link";
import { calculateEMI } from "@/lib/calculations/loanCalcs";
import { formatINR } from "@/lib/utils/formatters";
import { buildMetadata } from "@/lib/seo/metadata";
import { getFAQSchema, getBreadcrumbSchema } from "@/lib/seo/schema";
import { RelatedCalculators } from "@/components/ui/RelatedCalculators";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata = buildMetadata({
  title: "Car Loan EMI Calculator — New Car & Used Car, India 2026",
  description:
    "Free car loan EMI calculator. Compare new and used car loan rates (8–14%), down-payment scenarios, and total cost of ownership. RBI rules for floating-rate prepayment included.",
  path: "/calculators/car-loan-emi",
  keywords: [
    "car loan emi calculator",
    "car loan calculator india",
    "auto loan emi calculator",
    "used car loan emi calculator",
    "new car loan emi calculator",
  ],
});

const SAMPLE_AMOUNT = 1_000_000; // 10 lakh
const RATES = [8.5, 10, 12]; // new, mid, used
const TENURES_YEARS = [3, 5, 7];

const faqs = [
  {
    question: "What is the typical car loan interest rate in India in 2026?",
    answer:
      "New car loans from major banks (SBI, HDFC, ICICI) range from 8.5% to 10% for prime borrowers. Used car loan rates are higher — typically 11% to 14% — because the collateral depreciates faster. Top-end cars (luxury segment) sometimes get sub-8.5% rates due to higher loan amounts and customer profile.",
  },
  {
    question: "How much down payment should I make on a car loan?",
    answer:
      "Most banks finance 80–90% of the on-road price for new cars, requiring a 10–20% down payment. For used cars, the financing typically caps at 70–80% of the valuation. A higher down payment reduces your EMI burden, total interest paid, and risk of going underwater (loan amount exceeding car's depreciated value). For a ₹10 lakh car, a 25% down payment instead of 10% saves you roughly ₹40,000–₹70,000 over the loan tenure depending on rate.",
  },
  {
    question: "Can I prepay my car loan without penalty?",
    answer:
      "RBI's prepayment-penalty waiver applies only to floating-rate home loans. For car loans, most banks charge a 2–5% prepayment penalty on the outstanding amount, especially in the first 1–2 years. Always read your sanction letter — some private banks waive prepayment for accounts older than 12 months, and some offer zero-penalty floating-rate auto loans.",
  },
  {
    question: "What's the ideal car loan tenure?",
    answer:
      "Most financial advisors recommend 3–5 years for new cars and 3 years max for used cars. Extending tenure to 7 years lowers EMI but inflates total interest dramatically — for a ₹10 lakh car at 10%, going from 5 years to 7 years adds ~₹70,000 in interest. Cars depreciate faster than the loan amortizes on long tenures, leaving you owning more on the loan than the car is worth.",
  },
  {
    question: "Is it better to buy a new or used car?",
    answer:
      "Used cars (1–3 year old, with verified service records) typically offer 30–40% savings over new in absolute price terms. The downside: higher loan rates (~3% more) and shorter sanctioned tenure. For most middle-income Indian buyers, a 2-year-old used car with 70% loan and 30% down payment is the math-optimal choice. Use this EMI calculator to model both scenarios side-by-side.",
  },
];

export default function CarLoanEmiPage() {
  const matrix = RATES.map((rate) => ({
    rate,
    emis: TENURES_YEARS.map((y) => ({ years: y, emi: calculateEMI(SAMPLE_AMOUNT, rate, y * 12) })),
  }));

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "https://lastemi.com" },
    { name: "Calculators", url: "https://lastemi.com/calculators" },
    { name: "Car Loan EMI", url: "https://lastemi.com/calculators/car-loan-emi" },
  ]);
  const faqSchema = getFAQSchema(faqs);
  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Car Loan EMI Calculator — LastEMI",
    url: "https://lastemi.com/calculators/car-loan-emi",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description: "Free car loan EMI calculator for new and used cars in India.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  };

  return (
    <div className="bg-background min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webApp) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="max-w-4xl mx-auto py-6 px-3 sm:px-6">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Calculators", href: "/calculators" },
            { name: "Car Loan EMI", href: "/calculators/car-loan-emi" },
          ]}
        />

        <h1 className="text-2xl sm:text-4xl font-bold text-foreground mt-3 mb-3">
          Car Loan EMI Calculator — New & Used
        </h1>
        <p className="text-muted-foreground mb-6 text-sm sm:text-base">
          See your car loan EMI, total interest, and 5-year cost of ownership.
          Works for both new and used cars at the rates Indian banks actually offer.
          Run the math before you walk into the showroom.
        </p>

        <Link
          href="/?type=car"
          className="block bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-5 py-4 mb-10 text-center font-semibold shadow-sm transition-colors"
        >
          Open the Full Interactive Calculator &rarr;
          <span className="block text-xs font-normal opacity-90 mt-1">
            Adjust loan amount, rate, tenure, simulate prepayments
          </span>
        </Link>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Sample EMI — ₹{(SAMPLE_AMOUNT / 100000).toFixed(0)} Lakh Car Loan
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            8.5% is the typical new-car rate, 10% mid-tier, 12% used-car territory.
          </p>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">Rate / Tenure</th>
                  {TENURES_YEARS.map((y) => (
                    <th key={y} className="text-right px-3 py-2 font-semibold">
                      {y} years
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row) => (
                  <tr key={row.rate} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{row.rate}%</td>
                    {row.emis.map((c) => (
                      <td key={c.years} className="text-right px-3 py-2">
                        {formatINR(c.emi)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 space-y-5 text-foreground text-sm sm:text-base leading-relaxed">
          <h2 className="text-xl font-semibold text-foreground">
            New Car vs Used Car: The Math
          </h2>
          <p>
            A 2-year-old car typically costs 30–40% less than its new counterpart and
            comes with most of the depreciation already absorbed by the previous
            owner. The trade-off: used car loan rates are 2–3% higher, and banks
            sanction shorter tenures. For a buyer with ₹3 lakh down payment looking
            at a ₹10 lakh new car vs a ₹6.5 lakh used car of the same model, the used
            car often saves ₹2.5–3 lakh in absolute terms even after the rate
            premium. Use this calculator with both scenarios to see the exact
            difference.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            Don&apos;t Stretch the Tenure
          </h2>
          <p>
            Auto dealers often push 7-year tenures because they make the EMI look
            affordable. The math is brutal: on a ₹10 lakh loan at 10%, going from
            5-year to 7-year tenure drops your EMI by ₹2,500/month but adds nearly
            ₹70,000 to your total interest. Worse, a 7-year tenure means the car is
            depreciating faster than the loan amortizes — by year 4, you owe more on
            the loan than the car is worth. Stick to 5 years max for new cars, 3
            years max for used.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            Down Payment Sweet Spot: 25%+
          </h2>
          <p>
            Banks finance up to 90% of the on-road price for new cars, but a 25%+
            down payment hits the sweet spot of low EMI burden, low total interest,
            and no risk of being underwater on the loan. It also gives you better
            negotiating leverage with the bank and dealer.
          </p>

          <h2 className="text-xl font-semibold text-foreground">Frequently Asked Questions</h2>
          <dl className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <dt className="font-semibold text-foreground">{faq.question}</dt>
                <dd className="mt-1 text-muted-foreground">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <RelatedCalculators />
      </main>
    </div>
  );
}
