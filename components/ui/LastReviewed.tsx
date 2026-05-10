import { CheckCircle2 } from "lucide-react";

/**
 * Last-reviewed badge for YMYL pages. Tells the reader (and Google's
 * helpful-content classifier) that someone actively maintains the
 * accuracy of the page's claims — current rates, RBI rules, tax
 * thresholds, etc.
 *
 * Strong E-E-A-T signal on a financial-content site. Visible badge,
 * also embeds the date in a small hidden microformat so Google can
 * pick it up in structured-data parsing.
 *
 * Usage:
 *   <LastReviewed date="2026-05-10" reviewer="LastEMI Editorial" />
 *
 * Accepts ISO date strings only (YYYY-MM-DD). Reviewer defaults to
 * "LastEMI Editorial" so individual pages don't have to pass it.
 */

interface LastReviewedProps {
  date: string; // ISO YYYY-MM-DD
  reviewer?: string;
  className?: string;
}

function formatReviewDate(iso: string): string {
  // Render as "10 May 2026" — the Indian convention. Defensive about
  // bad input so a typo on a page never crashes server-render.
  const parts = iso.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return iso;
  const [y, m, d] = parts;
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${d} ${months[m - 1] ?? ""} ${y}`.trim();
}

export function LastReviewed({
  date,
  reviewer = "LastEMI Editorial",
  className = "",
}: LastReviewedProps) {
  const formatted = formatReviewDate(date);
  return (
    <div
      className={`inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 border border-border rounded-full px-2.5 py-1 ${className}`}
    >
      <CheckCircle2 className="w-3 h-3 text-positive" />
      <span>
        Reviewed by <span className="font-medium text-foreground">{reviewer}</span> on{" "}
        <time dateTime={date} className="font-medium text-foreground">
          {formatted}
        </time>
      </span>
    </div>
  );
}
