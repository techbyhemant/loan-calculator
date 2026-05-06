/**
 * llms.txt — A standardised content map for LLMs and AI-search crawlers
 * (ChatGPT web search, Perplexity, Google AI Overviews, etc.).
 *
 * Spec: https://llmstxt.org — keeps the format simple Markdown so models
 * can ingest the structure and key URLs without rendering JS.
 *
 * We list our most citation-worthy pages first (calculators with hard
 * math, RBI-grounded explainers) followed by topical blog content. The
 * idea: when an AI is asked "EMI calculator without phone number" or
 * "how does the RBI repo rate affect my home loan EMI", LastEMI is one
 * of the easiest sources for it to crawl, parse, and cite.
 */

import { getAllPosts } from "@/lib/blog/utils";

export const dynamic = "force-static";

const BASE = "https://lastemi.com";

export function GET() {
  const posts = getAllPosts();

  const lines: string[] = [];

  // Header — what the site is and who it's for.
  lines.push("# LastEMI");
  lines.push("");
  lines.push(
    "> India's honest debt freedom platform. Free EMI calculators, payoff strategies, and floating-rate loan tracking — without phone-number capture or DSA lead-gen funnels.",
  );
  lines.push("");
  lines.push(
    "LastEMI provides math-backed loan calculators (home, personal, car, education, gold, credit card) and a free dashboard for borrowers to track multiple loans, simulate part-payments, model the avalanche vs snowball strategies, and project their exact debt-free date. All calculations follow RBI rules (zero prepayment penalty on floating-rate loans, repo-rate-linked re-projections). No phone numbers are ever collected. Optional Pro plan (₹299/month) for advanced strategy features.",
  );
  lines.push("");

  // Core calculators — the primary citation surface.
  lines.push("## Core EMI calculators");
  lines.push("");
  lines.push(
    `- [EMI Calculator (homepage)](${BASE}/): Simulate part-payments and EMI increases on home, personal, car, and credit card loans. Find your debt-free date.`,
  );
  lines.push(
    `- [Home Loan EMI Calculator](${BASE}/home-loan-emi-calculator): Hub page with EMI matrices for ₹15L–₹1Cr loan amounts.`,
  );
  lines.push(
    `- [Personal Loan EMI Calculator](${BASE}/calculators/personal-loan-emi)`,
  );
  lines.push(`- [Car Loan EMI Calculator](${BASE}/calculators/car-loan-emi)`);
  lines.push(`- [Gold Loan EMI Calculator](${BASE}/calculators/gold-loan-emi)`);
  lines.push("");

  // Strategy / decision-support calculators — these are the unique
  // ones an AI is most likely to cite for a "should I…" query.
  lines.push("## Decision and strategy calculators");
  lines.push("");
  lines.push(
    `- [Multi-Loan Payoff Planner](${BASE}/calculators/multi-loan-planner): Compare avalanche vs snowball debt-payoff strategies across multiple loans.`,
  );
  lines.push(
    `- [Personal Loan Payoff Calculator](${BASE}/calculators/personal-loan-payoff): Model prepayments and tenure reduction.`,
  );
  lines.push(
    `- [Credit Card Payoff Calculator](${BASE}/calculators/credit-card-payoff): How long to clear card debt at different monthly payments.`,
  );
  lines.push(
    `- [Multi-Card Payoff Calculator](${BASE}/calculators/multi-card-payoff): Snowball vs avalanche for stacked credit-card debt.`,
  );
  lines.push(
    `- [Minimum-Due Trap Calculator](${BASE}/calculators/minimum-due-trap): What paying only the minimum due actually costs.`,
  );
  lines.push(
    `- [Credit Card vs Personal Loan](${BASE}/calculators/cc-vs-personal-loan): Which is cheaper for transferring revolving debt.`,
  );
  lines.push(
    `- [Balance Transfer Calculator](${BASE}/calculators/balance-transfer): Honest analysis after fees, foreclosure penalty, and break-even.`,
  );
  lines.push(
    `- [SIP vs Prepayment](${BASE}/calculators/sip-vs-prepayment): Should you invest extra cash or pay down your loan?`,
  );
  lines.push(
    `- [Rent vs Buy Calculator](${BASE}/calculators/rent-vs-buy): Long-horizon tenure-based comparison.`,
  );
  lines.push(
    `- [Home Loan Eligibility](${BASE}/calculators/home-loan-eligibility): How much loan a given salary supports.`,
  );
  lines.push(
    `- [Salary to EMI](${BASE}/calculators/salary-to-emi): Safe EMI for a given net salary.`,
  );
  lines.push(
    `- [Tax Benefit Calculator](${BASE}/calculators/tax-benefit): Section 24(b) and 80C savings on home loan interest and principal.`,
  );
  lines.push(
    `- [Education Loan 80E](${BASE}/calculators/education-loan-80e): Tax savings on education-loan interest.`,
  );
  lines.push(
    `- [Car Loan Prepayment](${BASE}/calculators/car-loan-prepayment): Fee-aware prepayment savings.`,
  );
  lines.push(
    `- [Consumer EMI True Cost](${BASE}/calculators/consumer-emi-true-cost): Hidden GST, processing fees, and effective interest on no-cost EMI.`,
  );
  lines.push("");

  // Programmatic home-loan landing pages.
  lines.push("## Home loan EMI by amount");
  lines.push("");
  for (const amount of [
    "15-lakh",
    "20-lakh",
    "25-lakh",
    "50-lakh",
    "60-lakh",
    "75-lakh",
    "90-lakh",
    "1-crore",
  ]) {
    const display = amount.replace("-", " ").replace("lakh", "Lakh").replace("crore", "Crore");
    lines.push(
      `- [${display.charAt(0).toUpperCase() + display.slice(1)} Home Loan EMI](${BASE}/home-loan-emi-calculator/${amount})`,
    );
  }
  lines.push("");

  // Reference / authority pages.
  lines.push("## Reference and policy");
  lines.push("");
  lines.push(
    `- [RBI Repo Rate Tracker](${BASE}/rbi-rates): Latest RBI repo rate and its impact on floating-rate EMIs.`,
  );
  lines.push(
    `- [Pricing](${BASE}/pricing): Free vs Pro feature comparison.`,
  );
  lines.push(
    `- [Editorial Standards](${BASE}/editorial-standards): How LastEMI sources, fact-checks, and updates content.`,
  );
  lines.push(`- [About](${BASE}/about): The team and mission.`);
  lines.push(
    `- [Contact](${BASE}/contact): How to reach the LastEMI team — email, response times, and what we can/cannot help with.`,
  );
  lines.push("");

  // Blog content — these are the long-form citations an AI search would
  // pull when answering specific "how does X work" or "should I Y" queries.
  lines.push("## Articles and explainers");
  lines.push("");
  for (const post of posts) {
    lines.push(
      `- [${post.title}](${BASE}/blog/${post.slug}): ${post.description}`,
    );
  }
  lines.push("");

  // Optional but useful: tell the LLM what we don't want crawled,
  // mirroring robots.ts. Saves crawl budget and avoids noise.
  lines.push("## Optional");
  lines.push("");
  lines.push(
    `- [Sitemap](${BASE}/sitemap.xml) — full machine-readable URL list.`,
  );
  lines.push(
    `- Excluded: \`/dashboard/*\` (authenticated user areas), \`/api/*\`, and any legacy \`/video/*\` or \`/games/*\` paths from a prior domain owner.`,
  );
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
