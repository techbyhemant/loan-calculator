import { useState } from "react";
import { calculateLoan } from "@/lib/utils";
import { PaymentBreakdownPie } from "./charts/PaymentBreakdownPie";
import { YearlyBreakdownBar } from "./charts/YearlyBreakdownBar";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { FaFilePdf, FaFileExcel, FaShareAlt } from "react-icons/fa";
import { FiInfo } from "react-icons/fi";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import React from "react";
import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";

type TenureUnit = "years" | "months";
const today = new Date();
const defaultStart = `${today.getFullYear()}-${String(
  today.getMonth() + 1
).padStart(2, "0")}`;

// Extend AmortizationRow type to include calendarYear, calendarMonth, calendarLabel
export interface AmortizationRow {
  year: number;
  month: number;
  principal: number;
  interest: number;
  total: number;
  balance: number;
  calendarYear?: number;
  calendarMonth?: string;
  calendarLabel?: string;
}

export default function LoanCalculator() {
  // Part-payments state: { [scheduleIndex]: amount }
  const [partPayments, setPartPayments] = useState<Record<number, number>>({});

  // EMI increase per month: { [idx]: { type: 'percent' | 'value', value: number } }
  const [emiIncreases, setEmiIncreases] = useState<
    Record<number, { type: "percent" | "value"; value: number }>
  >({});

  // Add state for reduce mode toggle
  const [reduceMode, setReduceMode] = useState<"emi" | "tenure">("emi");

  // State for year grouping toggle
  const [yearGrouping, setYearGrouping] = useState<"calendar" | "financial">(
    "calendar"
  );

  // Expanded state for year/financial year groups
  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>(
    {}
  );

  // State for form fields
  const [amount, setAmount] = useState(5000000);
  const [amountInput, setAmountInput] = useState(
    amount.toLocaleString("en-IN")
  );
  const [rate, setRate] = useState(9);
  const [tenure, setTenure] = useState(20); // always store as years
  const [tenureUnit, setTenureUnit] = useState<TenureUnit>("years");
  const [startDate, setStartDate] = useState<string>(defaultStart);

  // Handle amount input change
  function handleAmountInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    let val = e.target.value.replace(/[^\d]/g, "");
    // Remove leading zeros
    val = val.replace(/^0+/, "");
    // Format as you type
    const formatted = val ? Number(val).toLocaleString("en-IN") : "";
    setAmountInput(formatted);
    // Remove commas for numeric value
    const numeric = Number(val);
    if (!isNaN(numeric) && numeric <= 20000000) {
      setAmount(numeric);
    }
  }
  function handleAmountInputBlur() {
    setAmountInput(amount.toLocaleString("en-IN"));
  }

  // Handle rate input
  function handleRateInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/[^\d.]/g, "");
    let num = Number(val);
    if (num > 20) num = 20;
    if (num < 0) num = 0;
    setRate(num);
  }

  // Tenure toggle logic
  function handleTenureUnitChange(unit: TenureUnit) {
    if (unit === tenureUnit) return;
    if (unit === "months") {
      setTenure(tenure * 12);
      setTenureUnit("months");
    } else {
      setTenure(Math.max(1, Math.round(tenure / 12)));
      setTenureUnit("years");
    }
  }
  function handleTenureInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/[^\d]/g, "");
    let num = Number(val);
    if (tenureUnit === "years") {
      if (num > 30) num = 30;
      if (num < 1) num = 1;
    } else {
      if (num > 360) num = 360;
      if (num < 12) num = 12;
    }
    setTenure(num);
  }
  function handleTenureSlider(val: number) {
    setTenure(val);
  }

  // Transform emiIncreases for calculation: { [idx]: percent or value, with type info }
  const result = calculateLoan({
    amount,
    rate,
    tenure: tenureUnit === "years" ? tenure : tenure / 12,
    partPayments,
    partPaymentMode: reduceMode,
    emiIncreases,
  });

  // In scheduleWithCalendar definition, add idx property to each row
  const scheduleWithCalendar = useMemo(
    () =>
      result.schedule.map((row, i) => {
        const [startYear, startMonth] = startDate.split("-").map(Number);
        const date = new Date(startYear, startMonth - 1 + i);
        return {
          ...row,
          calendarYear: date.getFullYear(),
          calendarMonth: date.toLocaleString("en-IN", { month: "short" }),
          calendarLabel: date.toLocaleString("en-IN", {
            month: "short",
            year: "numeric",
          }),
          idx: i,
        };
      }),
    [result.schedule, startDate]
  );

  // Helper to calculate yearly summary
  function getYearlySummary(rows: typeof scheduleWithCalendar) {
    let totalPrincipal = 0,
      totalInterest = 0,
      totalPayment = 0,
      emiSum = 0;
    const months = rows.length;
    const startBalance = rows[0]?.balance + rows[0]?.principal || 0;
    const endBalance = rows[months - 1]?.balance || 0;
    rows.forEach((r) => {
      totalPrincipal += r.principal;
      totalInterest += r.interest;
      totalPayment += r.total;
      emiSum += r.total;
    });
    return {
      totalPrincipal,
      totalInterest,
      totalPayment,
      avgEmi: emiSum / months,
      pctReduced:
        startBalance > 0
          ? ((startBalance - endBalance) / startBalance) * 100
          : 0,
    };
  }

  function formatINR(value: number) {
    return value.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });
  }

  // Helper for loan paid %
  function loanPaidPct(balance: number) {
    return ((1 - balance / amount) * 100).toFixed(2);
  }

  // Excel export handler
  function handleExportExcel() {
    const table = [
      [
        "Year",
        "Month",
        "Principal (A)",
        "Interest (B)",
        "Total Payment (A+B)",
        "Balance",
        "Loan Paid %",
      ],
      ...scheduleWithCalendar.map((row, idx) => [
        row.calendarYear,
        row.calendarMonth,
        Math.round(row.principal),
        Math.round(row.interest),
        Math.round(row.total),
        Math.round(row.balance),
        loanPaidPct(row.balance) + "%",
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(table);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Amortization");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      "amortization.xlsx"
    );
  }

  // PDF export handler
  function handleExportPDF() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Loan Amortization Schedule", 14, 16);
    autoTable(doc, {
      startY: 24,
      head: [
        [
          "Year",
          "Month",
          "Principal (A)",
          "Interest (B)",
          "Total Payment (A+B)",
          "Balance",
          "Loan Paid %",
        ],
      ],
      body: scheduleWithCalendar.map((row) => [
        row.calendarYear,
        row.calendarMonth,
        Math.round(row.principal),
        Math.round(row.interest),
        Math.round(row.total),
        Math.round(row.balance),
        loanPaidPct(row.balance) + "%",
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [34, 197, 94] }, // Tailwind green-500
    });
    doc.save("amortization.pdf");
  }

  return (
    <main className="bg-[#F9FAFB] min-h-screen font-inter">
      <div className="max-w-6xl mx-auto py-6 px-2 md:px-4">
        {/* Top grid: Inputs (2/3) and Pie+Summary (1/3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Modern Loan Input Card: col-span-2 */}
          <section className="md:col-span-2 flex justify-center">
            <div className="w-full max-w-xl bg-white rounded-xl shadow-sm px-6 py-5 flex flex-col gap-4 mx-auto">
              <h1 className="text-lg font-semibold text-[#1E2A38] mb-2 text-center">
                Loan Details
              </h1>
              {/* Home Loan Amount */}
              <div className="flex flex-col gap-2">
                <label
                  className="text-sm font-medium text-[#374151]"
                  htmlFor="loan-amount"
                >
                  Home Loan Amount
                </label>
                <div className="relative">
                  <input
                    id="loan-amount"
                    type="text"
                    inputMode="numeric"
                    value={amountInput}
                    onChange={handleAmountInputChange}
                    onBlur={handleAmountInputBlur}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all pr-10 outline-none border-[1px]"
                    maxLength={11}
                  />
                  <span className="absolute right-2 top-2.5 text-sm text-gray-400">
                    ₹
                  </span>
                </div>
                {/* Custom Slider with tooltip */}
                <div className="relative flex flex-col gap-1 mt-1">
                  <input
                    type="range"
                    min={0}
                    max={20000000}
                    step={10000}
                    value={amount}
                    onChange={(e) => {
                      setAmount(Number(e.target.value));
                      setAmountInput(
                        Number(e.target.value).toLocaleString("en-IN")
                      );
                    }}
                    className="w-full h-2 rounded-full bg-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 accent-emerald-500 slider-thumb"
                    style={{
                      background: `linear-gradient(to right, #10b981 0%, #10b981 ${
                        (amount / 20000000) * 100
                      }%, #e5e7eb ${(amount / 20000000) * 100}%, #e5e7eb 100%)`,
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                    <span>₹0</span>
                    <span>₹25L</span>
                    <span>₹50L</span>
                    <span>₹75L</span>
                    <span>₹1Cr</span>
                    <span>₹2Cr</span>
                  </div>
                </div>
              </div>
              {/* Interest Rate */}
              <div className="flex flex-col gap-2">
                <label
                  className="text-sm font-medium text-[#374151]"
                  htmlFor="interest-rate"
                >
                  Interest Rate
                </label>
                <div className="relative">
                  <input
                    id="interest-rate"
                    type="number"
                    value={rate}
                    min={0}
                    max={20}
                    step={0.01}
                    onChange={handleRateInput}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all pr-10 outline-none border-[1px]"
                  />
                  <span className="absolute right-2 top-2.5 text-sm text-gray-400">
                    %
                  </span>
                </div>
                {/* Custom Slider with tooltip */}
                <div className="relative flex flex-col gap-1 mt-1">
                  <input
                    type="range"
                    min={0}
                    max={20}
                    step={0.01}
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full h-2 rounded-full bg-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 accent-emerald-500 slider-thumb"
                    style={{
                      background: `linear-gradient(to right, #10b981 0%, #10b981 ${
                        (rate / 20) * 100
                      }%, #e5e7eb ${(rate / 20) * 100}%, #e5e7eb 100%)`,
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                    <span>0%</span>
                    <span>5%</span>
                    <span>10%</span>
                    <span>15%</span>
                    <span>20%</span>
                  </div>
                </div>
              </div>
              {/* Loan Tenure */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label
                    className="text-sm font-medium text-[#374151]"
                    htmlFor="loan-tenure"
                  >
                    Loan Tenure
                  </label>
                  <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
                    <button
                      type="button"
                      className={`px-2 py-1 rounded-md text-xs font-medium ${
                        tenureUnit === "years"
                          ? "bg-emerald-500 text-white"
                          : "text-gray-600"
                      }`}
                      onClick={() => handleTenureUnitChange("years")}
                    >
                      Years
                    </button>
                    <button
                      type="button"
                      className={`px-2 py-1 rounded-md text-xs font-medium ${
                        tenureUnit === "months"
                          ? "bg-emerald-500 text-white"
                          : "text-gray-600"
                      }`}
                      onClick={() => handleTenureUnitChange("months")}
                    >
                      Months
                    </button>
                  </div>
                </div>
                <span className="text-xs text-gray-500 mb-1">
                  Switch to months for more granular control
                </span>
                <div className="relative">
                  <input
                    id="loan-tenure"
                    type="number"
                    value={tenure}
                    min={tenureUnit === "years" ? 1 : 12}
                    max={tenureUnit === "years" ? 30 : 360}
                    step={tenureUnit === "years" ? 1 : 1}
                    onChange={handleTenureInput}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all pr-10 outline-none border-[1px]"
                  />
                  <span className="absolute right-2 top-2.5 text-sm text-gray-400">
                    {tenureUnit === "years" ? "Yr" : "Mo"}
                  </span>
                </div>
                <div className="relative flex flex-col gap-1 mt-1">
                  <input
                    type="range"
                    min={tenureUnit === "years" ? 1 : 12}
                    max={tenureUnit === "years" ? 30 : 360}
                    step={1}
                    value={tenure}
                    onChange={(e) => handleTenureSlider(Number(e.target.value))}
                    className="w-full h-2 rounded-full bg-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 accent-emerald-500 slider-thumb"
                    style={{
                      background:
                        tenureUnit === "years"
                          ? `linear-gradient(to right, #10b981 0%, #10b981 ${
                              ((tenure - 1) / 29) * 100
                            }%, #e5e7eb ${
                              ((tenure - 1) / 29) * 100
                            }%, #e5e7eb 100%)`
                          : `linear-gradient(to right, #10b981 0%, #10b981 ${
                              ((tenure - 12) / 348) * 100
                            }%, #e5e7eb ${
                              ((tenure - 12) / 348) * 100
                            }%, #e5e7eb 100%)`,
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                    {tenureUnit === "years" ? (
                      <>
                        <span>1</span>
                        <span>5</span>
                        <span>10</span>
                        <span>15</span>
                        <span>20</span>
                        <span>25</span>
                        <span>30</span>
                      </>
                    ) : (
                      <>
                        <span>12</span>
                        <span>60</span>
                        <span>120</span>
                        <span>180</span>
                        <span>240</span>
                        <span>300</span>
                        <span>360</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-700 mt-1 font-medium">
                  {tenure} {tenureUnit === "years" ? "Yr" : "Mo"}
                </div>
              </div>
              {/* EMI Start Date */}
              <div className="flex flex-col gap-2">
                <label
                  className="text-sm font-medium text-[#374151]"
                  htmlFor="emi-start"
                >
                  EMI Start Date
                </label>
                <input
                  id="emi-start"
                  type="month"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none border-[1px]"
                  min="2000-01"
                  max="2100-12"
                />
              </div>
            </div>
          </section>
          {/* Pie chart and summary cards: col-span-1 */}
          <section className="md:col-span-1 flex flex-col gap-4">
            {/* Pie Chart at top */}
            <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center">
              <h2 className="text-lg font-semibold text-[#1E2A38] mb-2">
                Break-up of Total Payment
              </h2>
              <div className="w-full h-full flex items-center justify-center">
                <PaymentBreakdownPie
                  principal={amount}
                  interest={result.totalInterest}
                />
              </div>
            </div>
            {/* Summary cards stacked below */}
            <div className="flex flex-col gap-3">
              <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center">
                <div className="text-sm text-[#6B7280] mb-1">Loan EMI</div>
                <div className="text-lg font-semibold text-[#1E2A38]">
                  {formatINR(result.emi)}
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center">
                <div className="text-sm text-[#6B7280] mb-1">
                  Total Interest Payable
                </div>
                <div className="text-lg font-semibold text-[#F43F5E]">
                  {formatINR(result.totalInterest)}
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center">
                <div className="text-sm text-[#6B7280] mb-1">
                  Total Payment (Principal + Interest)
                </div>
                <div className="text-lg font-semibold text-[#10B981]">
                  {formatINR(result.totalPayment)}
                </div>
              </div>
            </div>
          </section>
        </div>
        {/* Amortization Table: full width below */}
        <section className="bg-white rounded-xl shadow-sm p-4 mt-6">
          <div className="w-full overflow-x-auto">
            <div className="sticky top-0 z-40 bg-white pt-2 pb-2 flex items-center justify-between flex-wrap gap-2 border-b border-zinc-200">
              <h2 className="text-lg font-semibold text-[#1E2A38]">
                Amortization Table
              </h2>
              {/* Compact filter toggles in header */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500 font-medium">
                    Reduce
                  </span>
                  <button
                    type="button"
                    className={`px-2 py-1 rounded-md text-xs font-semibold border border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 will-change-transform ${
                      reduceMode === "emi"
                        ? "bg-emerald-500 text-white shadow"
                        : "text-gray-700 bg-transparent"
                    }`}
                    onClick={() => setReduceMode("emi")}
                    aria-pressed={reduceMode === "emi"}
                  >
                    EMI
                  </button>
                  <button
                    type="button"
                    className={`px-2 py-1 rounded-md text-xs font-semibold border border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 will-change-transform ${
                      reduceMode === "tenure"
                        ? "bg-emerald-500 text-white shadow"
                        : "text-gray-700 bg-transparent"
                    }`}
                    onClick={() => setReduceMode("tenure")}
                    aria-pressed={reduceMode === "tenure"}
                  >
                    Tenure
                  </button>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <span className="text-xs text-gray-500 font-medium">
                    Group by
                  </span>
                  <button
                    type="button"
                    className={`px-2 py-1 rounded-md text-xs font-semibold border border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 will-change-transform ${
                      yearGrouping === "calendar"
                        ? "bg-emerald-500 text-white shadow"
                        : "text-gray-700 bg-transparent"
                    }`}
                    onClick={() => setYearGrouping("calendar")}
                    aria-pressed={yearGrouping === "calendar"}
                  >
                    Calendar Year
                  </button>
                  <button
                    type="button"
                    className={`px-2 py-1 rounded-md text-xs font-semibold border border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 will-change-transform ${
                      yearGrouping === "financial"
                        ? "bg-emerald-500 text-white shadow"
                        : "text-gray-700 bg-transparent"
                    }`}
                    onClick={() => setYearGrouping("financial")}
                    aria-pressed={yearGrouping === "financial"}
                  >
                    Financial Year
                  </button>
                </div>
              </div>
            </div>
            <table className="w-full min-w-[900px] border-separate border-spacing-0 rounded-xl overflow-hidden">
              <thead className="sticky top-[56px] z-30 bg-white shadow-sm">
                  <tr>
                    <th className="border-b border-zinc-200 text-sm px-3 py-2 text-left whitespace-nowrap bg-white">
                      {yearGrouping === "calendar" ? "Year" : "Financial Year"}
                    </th>
                    <th className="border-b border-zinc-200 text-xs px-3 py-2 text-right whitespace-nowrap bg-emerald-50 text-emerald-700 font-semibold tracking-wide">
                      Principal (A)
                    </th>
                    <th className="border-b border-zinc-200 text-xs px-3 py-2 text-right whitespace-nowrap bg-emerald-50 text-emerald-600 font-semibold tracking-wide">
                      Interest (B)
                    </th>
                    <th className="border-b border-zinc-200 text-xs px-3 py-2 text-right whitespace-nowrap bg-emerald-50 text-emerald-800 font-semibold tracking-wide">
                      Total Payment (A+B)
                    </th>
                    <th className="border-b border-zinc-200 text-xs px-3 py-2 text-right whitespace-nowrap bg-emerald-50 text-emerald-700 font-semibold tracking-wide">
                      Balance
                    </th>
                    <th className="border-b border-zinc-200 text-sm px-3 py-2 text-right whitespace-nowrap bg-white">
                      Loan Paid %
                    </th>
                    <th className="border-b border-zinc-200 text-sm px-3 py-2 text-right whitespace-nowrap bg-white">
                      <span className="inline-flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center cursor-pointer">
                              <FiInfo
                                className="w-3.5 h-3.5 text-zinc-400 hover:text-emerald-500"
                                aria-label="Info about Part-payment"
                              />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            align="center"
                            className="max-w-xs whitespace-pre-line px-3 py-2 rounded-md shadow-lg bg-white text-xs text-zinc-700"
                          >
                            A part-payment is an extra amount paid towards your
                            principal in any month. This reduces your
                            outstanding balance and total interest. You can make
                            part-payments at any time, in any amount.
                          </TooltipContent>
                        </Tooltip>
                        Part-payment
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Grouping logic for year/financial year */}
                  {(() => {
                    // Helper to get financial year label
                    function getFinancialYearLabel(date: Date) {
                      const year = date.getFullYear();
                      const month = date.getMonth() + 1;
                      if (month >= 4) {
                        // April to Dec: FY is current year–next year
                        return `FY ${year}-${(year + 1).toString().slice(-2)}`;
                      } else {
                        // Jan to Mar: FY is prev year–current year
                        return `FY ${year - 1}-${year.toString().slice(-2)}`;
                      }
                    }

                    // Group rows by year type
                    const groups: Record<string, typeof scheduleWithCalendar> =
                      {};
                    scheduleWithCalendar.forEach((row) => {
                      let groupKey = "";
                      if (yearGrouping === "calendar") {
                        groupKey = row.calendarYear?.toString() || "";
                      } else {
                        // Financial year
                        const [startYear, startMonth] = startDate
                          .split("-")
                          .map(Number);
                        const date = new Date(
                          startYear,
                          startMonth - 1 + row.idx
                        );
                        groupKey = getFinancialYearLabel(date);
                      }
                      if (!groups[groupKey]) groups[groupKey] = [];
                      groups[groupKey].push(row);
                    });

                    // Render groups
                    const groupEntries = Object.entries(groups);
                    if (groupEntries.length === 0) return null;
                    return (
                      <>
                        {groupEntries.map(([group, rows], i) => {
                          const summary = getYearlySummary(rows);
                          const endBalance =
                            rows[rows.length - 1]?.balance || 0;
                          const isExpanded = expandedYears[group];
                          return (
                            <React.Fragment key={group}>
                              {/* Year summary row (expand/collapse) */}
                              <tr
                                className={
                                  `cursor-pointer bg-emerald-50 hover:bg-emerald-100 border-b border-emerald-100 font-semibold transition-all` +
                                  (i > 0 ? " mt-2" : "")
                                }
                                onClick={() =>
                                  setExpandedYears((prev) => ({
                                    ...prev,
                                    [group]: !prev[group],
                                  }))
                                }
                                tabIndex={0}
                                aria-expanded={!!isExpanded}
                                aria-controls={`amortization-group-${group}`}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    setExpandedYears((prev) => ({
                                      ...prev,
                                      [group]: !prev[group],
                                    }));
                                  }
                                }}
                              >
                                <td className="pl-4 py-2 flex items-center gap-2 text-emerald-800 text-base">
                                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                                    {!isExpanded ? (
                                      <ChevronRight className="w-4 h-4 text-emerald-500 transition-transform duration-200" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-emerald-500 transition-transform duration-200" />
                                    )}
                                  </span>
                                  <span className="text-base font-bold tracking-tight">
                                    {group}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-right text-emerald-700 font-bold">
                                  {formatINR(
                                    Math.round(summary.totalPrincipal)
                                  )}
                                </td>
                                <td className="px-3 py-2 text-right text-emerald-600 font-bold">
                                  {formatINR(Math.round(summary.totalInterest))}
                                </td>
                                <td className="px-3 py-2 text-right text-emerald-800 font-bold">
                                  {formatINR(Math.round(summary.totalPayment))}
                                </td>
                                <td className="px-3 py-2 text-right text-zinc-700 font-semibold">
                                  {formatINR(Math.round(endBalance))}
                                </td>
                                <td className="px-3 py-2 text-right text-emerald-600 font-semibold">
                                  {summary.pctReduced.toFixed(2)}%
                                </td>
                                <td />
                              </tr>
                              {/* Month rows (collapsible) */}
                              <AnimatePresence initial={false}>
                                {isExpanded &&
                                  rows.map((row) => {
                                    const isLoanClosed =
                                      Math.round(row.balance) === 0;
                                    return (
                                      <motion.tr
                                        key={row.calendarLabel}
                                        layout
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{
                                          duration: 0.35,
                                          ease: "easeInOut",
                                        }}
                                        style={{ overflow: "hidden" }}
                                        className={`transition-all duration-200 ${
                                          row.idx % 2 === 0
                                            ? "bg-white"
                                            : "bg-zinc-50"
                                        } hover:bg-emerald-50 group border-b border-zinc-100`}
                                      >
                                        <motion.td
                                          colSpan={7}
                                          style={{
                                            padding: 0,
                                            border: 0,
                                            overflow: "hidden",
                                          }}
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{
                                            height: "auto",
                                            opacity: 1,
                                          }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{
                                            duration: 0.35,
                                            ease: "easeInOut",
                                          }}
                                        >
                                          <div style={{ display: "flex" }}>
                                            <div
                                              className="px-3 py-2 pl-8 flex items-center gap-2 text-sm"
                                              style={{ flex: 2 }}
                                            >
                                              {row.calendarLabel}
                                              {isLoanClosed && (
                                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-xs font-semibold px-2 py-0.5 rounded-full ml-2">
                                                  Loan Closed
                                                </span>
                                              )}
                                            </div>
                                            <div
                                              className="px-3 py-2 text-right text-xs font-mono"
                                              style={{ flex: 1 }}
                                            >
                                              {formatINR(
                                                Math.round(row.principal)
                                              )}
                                            </div>
                                            <div
                                              className="px-3 py-2 text-right text-xs font-mono"
                                              style={{ flex: 1 }}
                                            >
                                              {formatINR(
                                                Math.round(row.interest)
                                              )}
                                            </div>
                                            <div
                                              className="px-3 py-2 text-right text-xs font-mono font-semibold"
                                              style={{ flex: 1 }}
                                            >
                                              {formatINR(Math.round(row.total))}
                                            </div>
                                            <div
                                              className="px-3 py-2 text-right text-xs font-mono"
                                              style={{ flex: 1 }}
                                            >
                                              {formatINR(
                                                Math.round(row.balance)
                                              )}
                                            </div>
                                            <div
                                              className="px-3 py-2 text-right text-sm"
                                              style={{ flex: 1 }}
                                            >
                                              <div className="relative w-24 h-5 bg-zinc-200 rounded-full overflow-hidden mx-auto flex items-center">
                                                <div
                                                  className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full transition-all"
                                                  style={{
                                                    width: `${loanPaidPct(
                                                      row.balance
                                                    )}%`,
                                                  }}
                                                ></div>
                                                <span
                                                  className="relative z-10 w-full text-xs text-center font-medium text-white"
                                                  style={{
                                                    color:
                                                      Number(
                                                        loanPaidPct(row.balance)
                                                      ) > 40
                                                        ? "#fff"
                                                        : "#059669",
                                                  }}
                                                >
                                                  {loanPaidPct(row.balance)}%
                                                </span>
                                              </div>
                                            </div>
                                            <div
                                              className="px-3 py-2 text-right text-sm"
                                              style={{ flex: 2 }}
                                            >
                                              {reduceMode === "tenure" ? (
                                                <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 w-fit mx-auto shadow-sm">
                                                  <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={
                                                      partPayments[row.idx]
                                                        ? Number(
                                                            partPayments[
                                                              row.idx
                                                            ]
                                                          ).toLocaleString(
                                                            "en-IN"
                                                          )
                                                        : ""
                                                    }
                                                    onChange={(e) => {
                                                      const val =
                                                        e.target.value.replace(
                                                          /[^\d]/g,
                                                          ""
                                                        );
                                                      if (
                                                        val === "" ||
                                                        Number(val) === 0
                                                      ) {
                                                        setPartPayments(
                                                          (prev) => {
                                                            const copy = {
                                                              ...prev,
                                                            };
                                                            delete copy[
                                                              row.idx
                                                            ];
                                                            return copy;
                                                          }
                                                        );
                                                      } else {
                                                        setPartPayments(
                                                          (prev) => ({
                                                            ...prev,
                                                            [row.idx]:
                                                              Number(val),
                                                          })
                                                        );
                                                      }
                                                    }}
                                                    className="rounded-md border border-gray-300 px-2 py-1 text-xs w-20 text-right focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition outline-none bg-white"
                                                    placeholder="₹"
                                                    min={0}
                                                  />
                                                  <div className="w-px h-5 bg-zinc-200 mx-1" />
                                                  <div className="flex items-center gap-1">
                                                    <input
                                                      type="number"
                                                      inputMode="decimal"
                                                      min={0}
                                                      step={0.01}
                                                      value={
                                                        emiIncreases[row.idx]
                                                          ?.value ?? ""
                                                      }
                                                      onChange={(e) => {
                                                        const val =
                                                          e.target.value;
                                                        if (
                                                          val === "" ||
                                                          Number(val) === 0
                                                        ) {
                                                          setEmiIncreases(
                                                            (prev) => {
                                                              const copy = {
                                                                ...prev,
                                                              };
                                                              delete copy[
                                                                row.idx
                                                              ];
                                                              return copy;
                                                            }
                                                          );
                                                        } else {
                                                          setEmiIncreases(
                                                            (prev) => ({
                                                              ...prev,
                                                              [row.idx]: {
                                                                type:
                                                                  emiIncreases[
                                                                    row.idx
                                                                  ]?.type ||
                                                                  "percent",
                                                                value:
                                                                  Number(val),
                                                              },
                                                            })
                                                          );
                                                        }
                                                      }}
                                                      className="rounded-md border border-emerald-300 px-2 py-1 text-xs w-16 text-right focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition outline-none bg-white"
                                                      placeholder={
                                                        emiIncreases[row.idx]
                                                          ?.type === "value"
                                                          ? "+₹"
                                                          : "+%"
                                                      }
                                                      aria-label="EMI Increase"
                                                    />
                                                    <div className="flex gap-0.5 bg-gray-100 rounded-full p-0.5 ml-1">
                                                      <button
                                                        type="button"
                                                        className={`px-1.5 py-0.5 rounded-full text-xs font-semibold border border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 will-change-transform ${
                                                          !emiIncreases[
                                                            row.idx
                                                          ] ||
                                                          emiIncreases[row.idx]
                                                            ?.type === "percent"
                                                            ? "bg-emerald-500 text-white shadow"
                                                            : "text-gray-700 bg-transparent"
                                                        }`}
                                                        onClick={() =>
                                                          setEmiIncreases(
                                                            (prev) => ({
                                                              ...prev,
                                                              [row.idx]: {
                                                                type: "percent",
                                                                value:
                                                                  prev[row.idx]
                                                                    ?.value ||
                                                                  0,
                                                              },
                                                            })
                                                          )
                                                        }
                                                        aria-pressed={
                                                          !emiIncreases[
                                                            row.idx
                                                          ] ||
                                                          emiIncreases[row.idx]
                                                            ?.type === "percent"
                                                        }
                                                      >
                                                        %
                                                      </button>
                                                      <button
                                                        type="button"
                                                        className={`px-1.5 py-0.5 rounded-full text-xs font-semibold border border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 will-change-transform ${
                                                          emiIncreases[row.idx]
                                                            ?.type === "value"
                                                            ? "bg-emerald-500 text-white shadow"
                                                            : "text-gray-700 bg-transparent"
                                                        }`}
                                                        onClick={() =>
                                                          setEmiIncreases(
                                                            (prev) => ({
                                                              ...prev,
                                                              [row.idx]: {
                                                                type: "value",
                                                                value:
                                                                  prev[row.idx]
                                                                    ?.value ||
                                                                  0,
                                                              },
                                                            })
                                                          )
                                                        }
                                                        aria-pressed={
                                                          emiIncreases[row.idx]
                                                            ?.type === "value"
                                                        }
                                                      >
                                                        +₹
                                                      </button>
                                                    </div>
                                                  </div>
                                                </div>
                                              ) : (
                                                <input
                                                  type="text"
                                                  inputMode="numeric"
                                                  value={
                                                    partPayments[row.idx]
                                                      ? Number(
                                                          partPayments[row.idx]
                                                        ).toLocaleString(
                                                          "en-IN"
                                                        )
                                                      : ""
                                                  }
                                                  onChange={(e) => {
                                                    const val =
                                                      e.target.value.replace(
                                                        /[^\d]/g,
                                                        ""
                                                      );
                                                    if (
                                                      val === "" ||
                                                      Number(val) === 0
                                                    ) {
                                                      setPartPayments(
                                                        (prev) => {
                                                          const copy = {
                                                            ...prev,
                                                          };
                                                          delete copy[row.idx];
                                                          return copy;
                                                        }
                                                      );
                                                    } else {
                                                      setPartPayments(
                                                        (prev) => ({
                                                          ...prev,
                                                          [row.idx]:
                                                            Number(val),
                                                        })
                                                      );
                                                    }
                                                  }}
                                                  className="rounded-full border border-gray-300 px-2 py-1 text-xs w-24 text-right focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition outline-none"
                                                  placeholder="Part-payment"
                                                  min={0}
                                                />
                                              )}
                                            </div>
                                          </div>
                                        </motion.td>
                                      </motion.tr>
                                    );
                                  })}
                              </AnimatePresence>
                              {/* Add vertical spacing between year groups */}
                              <tr aria-hidden className="h-2 bg-transparent" />
                            </React.Fragment>
                          );
                        })}
                      </>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        {/* Download Buttons Toolbar: below table, right-aligned */}
        <div className="flex flex-row flex-wrap gap-3 mt-4 justify-center">
          <Button
            type="button"
            variant="default"
            onClick={handleExportPDF}
            className="bg-[#10B981] text-white rounded-full text-sm px-4 py-2 flex items-center gap-2"
          >
            <FaFilePdf /> Download PDF
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleExportExcel}
            className="bg-[#10B981] text-white rounded-full text-sm px-4 py-2 flex items-center gap-2"
          >
            <FaFileExcel /> Download Excel
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled
            className="bg-[#10B981]/10 text-[#10B981] rounded-full text-sm px-4 py-2 flex items-center gap-2"
          >
            <FaShareAlt /> Share
          </Button>
        </div>
        {/* Yearly Breakdown Chart (full width below) */}
        <section className="bg-white rounded-xl shadow-sm p-4 mt-6">
          <h2 className="text-lg font-semibold text-[#1E2A38] mb-2">
            Yearly Principal, Interest & Balance
          </h2>
          <div className="w-full">
            <YearlyBreakdownBar schedule={result.schedule} />
          </div>
        </section>
      </div>
    </main>
  );
}
