import { MetadataRoute } from "next";
import { execSync } from "node:child_process";
import { statSync } from "node:fs";
import path from "node:path";

import { getAllPosts } from "@/lib/blog/utils";

/**
 * Resolve a real `lastmod` for each URL by reading the most recent git
 * commit that touched its source file. Falls back to filesystem mtime,
 * then to the build time.
 *
 * Why bother: Google explicitly discounts sitemap `lastmod` when every
 * URL shares the same recent timestamp — it looks like the field is
 * being gamed. Real per-URL dates make the recrawl signal meaningful
 * (Google re-fetches pages whose `lastmod` actually moved).
 *
 * Cached per build so we don't fork a `git` process more than once
 * per file.
 */
const lastModCache = new Map<string, string>();

function getLastModified(relativePath: string): string {
  if (lastModCache.has(relativePath)) {
    return lastModCache.get(relativePath)!;
  }

  // 1. Try git — most reliable across CI checkouts.
  try {
    const out = execSync(
      `git log -1 --format=%cI -- "${relativePath}"`,
      { cwd: process.cwd(), encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
    if (out) {
      lastModCache.set(relativePath, out);
      return out;
    }
  } catch {
    // git unavailable or file outside the repo; fall through
  }

  // 2. Fall back to fs mtime.
  try {
    const abs = path.join(process.cwd(), relativePath);
    const stat = statSync(abs);
    const iso = stat.mtime.toISOString();
    lastModCache.set(relativePath, iso);
    return iso;
  } catch {
    // file doesn't exist; fall through
  }

  // 3. Last resort.
  const fallback = new Date().toISOString();
  lastModCache.set(relativePath, fallback);
  return fallback;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://lastemi.com";

  // URL → source file map. The source file is whatever Google would
  // care about as "the page changed" — usually the route file, but for
  // pages whose body is computed from a calculator we also factor in
  // the underlying calc source.
  type Entry = {
    url: string;
    files: string[];
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  };

  const HOMEPAGE_FILES = [
    "app/page.tsx",
    "features/loan-calculator/LoanCalculator.tsx",
    "lib/calculations/loanCalcs.ts",
  ];

  const PROGRAMMATIC_HOME_FILES = [
    "app/home-loan-emi-calculator/[amount]/page.tsx",
    "lib/calculations/loanCalcs.ts",
  ];

  const entries: Entry[] = [
    {
      url: baseUrl,
      files: HOMEPAGE_FILES,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    // Topic calculators
    ...[
      { slug: "sip-vs-prepayment", priority: 0.9 },
      { slug: "home-loan-eligibility", priority: 0.9 },
      { slug: "tax-benefit", priority: 0.8 },
      { slug: "salary-to-emi", priority: 0.9 },
      { slug: "rent-vs-buy", priority: 0.8 },
      { slug: "balance-transfer", priority: 0.8 },
      { slug: "credit-card-payoff", priority: 0.9 },
      { slug: "minimum-due-trap", priority: 0.9 },
      { slug: "cc-vs-personal-loan", priority: 0.8 },
      { slug: "multi-card-payoff", priority: 0.8 },
      { slug: "multi-loan-planner", priority: 0.9 },
      { slug: "consumer-emi-true-cost", priority: 0.9 },
      { slug: "personal-loan-payoff", priority: 0.85 },
      { slug: "education-loan-80e", priority: 0.8 },
      { slug: "car-loan-prepayment", priority: 0.85 },
      { slug: "gold-loan-emi", priority: 0.9 },
      { slug: "car-loan-emi", priority: 0.9 },
      { slug: "personal-loan-emi", priority: 0.9 },
    ].map(
      ({ slug, priority }): Entry => ({
        url: `${baseUrl}/calculators/${slug}`,
        files: [`app/calculators/${slug}/page.tsx`],
        changeFrequency: "monthly",
        priority,
      }),
    ),
    // Programmatic landing pages — share the [amount] template, so all
    // 8 share a `lastmod` that moves whenever the template changes.
    {
      url: `${baseUrl}/home-loan-emi-calculator`,
      files: ["app/home-loan-emi-calculator/page.tsx"],
      changeFrequency: "monthly",
      priority: 0.95,
    },
    ...["15-lakh", "20-lakh", "25-lakh", "50-lakh", "60-lakh", "75-lakh", "90-lakh", "1-crore"].map(
      (amount): Entry => ({
        url: `${baseUrl}/home-loan-emi-calculator/${amount}`,
        files: PROGRAMMATIC_HOME_FILES,
        changeFrequency: "monthly",
        priority: 0.85,
      }),
    ),
    {
      url: `${baseUrl}/rbi-rates`,
      files: ["app/rbi-rates/page.tsx"],
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      files: ["app/pricing/page.tsx"],
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      files: ["app/blog/page.tsx"],
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      files: ["app/about/page.tsx"],
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/editorial-standards`,
      files: ["app/editorial-standards/page.tsx"],
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      files: ["app/contact/page.tsx"],
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      files: ["app/privacy/page.tsx"],
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      files: ["app/terms/page.tsx"],
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  // Pick the latest mtime across all files relevant to a given URL.
  const staticPages: MetadataRoute.Sitemap = entries.map((e) => {
    const dates = e.files.map(getLastModified).filter(Boolean);
    const latest = dates.sort().pop() ?? new Date().toISOString();
    return {
      url: e.url,
      lastModified: latest,
      changeFrequency: e.changeFrequency,
      priority: e.priority,
    };
  });

  // Blog pages — prefer `lastReviewed` if present (set when a human
  // re-reviewed the post for accuracy), otherwise use `publishedAt`.
  // Also factor in the MDX file mtime in case the post body was
  // edited without bumping `lastReviewed` (e.g. our internal-link
  // sweep) — pick whichever is later.
  const posts = getAllPosts();
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => {
    const fileMod = getLastModified(`content/blog/${post.slug}.mdx`);
    const human = post.lastReviewed ?? post.publishedAt;
    const latest = [fileMod, human].sort().pop() ?? human;
    return {
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: latest,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    };
  });

  return [...staticPages, ...blogPages];
}
