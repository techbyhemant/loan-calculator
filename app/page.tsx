"use client";

import LoanCalculator from "@/features/loan-calculator/LoanCalculator";


export default function Home() {
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
