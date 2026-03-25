"use client";

import { useState, useMemo } from "react";

import {
  calculatePrepayBenefit,
  calculateSipBenefit,
  type Recommendation,
} from "@/lib/calculations/sipVsPrepayCalcs";
import { formatINR, formatMonths } from "@/lib/utils/formatters";

import NumericInput from "@/components/ui/NumericInput";
import {
  CALC_INPUT_CLASS,
  CalcSection,
  CalcCard,
  TableCard,
  Verdict,
  ToggleGroup,
  Label,
} from "./shared";

export default function SipVsPrepaymentCalc() {
  const [loanOutstanding, setLoanOutstanding] = useState<number | "">(3000000);
  const [interestRate, setInterestRate] = useState<number | "">(8.5);
  const [remainingMonths, setRemainingMonths] = useState<number | "">(180);
  const [monthlyExtra, setMonthlyExtra] = useState<number | "">(10000);
  const [sipReturn, setSipReturn] = useState<number | "">(12);
  const [taxBracket, setTaxBracket] = useState<"10" | "20" | "30">("30");

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
      <CalcSection title="Enter Your Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Loan Outstanding (₹)</Label>
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
            <Label>Monthly Surplus Amount (₹)</Label>
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
