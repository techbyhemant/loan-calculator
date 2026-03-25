"use client";

import { useState, useMemo } from "react";

import { formatINR, formatLakhs, formatMonths } from "@/lib/utils/formatters";

import NumericInput from "@/components/ui/NumericInput";
import {
  CalcSection,
  StatCard,
  TableCard,
  Verdict,
  Callout,
  Label,
  CALC_INPUT_CLASS,
  ToggleGroup,
} from "./shared";
import {
  calculateMultiCardPayoff,
  CC_DEFAULTS,
} from "@/lib/calculations/creditCardCalcs";

interface CardEntry {
  name: string;
  outstanding: number | "";
  monthlyRate: number | "";
}

const DEFAULT_CARDS: CardEntry[] = [
  { name: "Card 1", outstanding: 50000, monthlyRate: 3.5 },
  { name: "Card 2", outstanding: 30000, monthlyRate: 3.5 },
];

export default function MultiCardPayoffCalc() {
  const [cards, setCards] = useState<CardEntry[]>(DEFAULT_CARDS);
  const [totalBudget, setTotalBudget] = useState<number | "">(10000);

  function addCard() {
    if (cards.length >= 5) return;
    setCards([
      ...cards,
      {
        name: `Card ${cards.length + 1}`,
        outstanding: 20000,
        monthlyRate: 3.5,
      },
    ]);
  }

  function removeCard(index: number) {
    if (cards.length <= 1) return;
    setCards(cards.filter((_, i) => i !== index));
  }

  function updateCard(
    index: number,
    field: keyof CardEntry,
    value: string | number | ""
  ) {
    setCards(
      cards.map((card, i) =>
        i === index ? { ...card, [field]: value } : card
      )
    );
  }

  const results = useMemo(() => {
    if (!totalBudget) return null;

    const validCards = cards.filter(
      (c) => typeof c.outstanding === "number" && c.outstanding > 0
    );
    if (validCards.length === 0) return null;

    const formattedCards = validCards.map((c) => ({
      name: c.name,
      outstanding: c.outstanding as number,
      monthlyRate:
        typeof c.monthlyRate === "number" ? c.monthlyRate / 100 : undefined,
    }));

    return calculateMultiCardPayoff(formattedCards, totalBudget as number);
  }, [cards, totalBudget]);

  return (
    <div className="space-y-6">
      <CalcSection title="Your Credit Cards">
        <div className="space-y-3">
          {cards.map((card, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_1fr_1fr_auto] sm:grid-cols-[1.5fr_1fr_1fr_auto] gap-2 items-end"
            >
              <div>
                {index === 0 && <Label>Card Name</Label>}
                <input
                  type="text"
                  value={card.name}
                  onChange={(e) => updateCard(index, "name", e.target.value)}
                  placeholder="Card name"
                  className={CALC_INPUT_CLASS}
                />
              </div>
              <div>
                {index === 0 && <Label>Balance (₹)</Label>}
                <NumericInput
                  value={card.outstanding}
                  onChange={(val) => updateCard(index, "outstanding", val)}
                  placeholder="50,000"
                  min={0}
                  className={CALC_INPUT_CLASS}
                />
              </div>
              <div>
                {index === 0 && <Label>Rate (%/mo)</Label>}
                <NumericInput
                  value={card.monthlyRate}
                  onChange={(val) => updateCard(index, "monthlyRate", val)}
                  placeholder="3.5"
                  min={0}
                  max={10}
                  step={0.1}
                  className={CALC_INPUT_CLASS}
                />
              </div>
              <button
                type="button"
                onClick={() => removeCard(index)}
                disabled={cards.length <= 1}
                className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-negative hover:bg-negative/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label={`Remove ${card.name}`}
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addCard}
            disabled={cards.length >= 5}
            className="text-sm font-medium text-primary hover:text-primary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            + Add Card{cards.length >= 5 ? " (max 5)" : ""}
          </button>
        </div>

        <div className="mt-4 max-w-sm">
          <Label>Total Monthly Budget (₹)</Label>
          <NumericInput
            value={totalBudget}
            onChange={setTotalBudget}
            placeholder="10,000"
            min={0}
            className={CALC_INPUT_CLASS}
          />
        </div>
      </CalcSection>

      {results && (
        <div className="space-y-4">
          <Verdict type="good">{results.recommendationReason}</Verdict>

          <TableCard title="Strategy Comparison">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium">Strategy</th>
                  <th className="text-right px-4 py-3 font-medium">
                    Total Interest
                  </th>
                  <th className="text-right px-4 py-3 font-medium">
                    Months to Debt-Free
                  </th>
                  <th className="text-right px-4 py-3 font-medium">
                    Interest Saved
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-4 py-3 font-medium">
                    Avalanche{" "}
                    <span className="text-xs text-muted-foreground">
                      (highest rate first)
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatINR(results.avalanche.totalInterest)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatMonths(results.avalanche.totalMonths)}
                  </td>
                  <td className="px-4 py-3 text-right text-positive font-medium">
                    {results.interestSavedByAvalanche > 0
                      ? formatINR(results.interestSavedByAvalanche)
                      : "—"}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">
                    Snowball{" "}
                    <span className="text-xs text-muted-foreground">
                      (lowest balance first)
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatINR(results.snowball.totalInterest)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatMonths(results.snowball.totalMonths)}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    Baseline
                  </td>
                </tr>
              </tbody>
            </table>
          </TableCard>

          <TableCard title="Payoff Order — Avalanche">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium">#</th>
                  <th className="text-left px-4 py-3 font-medium">Card</th>
                  <th className="text-right px-4 py-3 font-medium">Balance</th>
                  <th className="text-right px-4 py-3 font-medium">Rate</th>
                  <th className="text-right px-4 py-3 font-medium">
                    Months to Clear
                  </th>
                  <th className="text-right px-4 py-3 font-medium">
                    Interest Paid
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {results.avalanche.cards.map((card) => (
                  <tr key={`avalanche-${card.payoffOrder}`}>
                    <td className="px-4 py-3 text-muted-foreground">
                      {card.payoffOrder}
                    </td>
                    <td className="px-4 py-3 font-medium">{card.cardName}</td>
                    <td className="px-4 py-3 text-right">
                      {formatINR(card.outstanding)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {(card.monthlyRate * 100).toFixed(1)}%/mo
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatMonths(card.monthsToPayoff)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatINR(card.totalInterest)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>

          <TableCard title="Payoff Order — Snowball">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium">#</th>
                  <th className="text-left px-4 py-3 font-medium">Card</th>
                  <th className="text-right px-4 py-3 font-medium">Balance</th>
                  <th className="text-right px-4 py-3 font-medium">Rate</th>
                  <th className="text-right px-4 py-3 font-medium">
                    Months to Clear
                  </th>
                  <th className="text-right px-4 py-3 font-medium">
                    Interest Paid
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {results.snowball.cards.map((card) => (
                  <tr key={`snowball-${card.payoffOrder}`}>
                    <td className="px-4 py-3 text-muted-foreground">
                      {card.payoffOrder}
                    </td>
                    <td className="px-4 py-3 font-medium">{card.cardName}</td>
                    <td className="px-4 py-3 text-right">
                      {formatINR(card.outstanding)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {(card.monthlyRate * 100).toFixed(1)}%/mo
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatMonths(card.monthsToPayoff)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatINR(card.totalInterest)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>

          <Callout type="info">
            Avalanche always saves the most money mathematically. But snowball
            gives quicker wins which keeps you motivated. Pick what works for
            your personality.
          </Callout>
        </div>
      )}
    </div>
  );
}
