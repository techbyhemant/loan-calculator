import React, { useState } from "react";
import { AmortizationTable } from "../AmortizationTable";
import { CompactTabsToggle } from "@/components/ui/CompactTabsToggle";
import { useLoanCalculator } from "../context/LoanCalculatorContext";
import { PartPaymentModal } from "./PartPaymentModal";
import { EmiIncreaseModal } from "./EmiIncreaseModal";

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
    startDate,
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

  // Modal state
  const [ppModalOpen, setPpModalOpen] = useState(false);
  const [emiModalOpen, setEmiModalOpen] = useState(false);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const [selectedMonthLabel, setSelectedMonthLabel] = useState("");
  const [selectedBalance, setSelectedBalance] = useState(0);

  const openPartPaymentModal = React.useCallback(
    (monthIndex: number, monthLabel: string, balance: number) => {
      setSelectedMonthIndex(monthIndex);
      setSelectedMonthLabel(monthLabel);
      setSelectedBalance(balance);
      setPpModalOpen(true);
    },
    []
  );

  const openEmiIncreaseModal = React.useCallback(
    (monthIndex: number, monthLabel: string) => {
      setSelectedMonthIndex(monthIndex);
      setSelectedMonthLabel(monthLabel);
      setEmiModalOpen(true);
    },
    []
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
              <div>
                <CompactTabsToggle
                  label="Reduce"
                  value={reduceMode}
                  onValueChange={(v) => setReduceMode(v as "emi" | "tenure")}
                  options={[
                    { value: "emi", label: "EMI" },
                    { value: "tenure", label: "Tenure" },
                  ]}
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  {reduceMode === 'tenure'
                    ? 'Reducing tenure saves more interest. Recommended for most borrowers.'
                    : 'Reducing EMI lowers your monthly outflow. Better if cash flow is tight.'}
                </p>
              </div>
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
          partPayments={partPayments}
          setPartPayments={setPartPayments}
          emiIncreases={emiIncreases}
          emiStartDate={startDate}
          openPartPaymentModal={openPartPaymentModal}
          openEmiIncreaseModal={openEmiIncreaseModal}
        />
      </div>

      <PartPaymentModal
        open={ppModalOpen}
        onOpenChange={setPpModalOpen}
        monthIndex={selectedMonthIndex}
        monthLabel={selectedMonthLabel}
        currentBalance={selectedBalance}
      />
      <EmiIncreaseModal
        open={emiModalOpen}
        onOpenChange={setEmiModalOpen}
        monthIndex={selectedMonthIndex}
        monthLabel={selectedMonthLabel}
      />
    </section>
  );
}
