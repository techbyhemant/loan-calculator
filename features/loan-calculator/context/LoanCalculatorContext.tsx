import React, { createContext, useContext, useReducer, useEffect, useRef, ReactNode } from "react";
import { loanTypeConfigs, LoanType } from "../loanTypeConfigs";
import { calculateLoan } from "@/lib/utils";
import type { AmortizationRowWithExtras } from "../AmortizationTable";

// Types
type TenureUnit = "years" | "months";

interface LoanState {
  loanType: LoanType;
  amount: number;
  rate: number;
  tenure: number;
  tenureUnit: TenureUnit;
  startDate: string;
  yearGrouping: "calendar" | "financial";
  reduceMode: "emi" | "tenure";
  expanded: Record<string, boolean>;
  partPayments: Record<number, number>;
  emiIncreases: Record<number, { type: "percent" | "value"; value: number }>;
  editingCell: { idx: number; field: "partPayment" | "emiIncrease" } | null;
}

interface LoanContextType extends LoanState {
  // Actions
  setLoanType: (type: LoanType) => void;
  setAmount: (amount: number) => void;
  setRate: (rate: number) => void;
  setTenure: (tenure: number) => void;
  setTenureUnit: (unit: TenureUnit) => void;
  setStartDate: (date: string) => void;
  setYearGrouping: (grouping: "calendar" | "financial") => void;
  setReduceMode: (mode: "emi" | "tenure") => void;
  setExpanded: (expanded: Record<string, boolean>) => void;
  setPartPayments: (payments: Record<number, number>) => void;
  setEmiIncreases: (
    increases: Record<number, { type: "percent" | "value"; value: number }>
  ) => void;
  setEditingCell: (
    cell: { idx: number; field: "partPayment" | "emiIncrease" } | null
  ) => void;

  // Computed values
  config: (typeof loanTypeConfigs)[LoanType];
  result: ReturnType<typeof calculateLoan>;
  scheduleWithCalendar: AmortizationRowWithExtras[];
  formatINR: (value: number) => string;
  loanPaidPct: (balance: number) => string;

  // Actions
  handleTenureSlider: (val: number) => void;
  handleExportPDF: () => Promise<void>;
  handleExportExcel: () => void;
  handleShareURL: () => void;
}

// Action types
type LoanAction =
  | { type: "SET_LOAN_TYPE"; payload: LoanType }
  | { type: "SET_AMOUNT"; payload: number }
  | { type: "SET_RATE"; payload: number }
  | { type: "SET_TENURE"; payload: number }
  | { type: "SET_TENURE_UNIT"; payload: TenureUnit }
  | { type: "SET_START_DATE"; payload: string }
  | { type: "SET_YEAR_GROUPING"; payload: "calendar" | "financial" }
  | { type: "SET_REDUCE_MODE"; payload: "emi" | "tenure" }
  | { type: "SET_EXPANDED"; payload: Record<string, boolean> }
  | { type: "SET_PART_PAYMENTS"; payload: Record<number, number> }
  | {
      type: "SET_EMI_INCREASES";
      payload: Record<number, { type: "percent" | "value"; value: number }>;
    }
  | {
      type: "SET_EDITING_CELL";
      payload: { idx: number; field: "partPayment" | "emiIncrease" } | null;
    }
  | { type: "RESET_TO_DEFAULTS" };

// Initial state — startDate is set in the lazy initializer to avoid hydration mismatch
const initialState: LoanState = {
  loanType: "home",
  amount: 7500000,
  rate: 8.5,
  tenure: 20,
  tenureUnit: "years",
  startDate: "", // set in lazy initializer below
  yearGrouping: "calendar",
  reduceMode: "emi",
  expanded: {},
  partPayments: {},
  emiIncreases: {},
  editingCell: null,
};

