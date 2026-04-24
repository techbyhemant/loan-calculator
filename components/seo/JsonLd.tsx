import { getFAQSchema, getCalculatorSchema, getBreadcrumbSchema } from "@/lib/seo/schema";

interface JsonLdProps {
  data: object | object[];
  id?: string;
}

export function JsonLd({ data, id }: JsonLdProps) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <>
      {payload.map((item, i) => (
        <script
          key={`${id ?? "ld"}-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}

export function FAQSchema({ questions }: { questions: Array<{ question: string; answer: string }> }) {
  return <JsonLd data={getFAQSchema(questions)} id="faq" />;
}

export function WebApplicationSchema(params: {
  name: string;
  description: string;
  url: string;
  aggregateRating?: { ratingValue: number; ratingCount: number };
}) {
  const base = getCalculatorSchema({
    name: params.name,
    description: params.description,
    url: params.url,
  });
  const data = params.aggregateRating
    ? {
        ...base,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: params.aggregateRating.ratingValue,
          ratingCount: params.aggregateRating.ratingCount,
          bestRating: 5,
          worstRating: 1,
        },
      }
    : base;
  return <JsonLd data={data} id="webapp" />;
}

export function BreadcrumbSchema({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  return <JsonLd data={getBreadcrumbSchema(items)} id="breadcrumb" />;
}
