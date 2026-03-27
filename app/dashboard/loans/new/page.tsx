"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import type { RateType } from "@/types";
import type { LoanType } from "@/lib/calculations/loanTypeConfig";
import {
  LOAN_TYPE_DISPLAY,
  LOAN_TYPE_FINANCIALS,
  isRBIZeroPenaltyApplicable,
} from "@/lib/calculations/loanTypeConfig";
import { LoanTypeIcon } from "@/components/ui/LoanTypeIcon";

import { calculateEMI } from "@/lib/calculations/loanCalcs";
import { formatINR } from "@/lib/utils/formatters";
import { trpcReact } from "@/lib/trpc/hooks";

import NumericInput from "@/components/ui/NumericInput";

const LOAN_TYPES: { value: LoanType; label: string; icon: string }[] = (
  Object.keys(LOAN_TYPE_DISPLAY) as LoanType[]
).map((type) => ({
  value: type,
  label: LOAN_TYPE_DISPLAY[type].label,
  icon: LOAN_TYPE_DISPLAY[type].icon,
}));

export default function NewLoanPage() {
  const router = useRouter();
  const utils = trpcReact.useUtils();
  const createLoan = trpcReact.loans.create.useMutation({
    onSuccess: () => {
      utils.loans.getAll.invalidate();
      router.push("/dashboard");
    },
    onError: (err) => {
      setError(err.message);
      setSubmitting(false);
    },
  });

  const [loanType, setLoanType] = useState<LoanType>("home");
  const [name, setName] = useState("");
  const [lender, setLender] = useState("");
  const [originalAmount, setOriginalAmount] = useState<number | "">(5000000);
  const [outstanding, setOutstanding] = useState<number | "">(5000000);
  const [rate, setRate] = useState<number | "">(8.5);
  const [emi, setEmi] = useState<number | "">("" as unknown as number | "");
  const [emiDate, setEmiDate] = useState<number | "">(5);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [tenureYears, setTenureYears] = useState<number | "">(20);
  const [tenureMonths, setTenureMonths] = useState<number | "">(0);
  const [rateType, setRateType] = useState<RateType>("floating");
  const [penalty, setPenalty] = useState<number | "">(0);
  const [moratoriumEndDate, setMoratoriumEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTypeChange = (type: LoanType) => {
    setLoanType(type);
    const fin = LOAN_TYPE_FINANCIALS[type];
    setRate(fin.defaultRatePA * 100);
    setTenureYears(Math.floor(fin.defaultTenureMonths / 12));
    setTenureMonths(fin.defaultTenureMonths % 12);
    const defaultRateType = (type === "home" || type === "education" || type === "lap") ? "floating" as RateType : "fixed" as RateType;
    setRateType(defaultRateType);
    if (defaultRateType === "floating" && isRBIZeroPenaltyApplicable(type, "floating")) setPenalty(0);
    setOriginalAmount(fin.defaultAmountINR);
    setOutstanding(fin.defaultAmountINR);
  };

  const totalTenureMonths =
    ((tenureYears as number) || 0) * 12 + ((tenureMonths as number) || 0);

  const calculatedEMI =
    originalAmount && rate && totalTenureMonths > 0
      ? calculateEMI(
          originalAmount as number,
          rate as number,
          totalTenureMonths,
        )
      : 0;

  const effectiveEMI = emi || Math.round(calculatedEMI);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Loan name is required");
      return;
    }
    if (!originalAmount || !outstanding || !rate || totalTenureMonths <= 0) {
      setError("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    setError(null);

    createLoan.mutate({
      name: name.trim(),
      type: loanType,
      lender: lender.trim(),
      originalAmount: originalAmount as number,
      currentOutstanding: outstanding as number,
      interestRate: rate as number,
      emiAmount: effectiveEMI,
      emiDate: (emiDate as number) || 1,
      startDate,
      tenureMonths: totalTenureMonths,
      rateType,
      prepaymentPenalty: isRBIZeroPenaltyApplicable(loanType, rateType) ? 0 : ((penalty as number) || 0),
      notes: "",
      ...(loanType === "education" && moratoriumEndDate ? { moratoriumEndDate } : {}),
    });
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none";

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-muted-foreground transition-colors"
        >
          &larr;
        </Link>
        <h1 className="text-xl font-semibold text-foreground">Add New Loan</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-xl shadow-sm p-4 sm:p-6 space-y-5"
      >
        {/* Error banner */}
        {error && (
          <div className="text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
            {error}
            {error.includes("Upgrade") && (
              <Link
                href="/pricing"
                className="ml-2 underline font-semibold text-primary"
              >
                Upgrade to Pro
              </Link>
            )}
          </div>
        )}

        {/* Loan Type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Loan Type
          </label>
          <div className="flex flex-wrap gap-2">
            {LOAN_TYPES.map((lt) => (
              <button
                key={lt.value}
                type="button"
                onClick={() => handleTypeChange(lt.value)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  loanType === lt.value
                    ? "bg-primary text-white border-primary"
                    : "bg-card text-foreground border-border hover:border-border"
                }`}
              >
                <LoanTypeIcon icon={lt.icon} size="sm" /> {lt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Name + Lender */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Loan Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. SBI Home Loan"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Lender
            </label>
            <input
              type="text"
              value={lender}
              onChange={(e) => setLender(e.target.value)}
              placeholder="e.g. State Bank of India"
              className={inputClass}
            />
          </div>
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Original Loan Amount (₹) *
            </label>
            <NumericInput
              value={originalAmount}
              onChange={(v) => {
                setOriginalAmount(v);
                if (!outstanding || outstanding === originalAmount)
                  setOutstanding(v);
              }}
              placeholder="50,00,000"
              min={0}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Current Outstanding (₹) *
            </label>
            <NumericInput
              value={outstanding}
              onChange={setOutstanding}
              placeholder="45,00,000"
              min={0}
              className={inputClass}
            />
          </div>
        </div>

        {/* Rate + EMI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Annual Interest Rate (%) *
            </label>
            <NumericInput
              value={rate}
              onChange={setRate}
              placeholder="8.5"
              min={0}
              max={50}
              step={0.1}
              className={inputClass}
            />
            {(loanType === "home" || loanType === "lap") && rateType === "floating" && (
              <p className="text-xs text-positive mt-1">RBI mandates zero prepayment penalty on floating rate</p>
            )}
            {(loanType === "personal" || loanType === "car") && (
              <p className="text-xs text-warning mt-1">Note: prepayment penalty typically 2-5%</p>
            )}
            {loanType === "education" && (
              <p className="text-xs text-primary mt-1">Section 80E: entire interest deductible (no cap)</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Monthly EMI (₹)
            </label>
            <NumericInput
              value={emi}
              onChange={setEmi}
              placeholder={
                calculatedEMI > 0
                  ? `Auto: ${formatINR(calculatedEMI)}`
                  : "Auto-calculated"
              }
              min={0}
              className={inputClass}
            />
            {calculatedEMI > 0 && !emi && (
              <p className="text-xs text-muted-foreground mt-1">
                Auto-calculated: ₹
                {formatINR(calculatedEMI).replace("₹", "")}
              </p>
            )}
          </div>
        </div>

        {/* EMI Date + Start Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              EMI Due Date (day of month)
            </label>
            <NumericInput
              value={emiDate}
              onChange={setEmiDate}
              placeholder="5"
              min={1}
              max={28}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Loan Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Moratorium End Date — Education loans only */}
        {loanType === "education" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Moratorium End Date (when EMIs start)
            </label>
            <input
              type="date"
              value={moratoriumEndDate}
              onChange={(e) => setMoratoriumEndDate(e.target.value)}
              className={inputClass}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your moratorium period — interest accrues but no EMI due until this date
            </p>
          </div>
        )}

        {/* Tenure */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Tenure (Years)
            </label>
            <NumericInput
              value={tenureYears}
              onChange={setTenureYears}
              placeholder="20"
              min={0}
              max={30}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              + Additional Months
            </label>
            <NumericInput
              value={tenureMonths}
              onChange={setTenureMonths}
              placeholder="0"
              min={0}
              max={11}
              className={inputClass}
            />
          </div>
        </div>

        {/* Rate Type + Penalty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Rate Type
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setRateType("floating");
                  setPenalty(0);
                }}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  rateType === "floating"
                    ? "bg-primary text-white border-primary"
                    : "bg-card text-foreground border-border hover:border-border"
                }`}
              >
                Floating
              </button>
              <button
                type="button"
                onClick={() => setRateType("fixed")}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  rateType === "fixed"
                    ? "bg-primary text-white border-primary"
                    : "bg-card text-foreground border-border hover:border-border"
                }`}
              >
                Fixed
              </button>
            </div>
          </div>
          {rateType === "fixed" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Prepayment Penalty (%)
              </label>
              <NumericInput
                value={penalty}
                onChange={setPenalty}
                placeholder="0"
                min={0}
                max={10}
                step={0.1}
                className={inputClass}
              />
            </div>
          )}
          {rateType === "floating" && (
            <div className="flex items-end">
              <p className={`text-xs rounded-lg p-2.5 ${
                isRBIZeroPenaltyApplicable(loanType, "floating")
                  ? "text-positive bg-positive/10 border border-positive/20"
                  : "text-muted-foreground bg-background border border-border"
              }`}>
                {isRBIZeroPenaltyApplicable(loanType, "floating")
                  ? "RBI mandated: Zero prepayment penalty on this floating rate loan"
                  : "Floating rate selected. Check your agreement for prepayment terms."}
              </p>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary hover:bg-primary/90 text-white rounded-lg px-6 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add Loan"}
          </button>
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
