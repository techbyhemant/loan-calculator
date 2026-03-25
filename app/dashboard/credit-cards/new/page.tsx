"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatINR } from "@/lib/utils/formatters";
import { trpcReact } from "@/lib/trpc/hooks";
import NumericInput from "@/components/ui/NumericInput";

const COMMON_ISSUERS = [
  "HDFC Bank", "SBI", "ICICI Bank", "Axis Bank", "Kotak Mahindra",
  "RBL Bank", "IndusInd Bank", "Yes Bank", "HSBC", "Citibank", "Amex", "Other"
];

export default function NewCreditCardPage() {
  const router = useRouter();
  const utils = trpcReact.useUtils();
  const createCard = trpcReact.creditCards.create.useMutation({
    onSuccess: () => {
      utils.creditCards.getAll.invalidate();
      router.push("/dashboard/credit-cards");
    },
    onError: (err) => {
      setError(err.message);
      setSubmitting(false);
    },
  });

  const [name, setName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [creditLimit, setCreditLimit] = useState<number | "">(200000);
  const [currentOutstanding, setCurrentOutstanding] = useState<number | "">(0);
  const [monthlyRate, setMonthlyRate] = useState<number | "">(3.5);
  const [billingDate, setBillingDate] = useState<number | "">(1);
  const [dueDate, setDueDate] = useState<number | "">(20);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!name || !creditLimit) {
      setError("Please fill in card name and credit limit");
      return;
    }
    setError("");
    setSubmitting(true);
    createCard.mutate({
      name,
      issuer,
      creditLimit: creditLimit as number,
      currentOutstanding: (currentOutstanding as number) || 0,
      monthlyRate: ((monthlyRate as number) || 3.5) / 100,
      minimumDuePercent: 0.05,
      billingDate: (billingDate as number) || 1,
      dueDate: (dueDate as number) || 20,
      notes: notes || undefined,
    });
  };

  const monthlyInterest = (currentOutstanding && monthlyRate)
    ? (currentOutstanding as number) * ((monthlyRate as number) / 100)
    : 0;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/credit-cards" className="text-muted-foreground hover:text-muted-foreground">
          &larr;
        </Link>
        <h1 className="text-xl font-bold text-foreground">Add Credit Card</h1>
      </div>

      <div className="bg-card rounded-xl shadow-sm p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Card Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. HDFC Regalia"
            className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Issuing Bank</label>
          <select
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          >
            <option value="">Select bank...</option>
            {COMMON_ISSUERS.map((bank) => (
              <option key={bank} value={bank}>{bank}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Credit Limit (₹)</label>
            <NumericInput
              value={creditLimit}
              onChange={setCreditLimit}
              placeholder="2,00,000"
              min={0}
              className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Outstanding (₹)</label>
            <NumericInput
              value={currentOutstanding}
              onChange={setCurrentOutstanding}
              placeholder="0"
              min={0}
              className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Monthly Interest Rate (%)</label>
          <NumericInput
            value={monthlyRate}
            onChange={setMonthlyRate}
            placeholder="3.5"
            min={0}
            max={10}
            step={0.1}
            className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Standard in India: 3.5%/month = 42% PA
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Billing Date</label>
            <NumericInput
              value={billingDate}
              onChange={setBillingDate}
              placeholder="1"
              min={1}
              max={28}
              className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Due Date</label>
            <NumericInput
              value={dueDate}
              onChange={setDueDate}
              placeholder="20"
              min={1}
              max={28}
              className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about this card..."
            rows={2}
            maxLength={500}
            className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
          />
        </div>

        {monthlyInterest > 0 && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
            <p className="text-sm text-warning">
              Monthly interest on this card: <strong>{formatINR(monthlyInterest)}</strong>
              {" "}({formatINR(monthlyInterest * 12)}/year)
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {submitting ? "Adding..." : "Add Credit Card"}
        </button>
      </div>
    </div>
  );
}
