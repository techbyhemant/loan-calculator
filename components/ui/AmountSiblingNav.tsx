import Link from "next/link";

/**
 * Sibling navigation strip for the programmatic amount-page families.
 * Renders chips for each amount in the family with the current page's
 * amount highlighted but unclickable. Use after the live calculator on
 * each amount page so users can jump to a different loan size without
 * having to bounce back through the hub page.
 *
 * Generic over loan-type families (home loan, personal loan, etc.) —
 * the caller passes in the path prefix and the list of amount entries.
 */

export interface AmountSibling {
  slug: string;
  label: string; // e.g. "15 Lakh", "1 Crore"
}

interface AmountSiblingNavProps {
  /** URL prefix for the amount family, e.g. "/home-loan-emi-calculator" */
  basePath: string;
  /** Slug of the page currently being viewed — highlighted, not linked. */
  currentSlug: string;
  /** All amount variants in this family. */
  amounts: AmountSibling[];
  /** Heading shown above the chips. Optional, defaults to a sensible string. */
  heading?: string;
  /** Optional href for the family hub page (e.g. "/home-loan-emi-calculator"). */
  hubHref?: string;
  /** Label for the hub link, defaults to "See all". */
  hubLabel?: string;
}

export function AmountSiblingNav({
  basePath,
  currentSlug,
  amounts,
  heading = "Compare other loan amounts",
  hubHref,
  hubLabel = "See all",
}: AmountSiblingNavProps) {
  return (
    <section className="mt-10 mb-2">
      <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
        {heading}
      </h2>
      <div className="flex flex-wrap gap-2">
        {amounts.map((a) => {
          const isCurrent = a.slug === currentSlug;
          if (isCurrent) {
            return (
              <span
                key={a.slug}
                aria-current="page"
                className="px-3 py-1.5 rounded-lg border border-primary bg-primary/10 text-sm font-medium text-primary cursor-default"
              >
                ₹{a.label}
              </span>
            );
          }
          return (
            <Link
              key={a.slug}
              href={`${basePath}/${a.slug}`}
              className="px-3 py-1.5 rounded-lg border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-colors text-sm text-foreground"
            >
              ₹{a.label}
            </Link>
          );
        })}
        {hubHref && (
          <Link
            href={hubHref}
            className="px-3 py-1.5 rounded-lg border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-colors text-sm text-muted-foreground"
          >
            {hubLabel} &rarr;
          </Link>
        )}
      </div>
    </section>
  );
}
