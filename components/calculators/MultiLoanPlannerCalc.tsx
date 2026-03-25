"use client";

import { useState, useMemo } from "react";

import { formatINR, formatLakhs } from "@/lib/utils/formatters";

import NumericInput from "@/components/ui/NumericInput";
import {
  CalcSection,
  TableCard,
  Verdict,
  Callout,
  Label,
  CALC_INPUT_CLASS,
} from "./shared";
import {
  LoanType,
  LOAN_TYPE_DISPLAY,
  LOAN_TYPE_FINANCIALS,
  sortByPayoffPriority,
  getEffectiveAnnualRate,
} from "@/lib/calculations/loanTypeConfig";

// ─── Types ──────────────────────────────────────────────────────
interface LoanEntry {
  name: string;
  type: LoanType;
  outstanding: number | "";
  ratePA: number | "";
  emi: number | "";
}

const LOAN_TYPE_OPTIONS: LoanType[] = [
  "home",
  "car",
  "two_wheeler",
  "personal",
  "education",
  "gold",
  "consumer_durable",
  "lap",
  "medical",
  "other",
];

const TAX_BRACKET_OPTIONS = [0, 10, 20, 30] as const;

const DEFAULT_LOANS: LoanEntry[] = [
  { name: "Home Loan", type: "home", outstanding: 4000000, ratePA: 8.5, emi: 38000 },
  { name: "Personal Loan", type: "personal", outstanding: 300000, ratePA: 16, emi: 12000 },
];

