import Link from "next/link";
import { Calculator, Lightbulb, Info, AlertTriangle, ArrowRight } from "lucide-react";

// ---------------------------------------------------------------------------
// Custom MDX components used in blog posts
// ---------------------------------------------------------------------------

/** Comparison table rendered from MDX props */
function ComparisonTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-x-auto my-6 rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted">
            {headers.map((h, i) => (
              <th
                key={i}
                className="text-left px-4 py-3 font-semibold text-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-accent/50 transition-colors">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-4 py-3 ${
                    j === 0
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Calculator embed cards — link to the relevant calculator page
// ---------------------------------------------------------------------------

function CalculatorCard({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-xl p-5 my-6 transition-colors group"
    >
      <Calculator className="w-5 h-5 text-primary" />
      <span className="text-primary font-semibold group-hover:underline">
        {label}
      </span>
      <ArrowRight className="w-4 h-4 text-primary" />
    </Link>
  );
}

function EmiCalculator() {
  return (
    <CalculatorCard href="/" label="Open EMI Part Payment Calculator" />
  );
}

function SipVsPrepaymentCalc() {
  return (
    <CalculatorCard
      href="/calculators/sip-vs-prepayment"
      label="Open SIP vs Prepayment Calculator"
    />
  );
}

function EligibilityCalc() {
  return (
    <CalculatorCard
      href="/calculators/home-loan-eligibility"
      label="Open Loan Eligibility Calculator"
    />
  );
}

function TaxBenefitCalc() {
  return (
    <CalculatorCard
      href="/calculators/tax-benefit"
      label="Open Tax Benefit Calculator"
    />
  );
}

// ---------------------------------------------------------------------------
// Callout component — tip / warning / info
// ---------------------------------------------------------------------------

function Callout({
  type = "info",
  children,
}: {
  type?: "tip" | "warning" | "info";
  children: React.ReactNode;
}) {
  const styles: Record<string, string> = {
    tip: "bg-green-50 border-l-4 border-green-500 text-foreground dark:bg-green-950/30 dark:border-green-400",
    info: "bg-blue-50 border-l-4 border-blue-500 text-foreground dark:bg-blue-950/30 dark:border-blue-400",
    warning:
      "bg-amber-50 border-l-4 border-amber-500 text-foreground dark:bg-amber-950/30 dark:border-amber-400",
  };
  const IconComponent = {
    tip: Lightbulb,
    info: Info,
    warning: AlertTriangle,
  }[type];

  return (
    <div className={`rounded-r-lg p-4 my-6 text-sm ${styles[type]}`}>
      <div className="flex items-start gap-2.5">
        <IconComponent className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" />
        <div>{children}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HTML element overrides for consistent typography
// ---------------------------------------------------------------------------

export const mdxComponents = {
  // Custom components
  ComparisonTable,
  EmiCalculator,
  SipVsPrepaymentCalc,
  EligibilityCalc,
  TaxBenefitCalc,
  Callout,

  // HTML element overrides
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="text-xl sm:text-2xl font-bold text-foreground mt-10 mb-4 pb-2 border-b border-border"
      {...props}
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="text-lg font-semibold text-foreground mt-8 mb-3"
      {...props}
    />
  ),
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      className="text-base font-semibold text-foreground mt-6 mb-2"
      {...props}
    />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-foreground/90 leading-7 mb-4" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
      {...props}
    />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className="list-disc list-outside ml-6 space-y-2 mb-4 text-foreground/90"
      {...props}
    />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className="list-decimal list-outside ml-6 space-y-2 mb-4 text-foreground/90"
      {...props}
    />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="leading-7" {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-6"
      {...props}
    />
  ),
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-6 rounded-lg border border-border">
      <table className="w-full text-sm" {...props} />
    </div>
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-muted" {...props} />
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="text-left px-4 py-3 font-semibold text-foreground"
      {...props}
    />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      className="px-4 py-3 border-t border-border text-muted-foreground"
      {...props}
    />
  ),
  hr: () => <hr className="border-border my-8" />,
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code
      className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground"
      {...props}
    />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="bg-muted rounded-lg p-4 overflow-x-auto my-6 text-sm"
      {...props}
    />
  ),
};
