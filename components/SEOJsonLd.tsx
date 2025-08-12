"use client";

import Script from "next/script";

export default function SEOJsonLd() {
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "EMIPartPay",
    url: "https://emipartpay.com/",
    logo: "https://emipartpay.com/file.svg",
  };

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "EMIPartPay – EMI Calculator with Part Payment",
    url: "https://emipartpay.com/",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description:
      "Calculate EMI and see interest savings with part payments. Reduce EMI or tenure with a full amortization schedule.",
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Does part payment reduce EMI or tenure?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can choose either. Tenure reduction keeps EMI same but shortens the loan; EMI reduction keeps tenure same but lowers EMI.",
        },
      },
      {
        "@type": "Question",
        name: "How often can I make part payments?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Most banks allow multiple part payments per year without penalty for floating‑rate home loans. Check your lender’s policy.",
        },
      },
    ],
  };

  return (
    <>
      <Script
        id="ld-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
      />
      <Script
        id="ld-app"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApp) }}
      />
      <Script
        id="ld-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
    </>
  );
}
