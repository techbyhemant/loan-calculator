import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  ColumnDef,
  VisibilityState,
} from "@tanstack/react-table";
import type { ExpandedState, OnChangeFn } from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";

// Mobile Input Row Component
interface MobileInputRowProps {
  row: AmortizationRowWithExtras;
  reduceMode: "emi" | "tenure";
  renderPartPaymentCell?: (
    row: AmortizationRowWithExtras,
    reduceMode: "emi" | "tenure",
    inputType?: "partPayment" | "emiIncrease"
  ) => React.ReactNode | undefined;
}

const MobileInputRow: React.FC<MobileInputRowProps> = ({
  row,
  reduceMode,
  renderPartPaymentCell,
}) => {
  const [showPartPaymentTooltip, setShowPartPaymentTooltip] =
    React.useState(false);
  const [showEmiIncreaseTooltip, setShowEmiIncreaseTooltip] =
    React.useState(false);

  return (
    <div className="bg-gray-50/50 border-l-4 border-l-emerald-200 px-4 py-2 relative space-y-2">
      {/* First line: Part Payment */}
      <div className="flex items-center gap-3">
        {/* Label with info icon */}
        <div className="flex items-center gap-1 min-w-0 relative">
          <span className="text-gray-700 font-medium text-sm whitespace-nowrap">
            Part Payment
          </span>
          <button
            onMouseEnter={() => setShowPartPaymentTooltip(true)}
            onMouseLeave={() => setShowPartPaymentTooltip(false)}
            onTouchStart={() => setShowPartPaymentTooltip(true)}
            onTouchEnd={() =>
              setTimeout(() => setShowPartPaymentTooltip(false), 2000)
            }
            className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs hover:bg-emerald-200 transition-colors flex-shrink-0"
            type="button"
          >
            i
          </button>

          {/* Part Payment Tooltip */}
          {showPartPaymentTooltip && (
            <div className="absolute bottom-full left-0 mb-1 w-64 bg-gray-800 text-white text-xs rounded-lg p-3 z-50 shadow-lg">
              <div>
                <span className="font-medium text-emerald-300">
                  Part Payment:
                </span>{" "}
                Make additional payments towards principal to reduce loan tenure
                or EMI amount. This helps you save on total interest paid.
              </div>
              <div className="text-gray-300 mt-2">
                💡 Any extra amount you pay will directly reduce your
                outstanding loan balance.
              </div>
              {/* Tooltip arrow */}
              <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          )}
        </div>

        {/* Part Payment Input */}
        <div className="flex-1 min-w-0">
          {renderPartPaymentCell &&
            renderPartPaymentCell(row, reduceMode, "partPayment")}
        </div>
      </div>

      {/* Second line: EMI Increase (if in tenure mode) */}
      {reduceMode === "tenure" && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 min-w-0 relative">
            <span className="text-gray-700 font-medium text-sm whitespace-nowrap">
              EMI Increase
            </span>
            <button
              onMouseEnter={() => setShowEmiIncreaseTooltip(true)}
              onMouseLeave={() => setShowEmiIncreaseTooltip(false)}
              onTouchStart={() => setShowEmiIncreaseTooltip(true)}
              onTouchEnd={() =>
                setTimeout(() => setShowEmiIncreaseTooltip(false), 2000)
              }
              className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs hover:bg-emerald-200 transition-colors flex-shrink-0"
              type="button"
            >
              i
            </button>

            {/* EMI Increase Tooltip */}
            {showEmiIncreaseTooltip && (
              <div className="absolute bottom-full left-0 mb-1 w-64 bg-gray-800 text-white text-xs rounded-lg p-3 z-50 shadow-lg">
                <div>
                  <span className="font-medium text-emerald-300">
                    EMI Increase:
                  </span>{" "}
                  Increase your monthly EMI to pay off the loan faster. This
                  reduces the total tenure and interest paid over the loan
                  lifetime.
                </div>
                <div className="text-gray-300 mt-2">
                  💡 Higher EMI means faster loan closure and significant
                  interest savings.
                </div>
                {/* Tooltip arrow */}
                <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            )}
          </div>

          {/* EMI Increase Input */}
          <div className="flex-1 min-w-0">
            {renderPartPaymentCell &&
              renderPartPaymentCell(row, reduceMode, "emiIncrease")}
          </div>
        </div>
      )}
    </div>
  );
};

export type AmortizationRowWithExtras = {
  idx: number;
  calendarYear: number;
  calendarMonth: string;
  calendarLabel: string;
  groupKey?: string; // Make optional
  year: number;
  month: number;
  principal: number;
  interest: number;
  total: number;
  balance: number;
};

