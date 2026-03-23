const SITE_URL = "https://lastemi.com";
const ORG_NAME = "LastEMI";

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: ORG_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/images/logo.png`,
      width: 512,
      height: 512,
    },
    description:
      "India's honest debt freedom platform. Helps Indian home loan borrowers calculate part payment savings, compare SIP vs prepayment, and find their exact debt-free date.",
    foundingDate: "2025",
    foundingLocation: { "@type": "Place", addressCountry: "IN" },
    areaServed: { "@type": "Country", name: "India" },
    sameAs: [
      "https://twitter.com/lastemi",
      "https://linkedin.com/company/lastemi",
    ],
    knowsAbout: [
      "Home Loan Prepayment",
      "EMI Calculation",
      "Indian Income Tax Deductions",
      "RBI Floating Rate Loans",
      "Debt Payoff Strategies",
    ],
  };
}

export function getWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: ORG_NAME,
    description: "India's honest debt freedom platform",
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "en-IN",
  };
}

export function getFinancialServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "@id": `${SITE_URL}/#financial-service`,
    name: ORG_NAME,
    url: SITE_URL,
    description:
      "Free home loan calculator and debt management platform for Indian borrowers",
    serviceType: "Financial Planning Software",
    areaServed: { "@type": "Country", name: "India" },
    audience: {
      "@type": "Audience",
      audienceType: "Home Loan Borrowers in India",
    },
  };
}

export function getCalculatorSchema(params: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: params.name,
    url: params.url,
    description: params.description,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    provider: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-IN",
  };
}

export function getArticleSchema(params: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  image: string;
  wordCount?: number;
  keywords?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${SITE_URL}/blog/${params.slug}#article`,
    headline: params.title,
    description: params.description,
    url: `${SITE_URL}/blog/${params.slug}`,
    datePublished: params.publishedAt,
    dateModified: params.updatedAt ?? params.publishedAt,
    image: { "@type": "ImageObject", url: params.image, width: 1200, height: 630 },
    author: { "@type": "Organization", name: "LastEMI Editorial Team", url: SITE_URL },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${params.slug}` },
    wordCount: params.wordCount,
    keywords: params.keywords,
    inLanguage: "en-IN",
  };
}

export function getFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function getHowToSchema(params: {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string }>;
  totalTime?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: params.name,
    description: params.description,
    totalTime: params.totalTime,
    step: params.steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.name,
      text: step.text,
    })),
  };
}
