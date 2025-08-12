import React, { createContext, useContext, useReducer, ReactNode } from "react";
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

// Initial state
const today = new Date();
const defaultStart = `${today.getFullYear()}-${String(
  today.getMonth() + 1
).padStart(2, "0")}`;

const initialState: LoanState = {
  loanType: "home",
  amount: 7500000,
  rate: 8.5,
  tenure: 20,
  tenureUnit: "years",
  startDate: defaultStart,
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
  const [state, dispatch] = useReducer(loanReducer, initialState);

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
    import("xlsx").then((XLSX) => {
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
  };

  return (
    <LoanCalculatorContext.Provider value={contextValue}>
      {children}
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
