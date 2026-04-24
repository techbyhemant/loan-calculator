import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          // Old site URL patterns — save crawl budget
          "/video/",
          "/game/",
          "/games/",
          // Ghost video query params from prior domain owner
          "/*?video=*",
          "/*&video=*",
          "/*?juth=*",
          "/*&juth=*",
        ],
      },
      // Allow AI crawlers explicitly for GEO
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/video/", "/game/", "/games/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/video/", "/game/", "/games/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/video/", "/game/", "/games/"],
      },
      { userAgent: "Applebot", allow: "/" },
      { userAgent: "Bingbot", allow: "/" },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/video/",
          "/game/",
          "/games/",
          "/*?video=*",
          "/*&video=*",
        ],
      },
    ],
    sitemap: "https://lastemi.com/sitemap.xml",
    host: "https://lastemi.com",
  };
}
