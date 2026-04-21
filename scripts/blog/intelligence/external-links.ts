/**
 * External Link Registry — curated authoritative links for blog posts
 *
 * Rules:
 * - Max 5 external links per article
 * - Priority: government > educational > reference > banking > industry
 * - All links use rel="noopener noreferrer"
 * - Match by keyword presence in article content
 * - Longest keyword match wins (prevents partial matches)
 */

export interface ExternalLink {
  keyword: string; // text to match in article content
  url: string; // full URL to link to
  anchor: string; // anchor text to display
  category: "government" | "educational" | "reference" | "industry" | "banking";
  maxUsesPerArticle: number;
}

// Priority order: government first, then educational, reference, banking, industry
export const EXTERNAL_LINKS: ExternalLink[] = [
  // ── Government / Regulator ────────────────────────────────
  {
    keyword: "RBI repo rate",
    url: "https://www.rbi.org.in/Scripts/BS_ViewMonetaryPolicy.aspx",
    anchor: "RBI Monetary Policy",
    category: "government",
    maxUsesPerArticle: 1,
  },
  {
    keyword: "RBI prepayment",
    url: "https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=7730",
    anchor: "RBI circular on prepayment charges",
    category: "government",
    maxUsesPerArticle: 1,
  },
  {
    keyword: "RBI floating rate",
    url: "https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=7730",
    anchor: "RBI floating rate guidelines",
    category: "government",
    maxUsesPerArticle: 1,
  },
  {
    keyword: "Section 80C",
    url: "https://incometaxindia.gov.in/Pages/i-am/individual.aspx",
    anchor: "Income Tax India — Section 80C",
    category: "government",
    maxUsesPerArticle: 1,
  },
  {
    keyword: "Section 24",
    url: "https://incometaxindia.gov.in/Pages/i-am/individual.aspx",
    anchor: "Income Tax India — Section 24",
    category: "government",
    maxUsesPerArticle: 1,
  },
  {
    keyword: "Section 80E",
    url: "https://incometaxindia.gov.in/Pages/i-am/individual.aspx",
    anchor: "Income Tax India — Section 80E",
    category: "government",
    maxUsesPerArticle: 1,
  },
  {
    keyword: "CIBIL score",
    url: "https://www.cibil.com/freecibilscore",
    anchor: "Check your CIBIL score",
    category: "reference",
    maxUsesPerArticle: 1,
  },
  {
    keyword: "GST on credit card",
    url: "https://cbic-gst.gov.in/",
    anchor: "CBIC GST Portal",
    category: "government",
    maxUsesPerArticle: 1,
  },

  // ── Banking (rate pages) ──────────────────────────────────
  {
    keyword: "SBI home loan",
    url: "https://sbi.co.in/web/personal-banking/loans/home-loans",
    anchor: "SBI home loan rates",
    category: "banking",
    maxUsesPerArticle: 1,
  },
  {
    keyword: "HDFC home loan",
    url: "https://www.hdfc.com/home-loan-interest-rate",
    anchor: "HDFC home loan rates",
    category: "banking",
    maxUsesPerArticle: 1,
  },
  {
    keyword: "ICICI home loan",
    url: "https://www.icicibank.com/personal-banking/loans/home-loan",
    anchor: "ICICI home loan rates",
    category: "banking",
    maxUsesPerArticle: 1,
  },
  {
    keyword: "SBI personal loan",
    url: "https://sbi.co.in/web/personal-banking/loans/personal-loans",
    anchor: "SBI personal loan rates",
    category: "banking",
    maxUsesPerArticle: 1,
  },
  {
    keyword: "HDFC personal loan",
    url: "https://www.hdfcbank.com/personal/borrow/popular-loans/personal-loan",
    anchor: "HDFC personal loan rates",
    category: "banking",
    maxUsesPerArticle: 1,
  },

  // ── Educational / Reference ───────────────────────────────
  {
    keyword: "old tax regime",
    url: "https://cleartax.in/s/old-tax-regime-vs-new-tax-regime",
    anchor: "ClearTax — Old vs New Tax Regime",
    category: "educational",
    maxUsesPerArticle: 1,
  },
  {
    keyword: "new tax regime",
    url: "https://cleartax.in/s/old-tax-regime-vs-new-tax-regime",
    anchor: "ClearTax — Old vs New Tax Regime",
    category: "educational",
    maxUsesPerArticle: 1,
  },
  {
    keyword: "credit utilization",
    url: "https://www.cibil.com/resources/articles/credit-utilization-ratio",
    anchor: "CIBIL — Credit Utilization Ratio",
    category: "educational",
    maxUsesPerArticle: 1,
  },
  {
    keyword: "MCLR",
    url: "https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=10295",
    anchor: "RBI MCLR guidelines",
    category: "government",
    maxUsesPerArticle: 1,
  },
  {
    keyword: "EBLR",
    url: "https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=10295",
    anchor: "RBI external benchmark lending rate",
    category: "government",
    maxUsesPerArticle: 1,
  },

  // ── Industry / Finance Media ──────────────────────────────
  {
    keyword: "home loan rates 2026",
    url: "https://www.moneycontrol.com/personal-finance/loans/home-loan-interest-rates",
    anchor: "MoneyControl — Latest Home Loan Rates",
    category: "industry",
    maxUsesPerArticle: 1,
  },
  {
    keyword: "personal loan rates 2026",
    url: "https://www.moneycontrol.com/personal-finance/loans/personal-loan-interest-rates",
    anchor: "MoneyControl — Latest Personal Loan Rates",
    category: "industry",
    maxUsesPerArticle: 1,
  },
  {
    keyword: "mutual fund returns",
    url: "https://www.amfiindia.com/research-information/other-data/mf-performance",
    anchor: "AMFI — Mutual Fund Performance Data",
    category: "reference",
    maxUsesPerArticle: 1,
  },
  {
    keyword: "PPF interest rate",
    url: "https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=89",
    anchor: "NSI — PPF Interest Rate",
    category: "government",
    maxUsesPerArticle: 1,
  },

  // ── Filler keywords for posts that otherwise match nothing ────
  // These catch common phrases in car-loan, credit-card, and personal-loan
  // posts that were slipping through with zero citations. Registry priority
  // is longest-match-wins, so specific keywords above still take precedence.
  {
    keyword: "prepayment penalty",
    url: "https://cleartax.in/s/loan-prepayment-penalty",
    anchor: "ClearTax — Loan prepayment penalty explained",
    category: "educational",
    maxUsesPerArticle: 1,
  },
  {
    keyword: "balance transfer",
    url: "https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12016",
    anchor: "RBI — Home loan transfer guidelines",
    category: "government",
    maxUsesPerArticle: 1,
  },
  {
    keyword: "credit card debt",
    url: "https://www.cibil.com/resources/articles/credit-card-debt-management",
    anchor: "CIBIL — Credit card debt management",
    category: "reference",
    maxUsesPerArticle: 1,
  },
  {
    keyword: "debt consolidation",
    url: "https://cleartax.in/s/debt-consolidation",
    anchor: "ClearTax — Debt consolidation guide",
    category: "educational",
    maxUsesPerArticle: 1,
  },
  {
    keyword: "foreclosure",
    url: "https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=7730",
    anchor: "RBI — Foreclosure charges on floating loans",
    category: "government",
    maxUsesPerArticle: 1,
  },
  {
    keyword: "credit score",
    url: "https://www.cibil.com/freecibilscore",
    anchor: "CIBIL — Free credit score",
    category: "reference",
    maxUsesPerArticle: 1,
  },
];