// New type for hierarchical data structure
export type HierarchicalAmortizationRow = {
  id: string;
  isGroup: boolean;
  groupKey: string;
  groupLabel: string;
  // Group summary data
  totalPrincipal?: number;
  totalInterest?: number;
  totalPayment?: number;
  avgEmi?: number;
  pctReduced?: number;
  endBalance?: number;
  // Original row data for leaf rows
  originalRow?: AmortizationRowWithExtras;
  // Sub-rows for group rows
  subRows?: HierarchicalAmortizationRow[];
};

interface AmortizationTableProps {
  scheduleWithCalendar: AmortizationRowWithExtras[];
  yearGrouping: "calendar" | "financial";
  formatINR: (value: number) => string;
  loanPaidPct: (balance: number) => string;
  reduceMode: "emi" | "tenure";
  renderPartPaymentCell?: (
    row: AmortizationRowWithExtras,
    reduceMode: "emi" | "tenure",
    inputType?: "partPayment" | "emiIncrease"
  ) => React.ReactNode | undefined;
  expanded: ExpandedState;
  onExpandedChange: OnChangeFn<ExpandedState>;
}

export const AmortizationTable: React.FC<AmortizationTableProps> = ({
  scheduleWithCalendar,
  yearGrouping,
  formatINR,
  loanPaidPct,
  reduceMode,
  renderPartPaymentCell,
  expanded,
  onExpandedChange,
}) => {
  // Mobile detection state
  const [isMobile, setIsMobile] = React.useState(false);

  // Responsive column visibility state
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      interest: false, // Hide interest column on mobile by default
      balancePct: false, // Hide loan paid % column on mobile by default
      principal: false, // Hide principal on mobile, will be combined with total
      partPayment: false, // Hide part payment column on mobile by default - will show in nested rows
    });

  // Update mobile state and column visibility based on screen size
  React.useEffect(() => {
    const handleResize = () => {
      const isLargeScreen = window.innerWidth >= 1024; // lg breakpoint
      const isMediumScreen = window.innerWidth >= 768; // md breakpoint
      const isMobileScreen = window.innerWidth < 768;

      setIsMobile(isMobileScreen);

      setColumnVisibility({
        interest: isLargeScreen,
        balancePct: isLargeScreen,
        principal: isMediumScreen, // Show principal on medium+ screens
        partPayment: !isMobileScreen, // Hide part payment column on mobile - will show in nested rows
      });
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Helper for financial year label
  function getFinancialYearLabel(row: AmortizationRowWithExtras) {
    const { calendarYear, month } = row;
    const year = calendarYear;
    if (month >= 4) {
      // Apr-Mar: FY is current year–next year
      return `FY ${year}-${String(year + 1).slice(-2)}`;
    } else {
      // Jan-Mar: FY is previous year–current year
      return `FY ${year - 1}-${String(year).slice(-2)}`;
    }
  }

  // Group summary helper
  function getYearlySummary(rows: AmortizationRowWithExtras[]) {
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
      endBalance,
    };
  }

  // Transform flat data into hierarchical structure
  const hierarchicalData = React.useMemo(() => {
    // Group rows by year
    const grouped = scheduleWithCalendar.reduce((acc, row) => {
      const groupKey =
        yearGrouping === "calendar"
          ? String(row.calendarYear)
          : getFinancialYearLabel(row);

      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(row);
      return acc;
    }, {} as Record<string, AmortizationRowWithExtras[]>);

    // Convert to hierarchical structure
    return Object.entries(grouped).map(([groupKey, rows]) => {
      const summary = getYearlySummary(rows);

      const groupRow: HierarchicalAmortizationRow = {
        id: groupKey,
        isGroup: true,
        groupKey,
        groupLabel: groupKey,
        ...summary,
        subRows: rows.map((row, idx) => ({
          id: `${groupKey}-${idx}`,
          isGroup: false,
          groupKey,
          groupLabel: row.calendarLabel,
          originalRow: row,
        })),
      };

      return groupRow;
    });
  }, [scheduleWithCalendar, yearGrouping]);

  // Responsive header component
  const ResponsiveHeader = React.useCallback(
    ({
      children,
      className = "",
    }: {
      children: React.ReactNode;
      className?: string;
    }) => (
      <div
        className={`lg:max-w-none ${
          isMobile ? "max-w-[100px] text-sm" : "max-w-[80px] text-xs"
        } lg:text-sm leading-tight font-medium ${className}`}
      >
        {children}
      </div>
    ),
    [isMobile]
  );

  // Table columns
  const columns = React.useMemo<ColumnDef<HierarchicalAmortizationRow>[]>(
    () => [
      {
        header: () => (
          <ResponsiveHeader>
            {yearGrouping === "calendar" ? "Year" : "Financial Year"}
          </ResponsiveHeader>
        ),
        accessorKey: "groupLabel",
        size: isMobile ? 80 : 120,
        minSize: isMobile ? 60 : 90,
        maxSize: 160,
        meta: { align: "left", padding: "pl-2" },
        cell: ({ row, getValue }) => {
          if (row.original.isGroup) {
            return (
              <span
                className={`font-bold ${
                  isMobile ? "text-base" : "text-base"
                } tracking-tight pl-2`}
              >
                {row.original.groupLabel}
              </span>
            );
          }
          // Month row
          return (
            <div
              className={`flex items-center justify-start pl-2 ${
                isMobile ? "text-sm font-medium" : ""
              }`}
            >
              {getValue() as React.ReactNode}
            </div>
          );
        },
      },
      {
        header: () => <ResponsiveHeader>Principal (A)</ResponsiveHeader>,
        accessorKey: "principal",
        id: "principal",
        size: isMobile ? 80 : 120,
        minSize: isMobile ? 60 : 90,
        maxSize: 100,
        meta: { align: "right", padding: "px-1" },
        cell: ({ row }) => {
          if (row.original.isGroup) {
            return (
              <span className="font-bold text-emerald-700">
                {formatINR(Math.round(row.original.totalPrincipal || 0))}
              </span>
            );
          }
          return formatINR(
            Math.round(row.original.originalRow?.principal || 0)
          );
        },
      },
      {
        header: () => <ResponsiveHeader>Interest (B)</ResponsiveHeader>,
        accessorKey: "interest",
        size: isMobile ? 80 : 120,
        minSize: isMobile ? 60 : 90,
        maxSize: 100,
        meta: { align: "right", padding: "px-1" },
        cell: ({ row }) => {
          if (row.original.isGroup) {
            return (
              <span className="font-bold text-emerald-600">
                {formatINR(Math.round(row.original.totalInterest || 0))}
              </span>
            );
          }
          return formatINR(Math.round(row.original.originalRow?.interest || 0));
        },
      },
      {
        header: () => (
          <ResponsiveHeader>
            {isMobile ? "EMI (P+I)" : "Total Payment (A+B)"}
          </ResponsiveHeader>
        ),
        accessorKey: "total",
        size: isMobile ? 70 : 100,
        minSize: isMobile ? 110 : 90,
        maxSize: 150,
        meta: { align: "right", padding: "px-1" },
        cell: ({ row }) => {
          if (row.original.isGroup) {
            return (
              <div className="text-right">
                <span className="font-bold text-emerald-800 block">
                  {formatINR(Math.round(row.original.totalPayment || 0))}
                </span>
                {isMobile && (
                  <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                    <div className="font-medium">
                      P:{" "}
                      {formatINR(Math.round(row.original.totalPrincipal || 0))}
                    </div>
                    <div className="font-medium">
                      I:{" "}
                      {formatINR(Math.round(row.original.totalInterest || 0))}
                    </div>
                  </div>
                )}
              </div>
            );
          }

          const originalRow = row.original.originalRow;
          if (!originalRow) return null;

          return (
            <div className="text-right">
              <span
                className={`${
                  isMobile ? "font-medium text-sm" : "font-medium"
                } block`}
              >
                {formatINR(Math.round(originalRow.total))}
              </span>
              {isMobile && (
                <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                  <div className="font-medium">
                    P: {formatINR(Math.round(originalRow.principal))}
                  </div>
                  <div className="font-medium">
                    I: {formatINR(Math.round(originalRow.interest))}
                  </div>
                </div>
              )}
            </div>
          );
        },
      },
      {
        header: () => (
          <ResponsiveHeader>
            {isMobile ? "Balance & %" : "Outstanding Balance"}
          </ResponsiveHeader>
        ),
        accessorKey: "balance",
        size: isMobile ? 100 : 110,
        minSize: isMobile ? 90 : 100,
        maxSize: 150,
        meta: { align: "right", padding: "px-1" },
        cell: ({ row }) => {
          if (row.original.isGroup) {
            return (
              <div className="text-right">
                <span
                  className={`${
                    isMobile ? "font-medium text-sm" : "font-bold"
                  } text-emerald-900 block`}
                >
                  {formatINR(Math.round(row.original.endBalance || 0))}
                </span>
                {isMobile && (
                  <div className="text-xs font-semibold text-emerald-800 mt-1">
                    {row.original.pctReduced?.toFixed(1) || "0.0"}% paid
                  </div>
                )}
              </div>
            );
          }

          const originalRow = row.original.originalRow;
          if (!originalRow) return null;

          const balance = originalRow.balance;

          return (
            <div className="text-right">
              <span
                className={`${isMobile ? "font-medium text-sm" : ""} block`}
              >
                {formatINR(Math.round(balance))}
              </span>
              {isMobile && (
                <div
                  className="text-xs font-semibold mt-1"
                  style={{
                    color:
                      balance <= 100000
                        ? "#10B981"
                        : balance <= 500000
                        ? "#F59E0B"
                        : "#059669",
                  }}
                >
                  {loanPaidPct(balance)}% paid
                </div>
              )}
            </div>
          );
        },
      },
      {
        header: () => <ResponsiveHeader>Loan Paid %</ResponsiveHeader>,
        id: "balancePct",
        size: 70,
        minSize: 60,
        maxSize: 90,
        meta: { align: "right", padding: "px-1" },
        cell: ({ row }) => {
          if (row.original.isGroup) {
            return (
              <span className="font-bold text-emerald-800">
                {row.original.pctReduced?.toFixed(1) || "0.0"}%
              </span>
            );
          }
          const balance = row.original.originalRow?.balance || 0;
          return (
            <div className="flex items-center gap-1 justify-end">
              <span
                className="text-xs font-medium text-right"
                style={{
                  color:
                    balance <= 100000
                      ? "#10B981"
                      : balance <= 500000
                      ? "#F59E0B"
                      : "#059669",
                }}
              >
                {loanPaidPct(balance)}%
              </span>
            </div>
          );
        },
      },
      {
        header: () => (
          <ResponsiveHeader>
            {isMobile ? "Part Payment" : "Part-payment"}
          </ResponsiveHeader>
        ),
        id: "partPayment",
        size: isMobile ? 150 : 120,
        minSize: isMobile ? 130 : 100,
        maxSize: 300,
        meta: { align: "center", padding: "px-1" },
        cell: ({ row }) => {
          if (row.original.isGroup) return null;
          if (renderPartPaymentCell && row.original.originalRow) {
            const result = renderPartPaymentCell(
              row.original.originalRow,
              reduceMode
            );
            if (
              typeof result === "string" ||
              typeof result === "number" ||
              React.isValidElement(result as React.ReactElement)
            ) {
              return (
                <div
                  className={`${
                    isMobile
                      ? "flex flex-col gap-1"
                      : "flex gap-2 items-center justify-center"
                  }`}
                >
                  {result as React.ReactNode}
                </div>
              );
            }
          }
          return null;
        },
      },
    ],
    [
      formatINR,
      loanPaidPct,
      renderPartPaymentCell,
      reduceMode,
      yearGrouping,
      isMobile,
      ResponsiveHeader,
    ]
  );

  // Table instance with expansion and column visibility
  const table = useReactTable({
    data: hierarchicalData,
    columns,
    state: {
      expanded,
      columnVisibility,
    },
    onExpandedChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (row) => row.subRows,
    getRowId: (row) => row.id,
    getRowCanExpand: (row) =>
      row.original.isGroup && (row.original.subRows?.length || 0) > 0,
    enableExpanding: true,
    enableColumnResizing: true,
  });

  // Generate gridTemplateColumns for a fluid, 100%-width layout with last column 2fr only in tenure mode
  const gridTemplateColumns = columns
    .filter((col) => {
      const columnId =
        col.id ||
        (
          col as ColumnDef<HierarchicalAmortizationRow> & {
            accessorKey?: string;
          }
        ).accessorKey;
      return columnId && table.getColumn(columnId)?.getIsVisible();
    })
    .map((col, idx, visibleColumns) => {
      const minSize = col.minSize || 60;
      if (idx === visibleColumns.length - 1) {
        // Last column (Part Payment)
        return `minmax(${minSize}px, ${isMobile ? "1.5fr" : "2fr"})`;
      } else if (isMobile && idx === 0) {
        // First column (Year) on mobile - give it a bit more space
        return `minmax(${minSize}px, 1.2fr)`;
      } else {
        return `minmax(${minSize}px, 1fr)`;
      }
    })
    .join(" ");

  // Helper to render a grid row
  function renderGridRow({
    key,
    cells,
    className = "",
    style = {},
    isHeader = false,
    onClick,
  }: {
    key: string;
    cells: React.ReactNode[];
    className?: string;
    style?: React.CSSProperties;
    isHeader?: boolean;
    onClick?: () => void;
  }) {
    return (
      <div
        key={key}
        className={`grid w-full items-center ${
          isMobile ? "min-h-[60px]" : "min-h-[40px]"
        } ${isHeader ? "font-semibold bg-white" : ""} ${className}`}
        style={{
          display: "grid",
          gridTemplateColumns,
          ...style,
        }}
        role={isHeader ? "row" : "row"}
        onClick={onClick}
      >
        {cells.map((cell, idx) => {
          const columnMeta = columns[idx]?.meta as {
            align?: string;
            padding?: string;
          };
          const align = columnMeta?.align || "left";
          const padding = columnMeta?.padding || "";

          return (
            <div
              key={idx}
              className={`flex items-center h-full ${
                isMobile ? "text-sm" : "text-xs"
              } border-b border-zinc-200 ${
                align === "right"
                  ? "text-right justify-end"
                  : align === "center"
                  ? "text-center justify-center"
                  : "text-left justify-start"
              } ${padding} ${isMobile ? "py-2 px-2" : ""}`}
              style={{
                gridColumn: idx + 1,
                ...(isHeader ? { fontWeight: 600 } : {}),
              }}
              role={isHeader ? "columnheader" : "cell"}
            >
              {cell}
            </div>
          );
        })}
      </div>
    );
  }

  // Render header
  const visibleColumns = columns.filter((col) => {
    const columnId =
      col.id ||
      (col as ColumnDef<HierarchicalAmortizationRow> & { accessorKey?: string })
        .accessorKey;
    return columnId && table.getColumn(columnId)?.getIsVisible();
  });

  const headerRow = renderGridRow({
    key: "header",
    isHeader: true,
    className: `sticky top-[64px] sm:top-[96px] bg-white border-b border-gray-200 z-40 shadow-sm`,
    cells: visibleColumns.map((col) =>
      typeof col.header === "function"
        ? col.header(
            undefined as unknown as import("@tanstack/react-table").HeaderContext<
              HierarchicalAmortizationRow,
              unknown
            >
          )
        : col.header
    ),
  });

  // Render all rows
  const allRows: React.ReactNode[] = [];
  table.getRowModel().rows.forEach((row) => {
    if (row.original.isGroup) {
      const isExpanded = row.getIsExpanded();

      // Group (year) row + months in a relative container
      allRows.push(
        <div key={row.id} className="relative">
          {renderGridRow({
            key: row.id,
            className: `bg-emerald-50 font-semibold cursor-pointer ${
              isExpanded
                ? "sticky top-0 z-30 shadow-sm border-b border-emerald-200"
                : ""
            } ${isMobile ? "min-h-[50px] text-sm" : ""}`,
            onClick: row.getToggleExpandedHandler(),
            cells: row.getVisibleCells().map((cell, cellIdx) =>
              cellIdx === 0 ? (
                <div className="flex items-center" key={cell.id}>
                  <span
                    className={`flex items-center justify-start ${
                      isMobile ? "w-3 h-4" : "w-4 h-6"
                    } cursor-pointer text-emerald-500 ${
                      isMobile ? "text-sm" : ""
                    }`}
                  >
                    {row.getIsExpanded() ? "▼" : "▶"}
                  </span>
                  <span
                    className={`font-bold ${
                      isMobile ? "!text-sm" : "text-base"
                    } tracking-tight`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </span>
                </div>
              ) : (
                flexRender(cell.column.columnDef.cell, cell.getContext())
              )
            ),
          })}
          <AnimatePresence key={row.id + "-months"} initial={false}>
            {row.getIsExpanded() && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                {row.original.subRows?.map((subRow) => (
                  <div key={subRow.id} className="relative">
                    {renderGridRow({
                      key: subRow.id,
                      className: `bg-white hover:bg-gray-50 ${
                        isMobile
                          ? "border-l-2 border-l-emerald-100 text-sm"
                          : ""
                      }`,
                      cells:
                        table
                          .getRow(subRow.id)
                          ?.getVisibleCells()
                          .map((cell) =>
                            flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )
                          ) || [],
                    })}
                    {/* Mobile nested row for part payment inputs */}
                    {isMobile && subRow.originalRow && (
                      <MobileInputRow
                        key={`mobile-input-${subRow.originalRow.idx}`}
                        row={subRow.originalRow}
                        reduceMode={reduceMode}
                        renderPartPaymentCell={renderPartPaymentCell}
                      />
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }
  });

  return (
    <div className="w-full">
      {headerRow}
      <div className="overflow-x-auto">{allRows}</div>
    </div>
  );
};
