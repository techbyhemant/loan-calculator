/**
 * One-shot batch internal-linker for the existing blog corpus.
 *
 * Why this exists separately from `autonomous/internal-linker.ts`:
 * the autonomous one only fires when a *new* post is generated, and
 * its LINK_TARGETS map only knew about 6 calculators. We have 18+.
 * The 22 existing posts were largely generated before the linker
 * existed (or before LINK_TARGETS was filled out), so most of them
 * have <5 internal links and several are funnel-only (login CTAs).
 *
 * This script is a careful, idempotent sweep:
 *   - Skips frontmatter (between the first two `---`)
 *   - Skips fenced code blocks (```...```)
 *   - Skips heading lines (^# ... )
 *   - Skips lines that already contain a markdown link (avoids
 *     breaking nested brackets and keeps existing links intact)
 *   - Replaces the FIRST occurrence of each keyword per post (not
 *     all occurrences — that's how you get spammy, over-optimised
 *     anchor stuffing that Google penalises)
 *   - Caps total new links added per post at MAX_LINKS_PER_POST
 *
 * Run:
 *   npx tsx scripts/blog/sweep-internal-links.ts            # dry-run
 *   npx tsx scripts/blog/sweep-internal-links.ts --apply    # writes
 */

import fs from "fs";
import path from "path";

const BLOG_DIR = path.join(process.cwd(), "content/blog");
const MAX_NEW_LINKS_PER_POST = 6;
const APPLY = process.argv.includes("--apply");

// Calculator and reference-page targets.
// IMPORTANT: keywords are matched in order; longer/more-specific phrases
// must come BEFORE generic ones so "credit card payoff" wins over
// "credit card", and "minimum due" wins over "minimum".
type LinkTarget = { url: string; keywords: string[] };

const PAGE_TARGETS: LinkTarget[] = [
  // Most specific first
  {
    url: "/calculators/multi-loan-planner",
    keywords: [
      "snowball vs avalanche",
      "avalanche vs snowball",
      "multi-loan planner",
      "multi-loan payoff",
      "multiple loans",
    ],
  },
  {
    url: "/calculators/sip-vs-prepayment",
    keywords: [
      "SIP vs prepayment",
      "invest vs prepay",
      "invest or prepay",
      "SIP",
      "systematic investment",
    ],
  },
  {
    url: "/calculators/balance-transfer",
    keywords: ["balance transfer calculator", "balance transfer"],
  },
  {
    url: "/calculators/home-loan-eligibility",
    keywords: [
      "home loan eligibility",
      "loan eligibility",
      "how much loan",
      "FOIR",
    ],
  },
  {
    url: "/calculators/salary-to-emi",
    keywords: ["salary to EMI", "EMI from salary", "safe EMI"],
  },
  {
    url: "/calculators/tax-benefit",
    keywords: [
      "section 24(b)",
      "section 24b",
      "Section 80C",
      "80C deduction",
      "home loan tax benefit",
      "tax benefit calculator",
    ],
  },
  {
    url: "/calculators/education-loan-80e",
    keywords: ["section 80E", "80E deduction", "education loan tax"],
  },
  {
    url: "/calculators/credit-card-payoff",
    keywords: ["credit card payoff", "payoff a credit card", "card payoff"],
  },
  {
    url: "/calculators/multi-card-payoff",
    keywords: ["multi-card payoff", "multiple credit cards"],
  },
  {
    url: "/calculators/minimum-due-trap",
    keywords: [
      "minimum due trap",
      "minimum amount due",
      "minimum due",
      "paying only minimum",
    ],
  },
  {
    url: "/calculators/cc-vs-personal-loan",
    keywords: [
      "credit card vs personal loan",
      "personal loan vs credit card",
    ],
  },
  {
    url: "/calculators/personal-loan-payoff",
    keywords: ["personal loan payoff", "personal loan prepayment"],
  },
  {
    url: "/calculators/personal-loan-emi",
    keywords: ["personal loan EMI calculator", "personal loan EMI"],
  },
  {
    url: "/calculators/car-loan-prepayment",
    keywords: ["car loan prepayment", "car loan part payment"],
  },
  {
    url: "/calculators/car-loan-emi",
    keywords: ["car loan EMI calculator", "car loan EMI"],
  },
  {
    url: "/calculators/gold-loan-emi",
    keywords: ["gold loan EMI", "gold loan calculator"],
  },
  {
    url: "/calculators/consumer-emi-true-cost",
    keywords: [
      "no-cost EMI",
      "no cost EMI",
      "consumer EMI",
      "zero-cost EMI",
    ],
  },
  {
    url: "/calculators/rent-vs-buy",
    keywords: ["rent vs buy", "rent or buy"],
  },
  {
    url: "/home-loan-emi-calculator",
    keywords: ["home loan EMI calculator", "home loan EMI"],
  },
  {
    url: "/rbi-rates",
    keywords: [
      "current repo rate",
      "RBI repo rate",
      "repo rate",
      "RLLR",
      "RBI rate",
    ],
  },
  // Homepage as the default "EMI calculator" mention
  {
    url: "/",
    keywords: [
      "EMI calculator",
      "part payment calculator",
      "prepayment calculator",
      "amortization schedule",
      "debt-free date",
    ],
  },
  // Dashboard funnel — kept low priority (last) so calculator links win
  {
    url: "/login",
    keywords: ["track your loans", "log your part payments", "save to dashboard"],
  },
];

