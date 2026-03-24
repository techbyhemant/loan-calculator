/**
 * Shared calculator UI components — single source of truth.
 * All calculators MUST use these instead of raw HTML elements.
 *
 * Built on top of shadcn components (Button, Card) so theme changes
 * propagate automatically to every calculator.
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── INPUT STYLES ────────────────────────────────────────────
// NumericInput still uses a className prop. This matches shadcn Input styling.
export const CALC_INPUT_CLASS =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] placeholder:text-muted-foreground disabled:opacity-50 md:text-sm";

// ─── SECTION CARD ────────────────────────────────────────────
// Wraps a group of inputs or results. Uses shadcn Card.
export function CalcCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("py-4 sm:py-6", className)}>
      <CardContent className="px-4 sm:px-6">{children}</CardContent>
    </Card>
  );
}

// Section card with a title
export function CalcSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("py-4 sm:py-6", className)}>
      <CardHeader className="px-4 sm:px-6 pb-0">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pt-4">{children}</CardContent>
    </Card>
  );
}

// ─── STAT CARD ───────────────────────────────────────────────
// Displays a single result value (e.g. "Max Loan: ₹52.4L")
export function StatCard({
  label,
  value,
  sub,
  valueColor = "text-foreground",
  className,
}: {
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
  className?: string;
}) {
  return (
    <Card className={cn("py-4 text-center", className)}>
      <CardContent className="px-4">
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className={cn("text-2xl font-bold", valueColor)}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ─── TOGGLE BUTTON GROUP ─────────────────────────────────────
// For binary choices: Fixed/Floating, Old/New regime, EMI/Tenure
export function ToggleGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (val: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <Button
          key={opt.value}
          type="button"
          variant={value === opt.value ? "default" : "outline"}
          className="flex-1"
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}

// ─── TABLE CARD ──────────────────────────────────────────────
// Wraps a comparison table with optional header
export function TableCard({
  title,
  description,
  children,
  footer,
  className,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("py-0 overflow-hidden", className)}>
      {title && (
        <CardHeader className="px-4 py-3 border-b">
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <div className="overflow-x-auto">{children}</div>
      {footer && (
        <div className="px-4 py-2 bg-muted/50 border-t text-xs text-muted-foreground">
          {footer}
        </div>
      )}
    </Card>
  );
}

// ─── VERDICT BANNER ──────────────────────────────────────────
export function Verdict({
  type,
  children,
}: {
  type: "good" | "bad" | "neutral";
  children: React.ReactNode;
}) {
  const styles = {
    good: "bg-green-50 text-green-800 border-green-200",
    bad: "bg-red-50 text-red-800 border-red-200",
    neutral: "bg-amber-50 text-amber-800 border-amber-200",
  };
  return (
    <div className={cn("rounded-xl p-4 text-center font-semibold text-lg border", styles[type])}>
      {children}
    </div>
  );
}

// ─── CALLOUT ─────────────────────────────────────────────────
export function Callout({
  type = "info",
  children,
}: {
  type?: "info" | "warning";
  children: React.ReactNode;
}) {
  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-700",
    warning: "bg-amber-50 border-amber-200 text-amber-700",
  };
  return (
    <div className={cn("border rounded-lg p-3 text-sm", styles[type])}>
      {children}
    </div>
  );
}

// ─── LABEL ───────────────────────────────────────────────────
export function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block text-sm font-medium text-foreground mb-1", className)}>
      {children}
    </label>
  );
}

// Re-export for backward compatibility during migration
export const CALC_STYLES = {
  input: CALC_INPUT_CLASS,
} as const;
