import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/"],
      },
      // Allow AI crawlers explicitly for GEO
      { userAgent: "GPTBot", allow: "/", disallow: ["/api/", "/dashboard/"] },
      { userAgent: "ClaudeBot", allow: "/", disallow: ["/api/", "/dashboard/"] },
      { userAgent: "PerplexityBot", allow: "/", disallow: ["/api/", "/dashboard/"] },
      { userAgent: "Applebot", allow: "/" },
      { userAgent: "Bingbot", allow: "/" },
      { userAgent: "Googlebot", allow: "/", disallow: ["/api/"] },
    ],
    sitemap: "https://lastemi.com/sitemap.xml",
    host: "https://lastemi.com",
  };
}