// Topical-cluster cross-linking. Each post links to 1–2 semantically
// adjacent posts via a "Related" inline note inserted before the
// final section. This is in addition to keyword-based links.
const RELATED_POSTS: Record<string, string[]> = {
  "personal-loan-prepayment-penalty-2026": [
    "personal-loan-consolidation-strategies",
    "rbi-repo-rate-impact-on-emi",
  ],
  "rbi-monetary-policy-2026-april-emi-impact": [
    "rbi-repo-rate-impact-on-emi",
    "home-loan-strategy-fy-2026-27",
  ],
  "rbi-repo-rate-impact-on-emi": [
    "rbi-monetary-policy-2026-april-emi-impact",
    "reduce-emi-or-tenure-after-part-payment",
  ],
  "rbi-e-mandate-recurring-payment-audit": [
    "consumer-emi-hidden-costs",
    "credit-card-gst-interest-hidden-cost",
  ],
  "car-loan-prepayment-benefits": [
    "car-loan-balance-transfer-benefits",
    "reduce-emi-or-tenure-after-part-payment",
  ],
  "car-loan-balance-transfer-benefits": [
    "home-loan-balance-transfer-savings",
    "car-loan-prepayment-benefits",
  ],
  "credit-card-gst-interest-hidden-cost": [
    "credit-card-minimum-due-trap",
    "consumer-emi-hidden-costs",
  ],
  "credit-card-minimum-due-trap": [
    "credit-card-payoff-strategy",
    "credit-card-debt-consolidation-strategies",
  ],
  "credit-card-payoff-strategy": [
    "credit-card-debt-consolidation-strategies",
    "credit-card-minimum-due-trap",
  ],
  "credit-card-debt-consolidation-strategies": [
    "personal-loan-consolidation-strategies",
    "credit-card-payoff-strategy",
  ],
  "personal-loan-consolidation-strategies": [
    "credit-card-debt-consolidation-strategies",
    "personal-loan-prepayment-penalty-2026",
  ],
  "consumer-emi-hidden-costs": [
    "credit-card-gst-interest-hidden-cost",
    "rbi-e-mandate-recurring-payment-audit",
  ],
  "home-loan-balance-transfer-savings": [
    "home-loan-balance-transfer-fee-analysis",
    "home-loan-strategy-fy-2026-27",
  ],
  "home-loan-balance-transfer-fee-analysis": [
    "home-loan-balance-transfer-savings",
    "rbi-repo-rate-impact-on-emi",
  ],
  "home-loan-strategy-fy-2026-27": [
    "home-loan-tax-filing-2026",
    "rbi-monetary-policy-2026-april-emi-impact",
  ],
  "home-loan-tax-filing-2026": [
    "tax-optimization-for-borrowers",
    "tax-saving-investments-for-loan-borrowers",
  ],
  "tax-optimization-for-borrowers": [
    "tax-saving-investments-for-loan-borrowers",
    "home-loan-tax-filing-2026",
  ],
  "tax-saving-investments-for-loan-borrowers": [
    "tax-optimization-for-borrowers",
    "home-loan-tax-filing-2026",
  ],
  "education-loan-tax-benefits": [
    "tax-optimization-for-borrowers",
    "tax-saving-investments-for-loan-borrowers",
  ],
  "multi-loan-payoff-strategy": [
    "multi-loan-snowball-vs-avalanche-india",
    "personal-loan-consolidation-strategies",
  ],
  "multi-loan-snowball-vs-avalanche-india": [
    "multi-loan-payoff-strategy",
    "credit-card-debt-consolidation-strategies",
  ],
  "reduce-emi-or-tenure-after-part-payment": [
    "rbi-repo-rate-impact-on-emi",
    "personal-loan-prepayment-penalty-2026",
  ],
  "rent-vs-buy-decision": [
    "home-loan-strategy-fy-2026-27",
    "home-loan-tax-filing-2026",
  ],
};

