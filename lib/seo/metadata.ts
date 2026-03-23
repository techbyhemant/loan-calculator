import type { Metadata } from "next";

const SITE = {
  name: "LastEMI",
  url: "https://lastemi.com",
  description:
    "India's honest debt freedom platform. Calculate part payment savings, compare SIP vs prepayment, and find your exact debt-free date. Free for Indian home loan borrowers.",
  logo: "https://lastemi.com/images/logo.png",
  twitterHandle: "@lastemi",
};

export interface PageSEO {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  image?: string;
  publishedAt?: string;
  updatedAt?: string;
  author?: string;
  keywords?: string[];
  noIndex?: boolean;
}

export function buildMetadata(page: PageSEO): Metadata {
  const url = `${SITE.url}${page.path}`;
  const image = page.image ?? `${SITE.url}/images/og-default.png`;
  const fullTitle =
    page.path === "/"
      ? `${SITE.name} — Find Your Debt-Free Date`
      : `${page.title} | ${SITE.name}`;

  return {
    title: fullTitle,
    description: page.description,
    keywords: page.keywords,
    authors: page.author
      ? [{ name: page.author, url: SITE.url }]
      : [{ name: SITE.name, url: SITE.url }],
    creator: SITE.name,
    publisher: SITE.name,
    metadataBase: new URL(SITE.url),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description: page.description,
      url,
      siteName: SITE.name,
      type: page.type ?? "website",
      images: [{ url: image, width: 1200, height: 630, alt: page.title }],
      locale: "en_IN",
      ...(page.publishedAt && { publishedTime: page.publishedAt }),
      ...(page.updatedAt && { modifiedTime: page.updatedAt }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: page.description,
      images: [image],
      creator: SITE.twitterHandle,
      site: SITE.twitterHandle,
    },
    robots: page.noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large" as const,
            "max-snippet": -1,
          },
        },
  };
}

export { SITE };
