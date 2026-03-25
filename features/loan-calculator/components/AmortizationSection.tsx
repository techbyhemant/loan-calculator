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

  // Use refs so the render callback stays stable across state changes
  const partPaymentsRef = React.useRef(partPayments);
  partPaymentsRef.current = partPayments;
  const emiIncreasesRef = React.useRef(emiIncreases);
  emiIncreasesRef.current = emiIncreases;
  const isMobileRef = React.useRef(isMobile);
  isMobileRef.current = isMobile;

  const renderPartPaymentCell = React.useCallback(
    (
      row: { idx: number },
      reduceMode: "emi" | "tenure",
      inputType?: "partPayment" | "emiIncrease"
    ) => {
      const pp = partPaymentsRef.current;
      const ei = emiIncreasesRef.current;
      const mobile = isMobileRef.current;

      // For mobile nested rows with specific input types
      if (mobile && inputType) {
        if (inputType === "partPayment") {
          return (
            <input
              key={`pp-${row.idx}`}
              type="number"
              defaultValue={pp[row.idx]?.toString() ?? ""}
              onBlur={(e) => {
                const num = Number(e.target.value);
                if (!isNaN(num) && num >= 0) {
                  setPartPayments({
                    ...partPaymentsRef.current,
                    [row.idx]: num,
                  });
                }
              }}
              onChange={(e) => {
                const num = Number(e.target.value);
                if (!isNaN(num) && num >= 0) {
                  setPartPayments({
                    ...partPaymentsRef.current,
                    [row.idx]: num,
                  });
                }
              }}
              className="w-full text-sm py-1.5 px-2 border border-input rounded focus:ring-1 focus:ring-ring focus:border-ring outline-none"
              placeholder="Amount (₹)"
              min="0"
              step="1000"
            />
          );
        } else if (inputType === "emiIncrease") {
          return (
            <input
              key={`ei-${row.idx}`}
              type="number"
              defaultValue={ei[row.idx]?.value?.toString() ?? ""}
              onBlur={(e) => {
                const num = Number(e.target.value);
                if (!isNaN(num) && num >= 0) {
                  setEmiIncreases({
                    ...emiIncreasesRef.current,
                    [row.idx]: { type: "value", value: num },
                  });
                }
              }}
              onChange={(e) => {
                const num = Number(e.target.value);
                if (!isNaN(num) && num >= 0) {
                  setEmiIncreases({
                    ...emiIncreasesRef.current,
                    [row.idx]: { type: "value", value: num },
                  });
                }
              }}
              className="w-full text-sm py-1.5 px-2 border border-input rounded focus:ring-1 focus:ring-ring focus:border-ring outline-none"
              placeholder="Increase (₹)"
              min="0"
              step="1000"
            />
          );
        }
        return null;
      }

      // For mobile nested rows without specific input type (legacy support)
      if (mobile) {
        return (
          <div className="flex gap-2">
            <input
              key={`pp-${row.idx}`}
              type="number"
              defaultValue={pp[row.idx]?.toString() ?? ""}
              onBlur={(e) => {
                const num = Number(e.target.value);
                if (!isNaN(num) && num >= 0) {
                  setPartPayments({
                    ...partPaymentsRef.current,
                    [row.idx]: num,
                  });
                }
              }}
              onChange={(e) => {
                const num = Number(e.target.value);
                if (!isNaN(num) && num >= 0) {
                  setPartPayments({
                    ...partPaymentsRef.current,
                    [row.idx]: num,
                  });
                }
              }}
              className="flex-1 text-sm py-1.5 px-2 border border-input rounded focus:ring-1 focus:ring-ring focus:border-ring outline-none"
              placeholder="Amount (₹)"
              min="0"
              step="1000"
            />
            {reduceMode === "tenure" && (
              <input
                key={`ei-${row.idx}`}
                type="number"
                defaultValue={ei[row.idx]?.value?.toString() ?? ""}
                onBlur={(e) => {
                  const num = Number(e.target.value);
                  if (!isNaN(num) && num >= 0) {
                    setEmiIncreases({
                      ...emiIncreasesRef.current,
                      [row.idx]: { type: "value", value: num },
                    });
                  }
                }}
                onChange={(e) => {
                  const num = Number(e.target.value);
                  if (!isNaN(num) && num >= 0) {
                    setEmiIncreases({
                      ...emiIncreasesRef.current,
                      [row.idx]: { type: "value", value: num },
                    });
                  }
                }}
                className="flex-1 text-sm py-1.5 px-2 border border-input rounded focus:ring-1 focus:ring-ring focus:border-ring outline-none"
                placeholder="Increase (₹)"
                min="0"
                step="1000"
              />
            )}
          </div>
        );
      }

      // Desktop layout
      return (
        <div className="flex gap-2 items-center">
          <input
            key={`pp-${row.idx}`}
            type="number"
            defaultValue={pp[row.idx]?.toString() ?? ""}
            onBlur={(e) => {
              const num = Number(e.target.value);
              if (!isNaN(num) && num >= 0) {
                setPartPayments({
                  ...partPaymentsRef.current,
                  [row.idx]: num,
                });
              }
            }}
            onChange={(e) => {
              const num = Number(e.target.value);
              if (!isNaN(num) && num >= 0) {
                setPartPayments({
                  ...partPaymentsRef.current,
                  [row.idx]: num,
                });
              }
            }}
            className="w-20 text-xs py-1 px-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-ring outline-none"
            placeholder="0"
            min="0"
            step="1000"
          />
          {reduceMode === "tenure" && (
            <input
              key={`ei-${row.idx}`}
              type="number"
              defaultValue={ei[row.idx]?.value?.toString() ?? ""}
              onBlur={(e) => {
                const num = Number(e.target.value);
                if (!isNaN(num) && num >= 0) {
                  setEmiIncreases({
                    ...emiIncreasesRef.current,
                    [row.idx]: { type: "value", value: num },
                  });
                }
              }}
              onChange={(e) => {
                const num = Number(e.target.value);
                if (!isNaN(num) && num >= 0) {
                  setEmiIncreases({
                    ...emiIncreasesRef.current,
                    [row.idx]: { type: "value", value: num },
                  });
                }
              }}
              className="w-20 text-xs py-1 px-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-ring outline-none"
              placeholder="0"
              min="0"
              step="1000"
            />
          )}
        </div>
      );
    },
    [setPartPayments, setEmiIncreases]
  );

  return (
    <section className="bg-card rounded-xl shadow-sm p-0 mt-4 sm:p-4 sm:mt-6">
      <div className="w-full">
        <div
          className={`py-2 bg-card border-b border-border ${
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
              } font-semibold text-foreground`}
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