// Blocked domains — never link to competitors
export const BLOCKED_DOMAINS = [
  "bankbazaar.com",
  "paisabazaar.com",
  "policybazaar.com",
  "emicalculator.net",
  "loanadvisor.in",
];

/**
 * Insert external links into article content.
 * Rules:
 * - Max 5 external links per article
 * - Longest keyword match first (prevents partial matches)
 * - Skip if keyword is already inside an existing markdown link
 * - Category priority: government > educational > reference > banking > industry
 */
export function insertExternalLinks(
  content: string,
  maxLinks: number = 5,
): string {
  // Sort by keyword length descending (longest first to avoid partial matches)
  // Then by category priority
  const categoryPriority: Record<string, number> = {
    government: 1,
    educational: 2,
    reference: 3,
    banking: 4,
    industry: 5,
  };

  const sorted = [...EXTERNAL_LINKS].sort((a, b) => {
    // Longest keyword first
    if (b.keyword.length !== a.keyword.length)
      return b.keyword.length - a.keyword.length;
    // Then by category priority
    return (
      (categoryPriority[a.category] || 9) -
      (categoryPriority[b.category] || 9)
    );
  });

  let result = content;
  let linksInserted = 0;
  const usedUrls = new Set<string>();

  for (const link of sorted) {
    if (linksInserted >= maxLinks) break;
    if (usedUrls.has(link.url)) continue;

    // Case-insensitive search for keyword
    // Negative lookbehind: not inside a markdown link text [...]
    // Negative lookahead: not followed by ]( which means it's already link text
    const regex = new RegExp(
      `(?<!\\[[^\\]]*)\\b(${escapeRegex(link.keyword)})\\b(?![^\\[]*\\])`,
      "i",
    );

    if (regex.test(result)) {
      // Replace only the first occurrence
      result = result.replace(regex, `[$1](${link.url})`);
      usedUrls.add(link.url);
      linksInserted++;
    }
  }

  return result;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
