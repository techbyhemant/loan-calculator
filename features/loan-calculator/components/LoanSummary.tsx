import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useLoanCalculator } from "../context/LoanCalculatorContext";
import { calculateLoan } from "@/lib/utils";

const PaymentBreakdownPie = dynamic(
  () =>
    import("../charts/PaymentBreakdownPie").then((m) => ({
      default: m.PaymentBreakdownPie,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="w-48 h-48 mx-auto bg-muted rounded-full animate-pulse" />
    ),
  }
);

export function LoanSummary() {
  const {
    amount,
    rate,
    result,
    formatINR,
    tenure,
    tenureUnit,
    startDate,
    partPayments,
    emiIncreases,
  } = useLoanCalculator();

  // Detect whether the user has added any simulations
  const hasSimulations =
    Object.keys(partPayments || {}).some(
      (k) => partPayments[Number(k)] > 0
    ) || Object.keys(emiIncreases || {}).length > 0;

  // Compute baseline (no simulations) to measure savings
  const baseline = useMemo(() => {
    if (!hasSimulations) return null;
    const actualTenure = tenureUnit === "years" ? tenure : tenure / 12;
    return calculateLoan({ amount, rate, tenure: actualTenure });
  }, [hasSimulations, amount, rate, tenure, tenureUnit]);

  const simulationInterestSaved = baseline
    ? Math.max(0, baseline.totalInterest - result.totalInterest)
    : 0;

  // Debt-free date computation
  const tenureMonths = tenureUnit === "years" ? tenure * 12 : tenure;

  // Original debt-free date (without simulations)
  const originalDebtFreeDate = useMemo(() => {
    const start = startDate ? new Date(startDate + "-01") : new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + tenureMonths);
    return end;
  }, [startDate, tenureMonths]);

  // Actual debt-free date (with simulations — based on schedule length)
  const actualDebtFreeDate = useMemo(() => {
    const start = startDate ? new Date(startDate + "-01") : new Date();
    const scheduleLength = result.schedule.length;
    const end = new Date(start);
    end.setMonth(end.getMonth() + scheduleLength);
    return end;
  }, [startDate, result.schedule.length]);

  const formatShortDate = (d: Date) =>
    d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });

  const monthsSaved = hasSimulations
    ? Math.max(0, tenureMonths - result.schedule.length)
    : 0;

  const actualMonths = result.schedule.length;
  const years = Math.floor(actualMonths / 12);
  const months = actualMonths % 12;
  const tenureLabel =
    months === 0
      ? `${years} yrs remaining`
      : `${years} yrs ${months} mo remaining`;

  return (
    <div className="flex flex-col gap-4">
      {/* Pie Chart at top */}
      <div className="bg-card rounded-xl shadow-sm p-4 flex flex-col items-center">
        <h2 className="text-base sm:text-lg font-semibold text-foreground mb-2">
          Your loan summary
        </h2>
        <div className="w-full h-full flex items-center justify-center">
          <PaymentBreakdownPie
            principal={amount}
            interest={result.totalInterest}
          />
        </div>
      </div>

      {/* 4 Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Monthly EMI */}
        <div className="bg-card rounded-xl shadow-sm p-4 flex flex-col items-center">
          <div className="text-xs text-muted-foreground mb-1">Loan EMI</div>
          <div className="text-base sm:text-lg font-semibold text-foreground">
            {formatINR(result.emi)}
          </div>
        </div>

        {/* Card 2: Interest remaining */}
        <div className="bg-card rounded-xl shadow-sm p-4 flex flex-col items-center">
          <div className="text-xs text-muted-foreground mb-1">
            Total Interest
          </div>
          <div className="text-base sm:text-lg font-semibold text-negative">
            {formatINR(result.totalInterest)}
          </div>
          {hasSimulations && simulationInterestSaved > 0 && (
            <div className="text-[10px] text-positive font-medium mt-0.5">
              {formatINR(simulationInterestSaved)} saved
            </div>
          )}
        </div>

        {/* Card 3: Debt-free date */}
        <div className="bg-card rounded-xl shadow-sm p-4 flex flex-col items-center border-l-2 border-positive">
          <div className="text-xs text-muted-foreground mb-1">
            Debt-Free Date
          </div>
          <div className="text-base sm:text-lg font-semibold text-positive">
            {formatShortDate(actualDebtFreeDate)}
          </div>
          {hasSimulations && monthsSaved > 0 ? (
            <div className="text-[10px] text-muted-foreground mt-0.5">
              <span className="line-through">
                {formatShortDate(originalDebtFreeDate)}
              </span>
              <span className="text-positive font-medium ml-1.5">
                {monthsSaved} mo earlier
              </span>
            </div>
          ) : (
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {tenureLabel}
            </div>
          )}
        </div>

        {/* Card 4: Simulation impact or CTA */}
        {hasSimulations && (simulationInterestSaved > 0 || monthsSaved > 0) ? (
          <div className="bg-positive/5 border border-positive/20 rounded-xl shadow-sm p-4 flex flex-col items-center">
            <div className="text-xs text-positive font-medium mb-1">
              Saved by your plan
            </div>
            <div className="text-base sm:text-lg font-semibold text-positive">
              {monthsSaved > 0
                ? `${monthsSaved} mo`
                : formatINR(simulationInterestSaved)}
            </div>
            {monthsSaved > 0 && simulationInterestSaved > 0 && (
              <div className="text-[10px] text-positive/80 mt-0.5">
                + {formatINR(simulationInterestSaved)} interest
              </div>
            )}
          </div>
        ) : (
          <div className="bg-card rounded-xl shadow-sm p-4 flex flex-col items-center justify-center">
            <div className="text-xs text-muted-foreground mb-1">
              Total Payment
            </div>
            <div className="text-base sm:text-lg font-semibold text-foreground">
              {formatINR(result.totalPayment)}
            </div>
            {!hasSimulations && (
              <button
                onClick={() => {
                  document
                    .getElementById("amortization-table")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-[10px] text-primary underline underline-offset-2 hover:no-underline mt-0.5"
              >
                Add a simulation
              </button>
            )}
          </div>
        )}
      </div>

      {/* Simulation impact banner */}
      {hasSimulations && simulationInterestSaved > 0 && (
        <div className="p-3.5 rounded-lg bg-positive/10 border border-positive/20 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-positive flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm text-foreground">
            Your simulations save{" "}
            <span className="text-positive font-medium">
              {formatINR(simulationInterestSaved)} in interest
            </span>
            {monthsSaved > 0 && (
              <>
                {" "}and make you debt-free{" "}
                <span className="text-positive font-medium">
                  {monthsSaved} months earlier
                </span>
              </>
            )}
          </p>
        </div>
      )}

      {/* Insight line — shown when total interest > 5L and no simulations */}
      {!hasSimulations && result.totalInterest > 500000 && (
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-sm flex items-start gap-2">
          <span className="text-warning mt-0.5 flex-shrink-0">&#x26A0;</span>
          <div>
            <span className="text-foreground font-medium">
              You&apos;ll pay {formatINR(result.totalInterest)} in interest.
            </span>{" "}
            <span className="text-muted-foreground">
              A &#x20B9;5L part payment in year 3 could save{" "}
              <span className="text-positive font-medium">&#x20B9;12L+</span>{" "}
              and cut{" "}
              <span className="text-positive font-medium">2+ years</span> off
              your tenure.
            </span>{" "}
            <button
              onClick={() => {
                document
                  .getElementById("amortization-table")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-primary underline underline-offset-2 hover:no-underline"
            >
              Simulate it &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