// Reducer
function loanReducer(state: LoanState, action: LoanAction): LoanState {
  switch (action.type) {
    case "SET_LOAN_TYPE":
      return { ...state, loanType: action.payload };
    case "SET_AMOUNT":
      return { ...state, amount: action.payload };
    case "SET_RATE":
      return { ...state, rate: action.payload };
    case "SET_TENURE":
      return { ...state, tenure: action.payload };
    case "SET_TENURE_UNIT":
      return { ...state, tenureUnit: action.payload };
    case "SET_START_DATE":
      return { ...state, startDate: action.payload };
    case "SET_YEAR_GROUPING":
      return { ...state, yearGrouping: action.payload };
    case "SET_REDUCE_MODE":
      return { ...state, reduceMode: action.payload };
    case "SET_EXPANDED":
      return { ...state, expanded: action.payload };
    case "SET_PART_PAYMENTS":
      return { ...state, partPayments: action.payload };
    case "SET_EMI_INCREASES":
      return { ...state, emiIncreases: action.payload };
    case "SET_EDITING_CELL":
      return { ...state, editingCell: action.payload };
    case "RESET_TO_DEFAULTS":
      const config = loanTypeConfigs[state.loanType];
      return {
        ...state,
        amount: config.loanAmount.default,
        rate: config.interestRate.default,
        tenure: config.tenure.default,
      };
    default:
      return state;
  }
}

// Create context
const LoanCalculatorContext = createContext<LoanContextType | undefined>(
  undefined
);

// Provider component
interface LoanCalculatorProviderProps {
  children: ReactNode;
}