// Read titles for the related-post link anchors.
function readPostTitle(slug: string): string | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf-8");
  const m = content.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  return m ? m[1].replace(/^"|"$/g, "") : null;
}

interface LineContext {
  inFrontmatter: boolean;
  inCodeBlock: boolean;
  isHeading: boolean;
  hasExistingLink: boolean;
}

function classifyLine(
  line: string,
  state: { dashesSeen: number; inCode: boolean },
): LineContext {
  let inFrontmatter = false;
  if (line.trim() === "---") {
    state.dashesSeen += 1;
    inFrontmatter = state.dashesSeen <= 1;
    return {
      inFrontmatter: true,
      inCodeBlock: state.inCode,
      isHeading: false,
      hasExistingLink: false,
    };
  }
  inFrontmatter = state.dashesSeen < 2;

  if (line.trim().startsWith("```")) {
    state.inCode = !state.inCode;
    return {
      inFrontmatter,
      inCodeBlock: true,
      isHeading: false,
      hasExistingLink: false,
    };
  }

  return {
    inFrontmatter,
    inCodeBlock: state.inCode,
    isHeading: /^#{1,6}\s/.test(line.trim()),
    hasExistingLink: /\]\([^)]+\)/.test(line),
  };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function processPost(
  slug: string,
): { added: number; skipped: number; tries: number } {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  let added = 0;
  let tries = 0;
  let skipped = 0;
  const usedTargets = new Set<string>();

  // First pass: keyword-based linking (cap at MAX_NEW_LINKS_PER_POST).
  const state = { dashesSeen: 0, inCode: false };
  for (let i = 0; i < lines.length && added < MAX_NEW_LINKS_PER_POST; i++) {
    const ctx = classifyLine(lines[i], state);
    if (
      ctx.inFrontmatter ||
      ctx.inCodeBlock ||
      ctx.isHeading ||
      ctx.hasExistingLink ||
      lines[i].trim() === ""
    ) {
      continue;
    }

    for (const target of PAGE_TARGETS) {
      if (added >= MAX_NEW_LINKS_PER_POST) break;
      if (usedTargets.has(target.url)) continue;
      for (const keyword of target.keywords) {
        tries++;
        const re = new RegExp(`(?<![\\[\\w])(${escapeRegex(keyword)})(?![\\w\\]])`, "i");
        if (re.test(lines[i])) {
          lines[i] = lines[i].replace(re, `[$1](${target.url})`);
          usedTargets.add(target.url);
          added++;
          break;
        }
        skipped++;
      }
    }
  }

  // Second pass: insert "Related" callouts for cross-post links.
  // Look for the last H2 before the end of the file and insert a
  // related-posts block before it. Avoids placing it in awkward spots.
  const related = RELATED_POSTS[slug] ?? [];
  if (related.length > 0) {
    // Skip if the file already has a "Related" line — idempotent.
    const alreadyHasRelated = lines.some((l) =>
      /Related\s*[:|]/i.test(l) && /\]\(\/blog\//.test(l),
    );
    if (!alreadyHasRelated) {
      const relatedLines = related
        .map((rslug) => {
          const title = readPostTitle(rslug);
          if (!title) return null;
          return `[${title}](/blog/${rslug})`;
        })
        .filter((x): x is string => x !== null);

      if (relatedLines.length > 0) {
        const block = [
          "",
          "> **Related reading:** " + relatedLines.join(" · "),
          "",
        ];

        // Find the last H2 (## ) line to insert before.
        let insertAt = -1;
        for (let i = lines.length - 1; i >= 0; i--) {
          if (/^##\s/.test(lines[i])) {
            insertAt = i;
            break;
          }
        }
        if (insertAt >= 0) {
          lines.splice(insertAt, 0, ...block);
          added += relatedLines.length;
        }
      }
    }
  }

  if (APPLY) {
    fs.writeFileSync(filePath, lines.join("\n"));
  }

  return { added, skipped, tries };
}

function main() {
  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));

  console.log(`\n${APPLY ? "APPLYING" : "DRY-RUN"} sweep over ${files.length} posts\n`);
  console.log(
    `Cap: ${MAX_NEW_LINKS_PER_POST} new keyword links + up to 2 related-post links per post\n`,
  );

  let totalAdded = 0;
  for (const slug of files.sort()) {
    const result = processPost(slug);
    totalAdded += result.added;
    const bar = "█".repeat(Math.min(result.added, 8)).padEnd(8);
    console.log(
      `  ${bar} +${String(result.added).padStart(2)}  ${slug}`,
    );
  }

  console.log(
    `\n${APPLY ? "Wrote" : "Would write"} ${totalAdded} new links across ${files.length} posts.\n`,
  );
  if (!APPLY) {
    console.log("Re-run with --apply to write changes.\n");
  }
}

main();
