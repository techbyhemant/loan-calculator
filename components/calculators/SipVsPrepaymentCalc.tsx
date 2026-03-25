"use client";

import { useState, useMemo } from "react";

import {
  calculatePrepayBenefit,
  calculateSipBenefit,
  type Recommendation,
} from "@/lib/calculations/sipVsPrepayCalcs";
import { formatINR, formatMonths } from "@/lib/utils/formatters";
import {
  LOAN_TYPE_DISPLAY,
  LOAN_TYPE_FINANCIALS,
  getEffectiveAnnualRate,
  type LoanType,
} from "@/lib/calculations/loanTypeConfig";

import NumericInput from "@/components/ui/NumericInput";
import {
  CALC_INPUT_CLASS,
  CalcSection,
  CalcCard,
  TableCard,
  Verdict,
  ToggleGroup,
  Callout,
  Label,
} from "./shared";

const SIP_RELEVANT_TYPES: LoanType[] = [
  "home",
  "car",
  "personal",
  "education",
  "lap",
  "gold",
];

function getTaxNote(
  type: LoanType,
  nominalRate: number,
  taxBracket: number
): { text: string; type: "info" | "warning" } | null {
  const effectiveInfo = getEffectiveAnnualRate(type, nominalRate / 100, taxBracket / 100);

  if (type === "home") {
    return {
      text: `${nominalRate.toFixed(1)}% actual → ~${(effectiveInfo.effectiveRate * 100).toFixed(1)}% effective after Section 24(b)`,
      type: "info",
    };
  }

  if (type === "education") {
    return {
      text: `${nominalRate.toFixed(1)}% actual → ~${(effectiveInfo.effectiveRate * 100).toFixed(1)}% effective after Section 80E`,
      type: "info",
    };
  }

  if (type === "personal" || type === "car" || type === "gold" || type === "lap") {
    return {
      text: "No tax benefit — effective rate equals nominal rate",
      type: "warning",
    };
  }

  return null;
}