// ─── Component ──────────────────────────────────────────────────
export default function MultiLoanPlannerCalc() {
  const [loans, setLoans] = useState<LoanEntry[]>(DEFAULT_LOANS);
  const [monthlySurplus, setMonthlySurplus] = useState<number | "">(5000);
  const [taxBracket, setTaxBracket] = useState<number>(30);

  function addLoan() {
    if (loans.length >= 6) return;
    setLoans([
      ...loans,
      {
        name: `Loan ${loans.length + 1}`,
        type: "personal",
        outstanding: "",
        ratePA: "",
        emi: "",
      },
    ]);
  }

  function removeLoan(index: number) {
    if (loans.length <= 1) return;
    setLoans(loans.filter((_, i) => i !== index));
  }

  function updateLoan(
    index: number,
    field: keyof LoanEntry,
    value: string | number | ""
  ) {
    setLoans(
      loans.map((loan, i) =>
        i === index ? { ...loan, [field]: value } : loan
      )
    );
  }

  // ─── Computation ────────────────────────────────────────────
  const results = useMemo(() => {
    const validLoans = loans.filter(
      (l) =>
        typeof l.outstanding === "number" &&
        l.outstanding > 0 &&
        typeof l.ratePA === "number" &&
        l.ratePA > 0
    );
    if (validLoans.length === 0) return null;

    const taxBracketDecimal = taxBracket / 100;

    // Sort by payoff priority using the config engine
    const sorted = sortByPayoffPriority(
      validLoans.map((l) => ({
        type: l.type,
        ratePA: (l.ratePA as number) / 100, // convert percent to decimal
        outstanding: l.outstanding as number,
        taxBracketPercent: taxBracketDecimal,
      }))
    );

    // Build enriched results with display info and effective rate comparison
    const enriched = sorted.map((item, index) => {
      const originalLoan = validLoans.find(
        (l) => l.type === item.type && l.outstanding === item.outstanding
      );
      const display = LOAN_TYPE_DISPLAY[item.type];
      const financials = LOAN_TYPE_FINANCIALS[item.type];
      const { effectiveRate, explanation } = getEffectiveAnnualRate(
        item.type,
        item.ratePA,
        taxBracketDecimal
      );

      return {
        priority: index + 1,
        name: originalLoan?.name ?? display.label,
        type: item.type,
        icon: display.icon,
        label: display.label,
        nominalRate: item.ratePA * 100,
        effectiveRate: effectiveRate * 100,
        outstanding: item.outstanding,
        emi: originalLoan?.emi ?? "",
        reason: item.reason,
        explanation,
        hasTaxBenefit: financials.taxBenefit24b || financials.taxBenefit80E || financials.taxBenefit80C,
      };
    });

    // Check for specific loan type combos for smart callouts
    const hasHomeLoan = validLoans.some((l) => l.type === "home");
    const hasHigherRateLoan = validLoans.some(
      (l) => l.type !== "home" && typeof l.ratePA === "number" && l.ratePA > 10
    );
    const hasEducationLoan = validLoans.some((l) => l.type === "education");

    const homeLoan = hasHomeLoan
      ? validLoans.find((l) => l.type === "home")
      : null;
    const highestNonHomeLoan = hasHigherRateLoan
      ? validLoans
          .filter((l) => l.type !== "home" && typeof l.ratePA === "number" && l.ratePA > 10)
          .sort((a, b) => (b.ratePA as number) - (a.ratePA as number))[0]
      : null;

    let homeLoanEffectiveRate: number | null = null;
    if (homeLoan && typeof homeLoan.ratePA === "number") {
      const { effectiveRate } = getEffectiveAnnualRate(
        "home",
        homeLoan.ratePA / 100,
        taxBracketDecimal
      );
      homeLoanEffectiveRate = effectiveRate * 100;
    }

    return {
      enriched,
      hasHomeLoan,
      hasHigherRateLoan,
      hasEducationLoan,
      homeLoan,
      highestNonHomeLoan,
      homeLoanEffectiveRate,
    };
  }, [loans, taxBracket]);

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Input Section */}
      <CalcSection title="Your Loans">
        <div className="space-y-3">
          {loans.map((loan, index) => (
            <div
              key={index}
              className="border border-border rounded-lg p-3 space-y-2"
            >
              <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    {index === 0 && <Label>Type</Label>}
                    <select
                      value={loan.type}
                      onChange={(e) =>
                        updateLoan(index, "type", e.target.value as LoanType)
                      }
                      className={CALC_INPUT_CLASS}
                    >
                      {LOAN_TYPE_OPTIONS.map((type) => (
                        <option key={type} value={type}>
                          {LOAN_TYPE_DISPLAY[type].icon} {LOAN_TYPE_DISPLAY[type].label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    {index === 0 && <Label>Loan Name</Label>}
                    <input
                      type="text"
                      value={loan.name}
                      onChange={(e) => updateLoan(index, "name", e.target.value)}
                      placeholder="e.g. SBI Home Loan"
                      className={CALC_INPUT_CLASS}
                    />
                  </div>
                </div>
                <div className="self-end">
                  <button
                    type="button"
                    onClick={() => removeLoan(index)}
                    disabled={loans.length <= 1}
                    className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-negative hover:bg-negative/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label={`Remove ${loan.name}`}
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  {index === 0 && <Label>Outstanding (₹)</Label>}
                  {index !== 0 && (
                    <span className="block text-xs text-muted-foreground mb-1 sm:hidden">
                      Outstanding
                    </span>
                  )}
                  <NumericInput
                    value={loan.outstanding}
                    onChange={(val) => updateLoan(index, "outstanding", val)}
                    placeholder="40,00,000"
                    min={0}
                    className={CALC_INPUT_CLASS}
                  />
                </div>
                <div>
                  {index === 0 && <Label>Rate (% PA)</Label>}
                  {index !== 0 && (
                    <span className="block text-xs text-muted-foreground mb-1 sm:hidden">
                      Rate
                    </span>
                  )}
                  <NumericInput
                    value={loan.ratePA}
                    onChange={(val) => updateLoan(index, "ratePA", val)}
                    placeholder="8.5"
                    min={0}
                    max={50}
                    step={0.1}
                    className={CALC_INPUT_CLASS}
                  />
                </div>
                <div>
                  {index === 0 && <Label>EMI (₹)</Label>}
                  {index !== 0 && (
                    <span className="block text-xs text-muted-foreground mb-1 sm:hidden">
                      EMI
                    </span>
                  )}
                  <NumericInput
                    value={loan.emi}
                    onChange={(val) => updateLoan(index, "emi", val)}
                    placeholder="38,000"
                    min={0}
                    className={CALC_INPUT_CLASS}
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addLoan}
            disabled={loans.length >= 6}
            className="text-sm font-medium text-primary hover:text-primary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            + Add Loan{loans.length >= 6 ? " (max 6)" : ""}
          </button>
        </div>

        {/* Surplus + Tax Bracket */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Monthly Surplus for Extra Payment (₹)</Label>
            <NumericInput
              value={monthlySurplus}
              onChange={setMonthlySurplus}
              placeholder="5,000"
              min={0}
              className={CALC_INPUT_CLASS}
            />
          </div>
          <div>
            <Label>Your Tax Bracket</Label>
            <div className="flex gap-2">
              {TAX_BRACKET_OPTIONS.map((bracket) => (
                <button
                  key={bracket}
                  type="button"
                  onClick={() => setTaxBracket(bracket)}
                  className={`flex-1 h-9 rounded-md text-sm font-medium border transition-colors ${
                    taxBracket === bracket
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-input hover:bg-muted"
                  }`}
                >
                  {bracket}%
                </button>
              ))}
            </div>
          </div>
        </div>
      </CalcSection>

      {/* Results */}
      {results && results.enriched.length > 0 && (
        <div className="space-y-4">
          {/* Verdict */}
          <Verdict type="good">
            Pay your {results.enriched[0].name} ({results.enriched[0].nominalRate.toFixed(1)}%) first
            — {results.enriched[0].reason}
          </Verdict>

          {/* Payoff Order Table */}
          <TableCard title="Recommended Payoff Order" description="Based on effective after-tax rates and loan characteristics">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium">#</th>
                  <th className="text-left px-4 py-3 font-medium">Loan</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Type</th>
                  <th className="text-right px-4 py-3 font-medium">Rate</th>
                  <th className="text-right px-4 py-3 font-medium">Eff. Rate</th>
                  <th className="text-right px-4 py-3 font-medium">Outstanding</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {results.enriched.map((loan) => (
                  <tr key={`${loan.type}-${loan.priority}`}>
                    <td className="px-4 py-3 text-muted-foreground">
                      {loan.priority}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      <span className="mr-1">{loan.icon}</span>
                      {loan.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {loan.label}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {loan.nominalRate.toFixed(1)}%
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${
                      loan.effectiveRate < loan.nominalRate
                        ? "text-positive"
                        : ""
                    }`}>
                      {loan.effectiveRate.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatLakhs(loan.outstanding)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell max-w-[200px]">
                      {loan.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>

          {/* Reason cards for mobile (hidden on md+) */}
          <div className="space-y-2 md:hidden">
            {results.enriched.map((loan) => (
              <div
                key={`reason-${loan.type}-${loan.priority}`}
                className="bg-muted/30 rounded-lg px-3 py-2 text-xs text-muted-foreground"
              >
                <span className="font-medium text-foreground">
                  #{loan.priority} {loan.icon} {loan.name}:
                </span>{" "}
                {loan.reason}
              </div>
            ))}
          </div>

          {/* Smart Callout: Home Loan + Higher Rate Loan */}
          {results.hasHomeLoan &&
            results.hasHigherRateLoan &&
            results.homeLoan &&
            results.highestNonHomeLoan &&
            results.homeLoanEffectiveRate !== null && (
              <Callout type="info">
                Your home loan at {(results.homeLoan.ratePA as number).toFixed(1)}% costs only{" "}
                {results.homeLoanEffectiveRate.toFixed(1)}% after Section 24(b) tax benefit
                ({taxBracket}% bracket). Pay off your{" "}
                <strong>{results.highestNonHomeLoan.name}</strong> at{" "}
                {(results.highestNonHomeLoan.ratePA as number).toFixed(1)}% first — it has no tax
                benefit and costs you more in real terms.
              </Callout>
            )}

          {/* Education Loan Callout */}
          {results.hasEducationLoan && (
            <Callout type="info">
              Education loans qualify for Section 80E — the <strong>entire interest amount</strong>{" "}
              is deductible with no upper limit. This makes the effective cost significantly lower
              than the headline rate. In a {taxBracket}% tax bracket, a 10.5% education loan
              effectively costs {(10.5 * (1 - taxBracket / 100)).toFixed(1)}%.
            </Callout>
          )}

          {/* Credit Card Warning */}
          <Callout type="warning">
            Note: If you also have credit card debt, pay that off before any of these loans.
            Credit cards at 42% PA are always the most expensive debt.
          </Callout>
        </div>
      )}
    </div>
  );
}
