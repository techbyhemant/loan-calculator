import React from "react";
import { AmortizationTable } from "../AmortizationTable";
import { CompactTabsToggle } from "@/components/ui/CompactTabsToggle";
import { useLoanCalculator } from "../context/LoanCalculatorContext";

export function AmortizationSection() {
  const {
    scheduleWithCalendar,
    yearGrouping,
    setYearGrouping,
    expanded,
    setExpanded,
    formatINR,
    loanPaidPct,
    reduceMode,
    setReduceMode,
    partPayments,
    setPartPayments,
    emiIncreases,
    setEmiIncreases,
  } = useLoanCalculator();

  // Mobile detection for responsive input layout
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderPartPaymentCell = React.useCallback(
    (
      row: { idx: number },
      reduceMode: "emi" | "tenure",
      inputType?: "partPayment" | "emiIncrease"
    ) => {
      // For mobile nested rows with specific input types
      if (isMobile && inputType) {
        if (inputType === "partPayment") {
          return (
            <input
              type="number"
              value={partPayments[row.idx]?.toString() ?? ""}
              onChange={(e) => {
                const num = Number(e.target.value);
                if (!isNaN(num) && num >= 0) {
                  setPartPayments({
                    ...partPayments,
                    [row.idx]: num,
                  });
                }
              }}
              className="w-full text-sm py-1.5 px-2 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="Amount (₹)"
              min="0"
              step="1000"
            />
          );
        } else if (inputType === "emiIncrease") {
          return (
            <input
              type="number"
              value={emiIncreases[row.idx]?.value?.toString() ?? ""}
              onChange={(e) => {
                const num = Number(e.target.value);
                if (!isNaN(num) && num >= 0) {
                  setEmiIncreases({
                    ...emiIncreases,
                    [row.idx]: { type: "value", value: num },
                  });
                }
              }}
              className="w-full text-sm py-1.5 px-2 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="Increase (₹)"
              min="0"
              step="1000"
            />
          );
        }
        return null;
      }

      // For mobile nested rows without specific input type (legacy support)
      if (isMobile) {
        return (
          <div className="flex gap-2">
            <input
              type="number"
              value={partPayments[row.idx]?.toString() ?? ""}
              onChange={(e) => {
                const num = Number(e.target.value);
                if (!isNaN(num) && num >= 0) {
                  setPartPayments({
                    ...partPayments,
                    [row.idx]: num,
                  });
                }
              }}
              className="flex-1 text-sm py-1.5 px-2 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="Amount (₹)"
              min="0"
              step="1000"
            />
            {reduceMode === "tenure" && (
              <input
                type="number"
                value={emiIncreases[row.idx]?.value?.toString() ?? ""}
                onChange={(e) => {
                  const num = Number(e.target.value);
                  if (!isNaN(num) && num >= 0) {
                    setEmiIncreases({
                      ...emiIncreases,
                      [row.idx]: { type: "value", value: num },
                    });
                  }
                }}
                className="flex-1 text-sm py-1.5 px-2 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                placeholder="Increase (₹)"
                min="0"
                step="1000"
              />
            )}
          </div>
        );
      }

      // Desktop layout remains unchanged
      return (
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={partPayments[row.idx]?.toString() ?? ""}
            onChange={(e) => {
              const num = Number(e.target.value);
              if (!isNaN(num) && num >= 0) {
                setPartPayments({
                  ...partPayments,
                  [row.idx]: num,
                });
              }
            }}
            className="w-20 text-xs py-1 px-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            placeholder="0"
            min="0"
            step="1000"
          />
          {reduceMode === "tenure" && (
            <input
              type="number"
              value={emiIncreases[row.idx]?.value?.toString() ?? ""}
              onChange={(e) => {
                const num = Number(e.target.value);
                if (!isNaN(num) && num >= 0) {
                  setEmiIncreases({
                    ...emiIncreases,
                    [row.idx]: { type: "value", value: num },
                  });
                }
              }}
              className="w-20 text-xs py-1 px-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="0"
              min="0"
              step="1000"
            />
          )}
        </div>
      );
    },
    [partPayments, setPartPayments, emiIncreases, setEmiIncreases, isMobile]
  );

  return (
    <section className="bg-white rounded-xl shadow-sm p-0 mt-4 sm:p-4 sm:mt-6">
      <div className="w-full">
        <div
          className={`py-2 bg-white border-b border-zinc-200 ${
            isMobile ? "px-4" : ""
          }`}
        >
          <div
            className={`flex ${
              isMobile ? "flex-col gap-2" : "items-center justify-between"
            } flex-wrap gap-2`}
          >
            <h2
              className={`${
                isMobile ? "text-base" : "text-base sm:text-lg"
              } font-semibold text-[#1E2A38]`}
            >
              Amortization Table
            </h2>
            {/* Compact filter toggles in header */}
            <div
              className={`flex ${
                isMobile ? "justify-center" : "items-center"
              } gap-2 flex-wrap`}
            >
              <CompactTabsToggle
                label="Reduce"
                value={reduceMode}
                onValueChange={(v) => setReduceMode(v as "emi" | "tenure")}
                options={[
                  { value: "emi", label: "EMI" },
                  { value: "tenure", label: "Tenure" },
                ]}
              />
              <CompactTabsToggle
                label="Group by"
                value={yearGrouping}
                onValueChange={(v) =>
                  setYearGrouping(v as "calendar" | "financial")
                }
                options={[
                  {
                    value: "calendar",
                    label: isMobile ? "Calendar" : "Calendar Year",
                  },
                  {
                    value: "financial",
                    label: isMobile ? "Financial" : "Financial Year",
                  },
                ]}
                className={isMobile ? "" : "ml-2"}
              />
            </div>
          </div>
        </div>
        <AmortizationTable
          scheduleWithCalendar={scheduleWithCalendar}
          yearGrouping={yearGrouping}
          expanded={expanded}
          onExpandedChange={(updaterOrValue) => {
            if (typeof updaterOrValue === "function") {
              setExpanded(updaterOrValue(expanded) as Record<string, boolean>);
            } else {
              setExpanded(updaterOrValue as Record<string, boolean>);
            }
          }}
          formatINR={formatINR}
          loanPaidPct={loanPaidPct}
          reduceMode={reduceMode}
          renderPartPaymentCell={renderPartPaymentCell}
        />
      </div>
    </section>
  );
}