export default function SipVsPrepaymentCalc() {
  const [loanType, setLoanType] = useState<LoanType>("home");
  const [loanOutstanding, setLoanOutstanding] = useState<number | "">(3000000);
  const [interestRate, setInterestRate] = useState<number | "">(8.5);
  const [remainingMonths, setRemainingMonths] = useState<number | "">(180);
  const [monthlyExtra, setMonthlyExtra] = useState<number | "">(10000);
  const [sipReturn, setSipReturn] = useState<number | "">(12);
  const [taxBracket, setTaxBracket] = useState<"10" | "20" | "30">("30");

  const handleLoanTypeChange = (newType: LoanType) => {
    setLoanType(newType);
    const financials = LOAN_TYPE_FINANCIALS[newType];
    setInterestRate(+(financials.defaultRatePA * 100).toFixed(1));
    setLoanOutstanding(financials.defaultAmountINR);
    setRemainingMonths(financials.defaultTenureMonths);
  };

  const taxNote = useMemo(() => {
    if (!interestRate) return null;
    return getTaxNote(loanType, interestRate as number, Number(taxBracket));
  }, [loanType, interestRate, taxBracket]);

  const results = useMemo(() => {
    if (!loanOutstanding || !interestRate || !remainingMonths || !monthlyExtra || !sipReturn) return null;

    const prepay = calculatePrepayBenefit(loanOutstanding, interestRate, remainingMonths, monthlyExtra, Number(taxBracket));
    const sip = calculateSipBenefit(monthlyExtra, remainingMonths, sipReturn);

    let recommendation: Recommendation;
    if (prepay.netBenefit > sip.netCorpus - sip.totalInvested) recommendation = "PREPAY";
    else if (sip.netCorpus - sip.totalInvested > prepay.netBenefit) recommendation = "SIP";
    else recommendation = "SPLIT";

    return { prepay, sip, recommendation };
  }, [loanOutstanding, interestRate, remainingMonths, monthlyExtra, sipReturn, taxBracket]);

  return (
    <div className="space-y-6">
      <CalcSection title="Select Loan Type">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {SIP_RELEVANT_TYPES.map((type) => {
            const display = LOAN_TYPE_DISPLAY[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleLoanTypeChange(type)}
                className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-center transition-colors ${
                  loanType === type
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40"
                }`}
              >
                <span className="text-xl">{display.icon}</span>
                <span className="text-xs font-medium">{display.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </CalcSection>

      {taxNote && (
        <Callout type={taxNote.type}>
          <strong>{LOAN_TYPE_DISPLAY[loanType].label}:</strong> {taxNote.text}
        </Callout>
      )}

      {loanType === "personal" && (
        <Callout type="warning">
          At 16% with no tax benefit, prepaying almost always beats SIP. The
          guaranteed interest saving far exceeds uncertain market returns.
        </Callout>
      )}

      <CalcSection title="Enter Your Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Loan Outstanding (&#8377;)</Label>
            <NumericInput value={loanOutstanding} onChange={setLoanOutstanding} placeholder="30,00,000" min={0} className={CALC_INPUT_CLASS} />
          </div>
          <div>
            <Label>Annual Interest Rate (%)</Label>
            <NumericInput value={interestRate} onChange={setInterestRate} placeholder="8.5" min={0} max={30} step={0.1} className={CALC_INPUT_CLASS} />
          </div>
          <div>
            <Label>Remaining Months</Label>
            <NumericInput value={remainingMonths} onChange={setRemainingMonths} placeholder="180" min={1} max={360} className={CALC_INPUT_CLASS} />
          </div>
          <div>
            <Label>Monthly Surplus Amount (&#8377;)</Label>
            <NumericInput value={monthlyExtra} onChange={setMonthlyExtra} placeholder="10,000" min={0} className={CALC_INPUT_CLASS} />
          </div>
          <div>
            <Label>Expected SIP Annual Return (%)</Label>
            <NumericInput value={sipReturn} onChange={setSipReturn} placeholder="12" min={0} max={30} step={0.1} className={CALC_INPUT_CLASS} />
          </div>
          <div>
            <Label>Tax Bracket</Label>
            <ToggleGroup
              value={taxBracket}
              onChange={setTaxBracket}
              options={[
                { value: "10", label: "10%" },
                { value: "20", label: "20%" },
                { value: "30", label: "30%" },
              ]}
            />
          </div>
        </div>
      </CalcSection>

      {results && (
        <div className="space-y-4">
          <Verdict type={results.recommendation === "SPLIT" ? "neutral" : "good"}>
            {results.recommendation === "PREPAY"
              ? "Prepaying your loan is the better option!"
              : results.recommendation === "SIP"
                ? "Investing in SIP gives you better returns!"
                : "Both options are close — consider splitting your surplus."}
          </Verdict>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CalcCard className={results.recommendation === "PREPAY" ? "ring-2 ring-positive/20" : ""}>
              <h2 className="text-base font-semibold mb-3">Prepay Your Loan</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Interest Saved</span><span className="font-semibold text-positive">{formatINR(results.prepay.interestSaved)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Months Reduced</span><span className="font-semibold">{formatMonths(results.prepay.monthsReduced)}</span></div>
                <div className="border-t pt-2 flex justify-between font-semibold"><span>Net Benefit</span><span className="text-positive">{formatINR(results.prepay.netBenefit)}</span></div>
              </div>
            </CalcCard>

            <CalcCard className={results.recommendation === "SIP" ? "ring-2 ring-primary/20" : ""}>
              <h2 className="text-base font-semibold mb-3">Invest in SIP</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Corpus at Loan End</span><span className="font-semibold text-primary">{formatINR(results.sip.corpus)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">LTCG Tax</span><span className="font-semibold text-negative">-{formatINR(results.sip.ltcgTax)}</span></div>
                <div className="border-t pt-2 flex justify-between font-semibold"><span>Net Corpus</span><span className="text-primary">{formatINR(results.sip.netCorpus)}</span></div>
              </div>
            </CalcCard>
          </div>

          <TableCard>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium">Metric</th>
                  <th className="text-right px-4 py-3 font-medium text-positive">Prepay</th>
                  <th className="text-right px-4 py-3 font-medium text-primary">SIP</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="px-4 py-3 text-muted-foreground">Interest Saved</td><td className="px-4 py-3 text-right font-medium">{formatINR(results.prepay.interestSaved)}</td><td className="px-4 py-3 text-right text-muted-foreground">—</td></tr>
                <tr><td className="px-4 py-3 text-muted-foreground">Months Reduced</td><td className="px-4 py-3 text-right font-medium">{formatMonths(results.prepay.monthsReduced)}</td><td className="px-4 py-3 text-right text-muted-foreground">—</td></tr>
                <tr><td className="px-4 py-3 text-muted-foreground">Corpus Built</td><td className="px-4 py-3 text-right text-muted-foreground">—</td><td className="px-4 py-3 text-right font-medium">{formatINR(results.sip.corpus)}</td></tr>
                <tr><td className="px-4 py-3 text-muted-foreground">LTCG Tax</td><td className="px-4 py-3 text-right text-muted-foreground">—</td><td className="px-4 py-3 text-right text-negative">-{formatINR(results.sip.ltcgTax)}</td></tr>
                <tr className="bg-muted/50 font-semibold"><td className="px-4 py-3">Net Benefit</td><td className="px-4 py-3 text-right text-positive">{formatINR(results.prepay.netBenefit)}</td><td className="px-4 py-3 text-right text-primary">{formatINR(results.sip.netCorpus - results.sip.totalInvested)}</td></tr>
              </tbody>
            </table>
          </TableCard>
        </div>
      )}
    </div>
  );
}
