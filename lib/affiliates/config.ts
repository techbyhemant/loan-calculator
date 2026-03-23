/**
 * Affiliate link configuration.
 * Controls when and where affiliate CTAs are shown.
 *
 * Rules — NEVER bypass these:
 *   balanceTransfer → netSaving > 50_000 after all fees
 *   creditCardDebt  → outstanding > 50_000
 *   consolidation   → verdict === 'BENEFICIAL' && netSaving > 25_000
 *   newHomeLoan     → always show rate comparison CTA (no phone capture)
 */

import type { ConsolidationVerdict } from "@/types";

export const AFFILIATE_THRESHOLDS = {
  balanceTransferMinSaving: 50_000,
  creditCardMinOutstanding: 50_000,
  consolidationMinSaving: 25_000,
} as const;

export interface AffiliateLink {
  provider: string;
  label: string;
  url: string;
  category: "balance-transfer" | "credit-card" | "consolidation" | "home-loan";
}

const AFFILIATE_LINKS: AffiliateLink[] = [
  {
    provider: "BankBazaar",
    label: "Compare Home Loan Rates",
    url: process.env.BANKBAZAAR_HOME_LOAN_URL ?? "#",
    category: "home-loan",
  },
  {
    provider: "BankBazaar",
    label: "Transfer Your Personal Loan",
    url: process.env.BANKBAZAAR_PERSONAL_LOAN_URL ?? "#",
    category: "balance-transfer",
  },
  {
    provider: "PaisaBazaar",
    label: "Compare Balance Transfer Offers",
    url: process.env.PAISABAZAAR_URL ?? "#",
    category: "consolidation",
  },
];

export function shouldShowAffiliate(
  category: AffiliateLink["category"],
  params: {
    netSaving?: number;
    outstanding?: number;
    verdict?: ConsolidationVerdict;
  },
): boolean {
  switch (category) {
    case "balance-transfer":
      return (params.netSaving ?? 0) > AFFILIATE_THRESHOLDS.balanceTransferMinSaving;
    case "credit-card":
      return (params.outstanding ?? 0) > AFFILIATE_THRESHOLDS.creditCardMinOutstanding;
    case "consolidation":
      return (
        params.verdict === "BENEFICIAL" &&
        (params.netSaving ?? 0) > AFFILIATE_THRESHOLDS.consolidationMinSaving
      );
    case "home-loan":
      return true; // Always show rate comparison CTA (no phone capture)
    default:
      return false;
  }
}

export function getAffiliateLinks(category: AffiliateLink["category"]): AffiliateLink[] {
  return AFFILIATE_LINKS.filter((l) => l.category === category);
}
