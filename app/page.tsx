import LoanCalculator from "@/features/loan-calculator/LoanCalculator";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "EMI Calculator & Loan Simulator — Plan Your Debt-Free Date",
  description:
    "Free EMI calculator for home loans, personal loans, car loans & credit cards. Simulate part payments, find your debt-free date — no phone number, no spam calls.",
  path: "/",
  keywords: [
    "EMI calculator India",
    "home loan part payment calculator",
    "debt free date calculator",
    "personal loan EMI calculator",
    "loan simulator India",
    "SIP vs prepayment",
  ],
});

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "EMI Part Payment Calculator",
  url: "https://lastemi.com/",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  description:
    "Calculate exactly how much you save by making part payments on your home, car or personal loan. Free EMI calculator with amortization schedule, debt-free date and payoff planner.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LoanCalculator />
    </>
  );
}