export function LoanCalculatorProvider({
  children,
}: LoanCalculatorProviderProps) {
  const [state, dispatch] = useReducer(loanReducer, initialState, (init) => {
    // Use a static default for SSR — real date is set in useEffect below
    const merged = { ...init, startDate: "2026-03" };

    // Read shared token from URL on mount (e.g. ?s=<base64token>)
    if (typeof window === "undefined") return merged;
    const params = new URLSearchParams(window.location.search);

    const token = params.get("s");
    if (token) {
      try {
        const json = JSON.parse(atob(token.replace(/-/g, "+").replace(/_/g, "/")));
        if (json.t && (json.t === "home" || json.t === "personal" || json.t === "car")) merged.loanType = json.t;
        if (typeof json.a === "number" && json.a > 0) merged.amount = json.a;
        if (typeof json.r === "number" && json.r >= 0) merged.rate = json.r;
        if (typeof json.n === "number" && json.n > 0) merged.tenure = json.n;
        if (json.u === "years" || json.u === "months") merged.tenureUnit = json.u;
        if (typeof json.d === "string" && /^\d{4}-\d{2}$/.test(json.d)) merged.startDate = json.d;
      } catch {
        // Invalid token, ignore
      }
    }

    return merged;
  });

  // Set real date on client after hydration (avoids SSR mismatch)
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      const today = new Date();
      const realDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
      if (state.startDate === "2026-03" && realDate !== "2026-03") {
        dispatch({ type: "SET_START_DATE", payload: realDate });
      }
      // Clean up URL params after reading shared token
      if (window.location.search) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
  }, [state.startDate]);

  // Computed values
  const config = loanTypeConfigs[state.loanType];

  const result = React.useMemo(() => {
    const actualTenure =
      state.tenureUnit === "years" ? state.tenure : state.tenure / 12;
    return calculateLoan({
      amount: state.amount,
      rate: state.rate,
      tenure: actualTenure,
      partPayments: state.partPayments,
      partPaymentMode: state.reduceMode,
      emiIncreases: state.emiIncreases,
    });
  }, [
    state.amount,
    state.rate,
    state.tenure,
    state.tenureUnit,
    state.partPayments,
    state.reduceMode,
    state.emiIncreases,
  ]);

  const scheduleWithCalendar = React.useMemo(() => {
    return result.schedule.map((row, idx) => {
      const startDateObj = new Date(state.startDate);
      const currentDate = new Date(startDateObj);
      currentDate.setMonth(currentDate.getMonth() + idx);

      return {
        ...row,
        idx,
        calendarYear: currentDate.getFullYear(),
        // 0-based month index (0 = Jan, 3 = Apr)
        calendarMonthIndex: currentDate.getMonth(),
        calendarMonth: currentDate.toLocaleDateString("en-US", {
          month: "short",
        }),
        calendarLabel: `${currentDate.toLocaleDateString("en-US", {
          month: "short",
        })}, ${currentDate.getFullYear()}`,
      };
    });
  }, [result.schedule, state.startDate]);

  // Utility functions
  const formatINR = React.useCallback((value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  const loanPaidPct = React.useCallback(
    (balance: number) => {
      return ((1 - balance / state.amount) * 100).toFixed(1);
    },
    [state.amount]
  );

  // Actions
  const setLoanType = React.useCallback((type: LoanType) => {
    dispatch({ type: "SET_LOAN_TYPE", payload: type });
    dispatch({ type: "RESET_TO_DEFAULTS" });
  }, []);

  const setAmount = React.useCallback((amount: number) => {
    dispatch({ type: "SET_AMOUNT", payload: amount });
  }, []);

  const setRate = React.useCallback((rate: number) => {
    dispatch({ type: "SET_RATE", payload: rate });
  }, []);

  const setTenure = React.useCallback((tenure: number) => {
    dispatch({ type: "SET_TENURE", payload: tenure });
  }, []);

  const setTenureUnit = React.useCallback((unit: TenureUnit) => {
    dispatch({ type: "SET_TENURE_UNIT", payload: unit });
  }, []);

  const setStartDate = React.useCallback((date: string) => {
    dispatch({ type: "SET_START_DATE", payload: date });
  }, []);

  const setYearGrouping = React.useCallback(
    (grouping: "calendar" | "financial") => {
      dispatch({ type: "SET_YEAR_GROUPING", payload: grouping });
    },
    []
  );

  const setReduceMode = React.useCallback((mode: "emi" | "tenure") => {
    dispatch({ type: "SET_REDUCE_MODE", payload: mode });
  }, []);

  const setExpanded = React.useCallback((expanded: Record<string, boolean>) => {
    dispatch({ type: "SET_EXPANDED", payload: expanded });
  }, []);

  const setPartPayments = React.useCallback(
    (payments: Record<number, number>) => {
      dispatch({ type: "SET_PART_PAYMENTS", payload: payments });
    },
    []
  );

  const setEmiIncreases = React.useCallback(
    (
      increases: Record<number, { type: "percent" | "value"; value: number }>
    ) => {
      dispatch({ type: "SET_EMI_INCREASES", payload: increases });
    },
    []
  );

  const setEditingCell = React.useCallback(
    (cell: { idx: number; field: "partPayment" | "emiIncrease" } | null) => {
      dispatch({ type: "SET_EDITING_CELL", payload: cell });
    },
    []
  );

  const handleTenureSlider = React.useCallback((val: number) => {
    dispatch({ type: "SET_TENURE", payload: val });
  }, []);

  // Export functions
  const handleExportExcel = React.useCallback(() => {
    const hasPartPayments = Object.values(state.partPayments).some(
      (v) => typeof v === "number" && v > 0
    );
    const hasEmiIncreases = Object.values(state.emiIncreases).some(
      (v) => v && typeof v.value === "number" && v.value > 0
    );
    const showLoanPaid = !(hasPartPayments && hasEmiIncreases);

    // Import XLSX dynamically to avoid SSR issues
    import("xlsx-js-style").then((XLSX) => {
      import("file-saver").then(({ saveAs }) => {
        const worksheet = XLSX.utils.json_to_sheet([
          {
            "Loan Category":
              state.loanType.charAt(0).toUpperCase() +
              state.loanType.slice(1) +
              " Loan",
            "Loan Amount": formatINR(state.amount),
            "Interest Rate": state.rate + "%",
            Tenure:
              state.tenureUnit === "years"
                ? `${state.tenure} yrs`
                : `${state.tenure} mo`,
            "Start Date": state.startDate,
          },
          {},
          ...scheduleWithCalendar.map((row, idx) => ({
            Period: `${row.calendarMonth}, ${row.calendarYear}`,
            "Principal (A)": formatINR(Math.round(row.principal)),
            "Interest (B)": formatINR(Math.round(row.interest)),
            "Total Payment (A+B)": formatINR(Math.round(row.total)),
            Balance: formatINR(Math.round(row.balance)),
            ...(showLoanPaid
              ? { "Loan Paid %": loanPaidPct(row.balance) + "%" }
              : {}),
            ...(hasPartPayments
              ? {
                  "Part-payment":
                    typeof state.partPayments[idx] === "number" &&
                    state.partPayments[idx] > 0
                      ? formatINR(state.partPayments[idx])
                      : "-",
                }
              : {}),
            ...(hasEmiIncreases
              ? {
                  "EMI Increase":
                    state.emiIncreases[idx] &&
                    typeof state.emiIncreases[idx].value === "number" &&
                    state.emiIncreases[idx].value > 0
                      ? state.emiIncreases[idx].type === "percent"
                        ? state.emiIncreases[idx].value + "%"
                        : formatINR(state.emiIncreases[idx].value)
                      : "-",
                }
              : {}),
          })),
        ]);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
          workbook,
          worksheet,
          "Amortization Schedule"
        );
        const excelBuffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });
        const data = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(data, "amortization.xlsx");
      });
    });
  }, [state, scheduleWithCalendar, formatINR, loanPaidPct]);

  const handleExportPDF = React.useCallback(async () => {
    const hasPartPayments = Object.values(state.partPayments).some(
      (v) => typeof v === "number" && v > 0
    );
    const hasEmiIncreases = Object.values(state.emiIncreases).some(
      (v) => v && typeof v.value === "number" && v.value > 0
    );
    const showLoanPaid = !(hasPartPayments && hasEmiIncreases);

    const pdfMakeModule = await import("pdfmake/build/pdfmake");
    const pdfFontsModule = await import("pdfmake/build/vfs_fonts");
    const pdfMake = pdfMakeModule.default || pdfMakeModule;
    pdfMake.vfs =
      pdfFontsModule.vfs ||
      (pdfFontsModule.default && pdfFontsModule.default.vfs);

    const tableHeader = [
      { text: "Period", bold: true },
      { text: "Principal (A)", bold: true },
      { text: "Interest (B)", bold: true },
      { text: "Total Payment (A+B)", bold: true },
      { text: "Balance", bold: true },
      ...(showLoanPaid ? [{ text: "Loan Paid %", bold: true }] : []),
      ...(hasPartPayments ? [{ text: "Part-payment", bold: true }] : []),
      ...(hasEmiIncreases ? [{ text: "EMI Increase", bold: true }] : []),
    ];
    const tableWidths = [
      60,
      60,
      60,
      70,
      70,
      ...(showLoanPaid ? [40] : []),
      ...(hasPartPayments ? [70] : []),
      ...(hasEmiIncreases ? [50] : []),
    ];

    const tableBody = [
      tableHeader,
      ...scheduleWithCalendar.map((row, idx) => [
        `${row.calendarMonth}, ${row.calendarYear}`,
        typeof row.principal === "number"
          ? formatINR(Math.round(row.principal))
          : "-",
        typeof row.interest === "number"
          ? formatINR(Math.round(row.interest))
          : "-",
        typeof row.total === "number" ? formatINR(Math.round(row.total)) : "-",
        typeof row.balance === "number"
          ? formatINR(Math.round(row.balance))
          : "-",
        ...(showLoanPaid ? [loanPaidPct(row.balance) + "%"] : []),
        ...(hasPartPayments
          ? [
              typeof state.partPayments[idx] === "number" &&
              state.partPayments[idx] > 0
                ? formatINR(state.partPayments[idx])
                : "-",
            ]
          : []),
        ...(hasEmiIncreases
          ? [
              state.emiIncreases[idx] &&
              typeof state.emiIncreases[idx].value === "number" &&
              state.emiIncreases[idx].value > 0
                ? state.emiIncreases[idx].type === "percent"
                  ? state.emiIncreases[idx].value + "%"
                  : formatINR(state.emiIncreases[idx].value)
                : "-",
            ]
          : []),
      ]),
    ];

    const docDefinition: any = {
      content: [
        { text: "Loan Amortization Schedule", style: "header" },
        {
          text: `Category: ${
            state.loanType.charAt(0).toUpperCase() + state.loanType.slice(1)
          } Loan`,
          margin: [0, 0, 0, 2],
        },
        {
          text: `Loan Amount: ${formatINR(state.amount)}`,
          margin: [0, 0, 0, 2],
        },
        { text: `Interest Rate: ${state.rate}%`, margin: [0, 0, 0, 2] },
        {
          text: `Tenure: ${
            state.tenureUnit === "years"
              ? `${state.tenure} yrs`
              : `${state.tenure} mo`
          }`,
          margin: [0, 0, 0, 2],
        },
        { text: `Start Date: ${state.startDate}`, margin: [0, 0, 0, 8] },
        {
          style: "tableExample",
          table: {
            headerRows: 1,
            widths: tableWidths,
            body: tableBody,
          },
          layout: "lightHorizontalLines",
        },
      ],
      styles: {
        header: { fontSize: 16, bold: true, margin: [0, 0, 0, 10] },
        tableExample: { margin: [0, 5, 0, 15] },
      },
      defaultStyle: {
        font: "Roboto",
        fontSize: 9,
      },
    };

    pdfMake.createPdf(docDefinition).download("amortization.pdf");
  }, [state, scheduleWithCalendar, formatINR, loanPaidPct]);

  const [shareToast, setShareToast] = React.useState(false);

  const handleShareURL = React.useCallback(() => {
    // Encode calculator state into a compact base64url token
    const payload = {
      t: state.loanType,
      a: state.amount,
      r: state.rate,
      n: state.tenure,
      ...(state.tenureUnit !== "years" ? { u: state.tenureUnit } : {}),
      ...(state.startDate ? { d: state.startDate } : {}),
    };
    const token = btoa(JSON.stringify(payload))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const url = `${window.location.origin}${window.location.pathname}?s=${token}`;

    navigator.clipboard.writeText(url).then(() => {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 3000);
    }).catch(() => {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 3000);
    });
  }, [state.loanType, state.amount, state.rate, state.tenure, state.tenureUnit, state.startDate]);

  const contextValue: LoanContextType = {
    ...state,
    config,
    result,
    scheduleWithCalendar,
    formatINR,
    loanPaidPct,
    setLoanType,
    setAmount,
    setRate,
    setTenure,
    setTenureUnit,
    setStartDate,
    setYearGrouping,
    setReduceMode,
    setExpanded,
    setPartPayments,
    setEmiIncreases,
    setEditingCell,
    handleTenureSlider,
    handleExportPDF,
    handleExportExcel,
    handleShareURL,
  };

  return (
    <LoanCalculatorContext.Provider value={contextValue}>
      {children}
      {/* Share toast notification */}
      {shareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-4">
          Link copied! Share with family to plan together
        </div>
      )}
    </LoanCalculatorContext.Provider>
  );
}

// Hook to use the context
export function useLoanCalculator() {
  const context = useContext(LoanCalculatorContext);
  if (context === undefined) {
    throw new Error(
      "useLoanCalculator must be used within a LoanCalculatorProvider"
    );
  }
  return context;
}
