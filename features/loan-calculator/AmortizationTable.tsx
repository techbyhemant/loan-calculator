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

// Short INR formatter for compact button labels
function formatINRShort(n: number): string {
  if (n >= 10000000) return `${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toLocaleString("en-IN");
}

export type AmortizationRowWithExtras = {
  idx: number;
  calendarYear: number;
  calendarMonthIndex?: number;
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
  partPayments: Record<number, number>;
  setPartPayments: (payments: Record<number, number>) => void;
  emiIncreases: Record<number, { type: "percent" | "value"; value: number }>;
  emiStartDate: string;
  openPartPaymentModal: (monthIndex: number, monthLabel: string, balance: number) => void;
  openEmiIncreaseModal: (monthIndex: number, monthLabel: string) => void;
  expanded: ExpandedState;
  onExpandedChange: OnChangeFn<ExpandedState>;
}

export const AmortizationTable: React.FC<AmortizationTableProps> = ({
  scheduleWithCalendar,
  yearGrouping,
  formatINR,
  loanPaidPct,
  reduceMode,
  partPayments,
  setPartPayments,
  emiIncreases,
  emiStartDate,
  openPartPaymentModal,
  openEmiIncreaseModal,
  expanded,
  onExpandedChange,
}) => {
  // Mobile detection state
  const [isMobile, setIsMobile] = React.useState(false);

  // Pagination: show 24 months by default, load more
  const [visibleMonths, setVisibleMonths] = React.useState(24);
  const totalMonths = scheduleWithCalendar.length;

  // Compute current month index for "now" badge
  const currentMonthIdx = React.useMemo(() => {
    const today = new Date();
    const startDate = new Date(emiStartDate + "-01");
    return Math.max(
      0,
      (today.getFullYear() - startDate.getFullYear()) * 12 +
        (today.getMonth() - startDate.getMonth())
    );
  }, [emiStartDate]);

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
    const { calendarYear, calendarMonthIndex, month } = row;
    const index =
      typeof calendarMonthIndex === "number" ? calendarMonthIndex : month - 1; // fallback
    const year = calendarYear;
    if (index >= 3) {
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
              <span className="font-bold text-primary">
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
              <span className="font-bold text-primary">
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
                <span className="font-bold text-foreground block">
                  {formatINR(Math.round(row.original.totalPayment || 0))}
                </span>
                {isMobile && (
                  <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
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
                <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
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
                  } text-foreground block`}
                >
                  {formatINR(Math.round(row.original.endBalance || 0))}
                </span>
                {isMobile && (
                  <div className="text-xs font-semibold text-foreground mt-1">
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
                <div className={`text-xs font-semibold mt-1 ${
                  balance <= 100000 ? "text-positive" : balance <= 500000 ? "text-warning" : "text-positive"
                }`}>
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
              <span className="font-bold text-foreground">
                {row.original.pctReduced?.toFixed(1) || "0.0"}%
              </span>
            );
          }
          const balance = row.original.originalRow?.balance || 0;
          return (
            <div className="flex items-center gap-1 justify-end">
              <span className={`text-xs font-medium text-right ${
                balance <= 100000 ? "text-positive" : balance <= 500000 ? "text-warning" : "text-positive"
              }`}>
                {loanPaidPct(balance)}%
              </span>
            </div>
          );
        },
      },
      {
        header: () => (
          <ResponsiveHeader>
            {isMobile ? "Actions" : "Simulate"}
          </ResponsiveHeader>
        ),
        id: "partPayment",
        size: isMobile ? 150 : 180,
        minSize: isMobile ? 130 : 140,
        maxSize: 300,
        meta: { align: "right", padding: "px-1" },
        cell: ({ row }) => {
          if (row.original.isGroup) return null;
          const originalRow = row.original.originalRow;
          if (!originalRow) return null;

          const monthIndex = originalRow.idx;
          const monthLabel = originalRow.calendarLabel;
          const balance = originalRow.balance;
          const hasPP = partPayments[monthIndex] > 0;
          const hasEMI = emiIncreases[monthIndex] && emiIncreases[monthIndex].value > 0;
          const isCurrentMonth = monthIndex === currentMonthIdx;
          const isFutureMonth = monthIndex >= currentMonthIdx;

          return (
            <div className="flex items-center gap-1 justify-end">
              {isCurrentMonth && (
                <span className="text-[10px] bg-warning/20 text-warning px-1.5 py-0.5 rounded mr-1">
                  now
                </span>
              )}
              {isFutureMonth && (
                <>
                  <button
                    onClick={() =>
                      openPartPaymentModal(monthIndex, monthLabel, balance)
                    }
                    className="text-[11px] text-primary bg-primary/10 hover:bg-primary/20 rounded px-2 py-1 transition-colors whitespace-nowrap"
                  >
                    {hasPP
                      ? `₹${formatINRShort(partPayments[monthIndex])}`
                      : "+ Part pay"}
                  </button>
                  <button
                    onClick={() =>
                      openEmiIncreaseModal(monthIndex, monthLabel)
                    }
                    className="text-[11px] text-muted-foreground bg-muted hover:bg-accent rounded px-2 py-1 transition-colors whitespace-nowrap"
                  >
                    {hasEMI
                      ? `EMI +₹${formatINRShort(emiIncreases[monthIndex].value)}`
                      : "↑ EMI"}
                  </button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [
      formatINR,
      loanPaidPct,
      partPayments,
      emiIncreases,
      currentMonthIdx,
      openPartPaymentModal,
      openEmiIncreaseModal,
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
        } ${isHeader ? "font-semibold bg-card" : ""} ${className}`}
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
              } border-b border-border ${
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
    className: `sticky top-[64px] sm:top-[96px] bg-card border-b border-border z-40 shadow-sm`,
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
            className: `bg-table-expanded font-semibold cursor-pointer ${
              isExpanded
                ? "sticky top-0 z-30 shadow-sm border-b border-border"
                : ""
            } ${isMobile ? "min-h-[50px] text-sm" : ""}`,
            onClick: row.getToggleExpandedHandler(),
            cells: row.getVisibleCells().map((cell, cellIdx) =>
              cellIdx === 0 ? (
                <div className="flex items-center" key={cell.id}>
                  <span
                    className={`flex items-center justify-start ${
                      isMobile ? "w-3 h-4" : "w-4 h-6"
                    } cursor-pointer text-primary ${
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
                {row.original.subRows
                  ?.filter((subRow) => {
                    // Pagination: only show months within visibleMonths
                    const idx = subRow.originalRow?.idx ?? 0;
                    return idx < visibleMonths;
                  })
                  .map((subRow) => {
                    const monthIdx = subRow.originalRow?.idx ?? -1;
                    const hasPP = partPayments[monthIdx] > 0;
                    const hasEMI =
                      emiIncreases[monthIdx] &&
                      emiIncreases[monthIdx].value > 0;

                    return (
                      <div key={subRow.id} className="relative">
                        {renderGridRow({
                          key: subRow.id,
                          className: `bg-card hover:bg-accent ${
                            isMobile
                              ? "border-l-2 border-l-primary/10 text-sm"
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

                        {/* Mobile action buttons row */}
                        {isMobile && subRow.originalRow && monthIdx >= currentMonthIdx && (
                          <div className="bg-muted/50 border-l-4 border-l-primary/20 px-4 py-2 flex items-center gap-2">
                            {monthIdx === currentMonthIdx && (
                              <span className="text-[10px] bg-warning/20 text-warning px-1.5 py-0.5 rounded">
                                now
                              </span>
                            )}
                            <button
                              onClick={() =>
                                openPartPaymentModal(
                                  monthIdx,
                                  subRow.originalRow!.calendarLabel,
                                  subRow.originalRow!.balance
                                )
                              }
                              className="text-xs text-primary bg-primary/10 hover:bg-primary/20 rounded px-3 py-1.5 transition-colors whitespace-nowrap"
                            >
                              {hasPP
                                ? `₹${formatINRShort(partPayments[monthIdx])}`
                                : "+ Part pay"}
                            </button>
                            <button
                              onClick={() =>
                                openEmiIncreaseModal(
                                  monthIdx,
                                  subRow.originalRow!.calendarLabel
                                )
                              }
                              className="text-xs text-muted-foreground bg-muted hover:bg-accent rounded px-3 py-1.5 transition-colors whitespace-nowrap"
                            >
                              {hasEMI
                                ? `EMI +₹${formatINRShort(emiIncreases[monthIdx].value)}`
                                : "↑ EMI"}
                            </button>
                          </div>
                        )}

                        {/* Inline simulation card: part payment */}
                        {hasPP && (
                          <div className="border-l-2 border-positive bg-positive/5 flex items-center justify-between px-3 py-1.5">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-positive flex-shrink-0" />
                              <span className="text-xs font-medium text-foreground">
                                Part payment: {formatINR(partPayments[monthIdx])}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                const newPP = { ...partPayments };
                                delete newPP[monthIdx];
                                setPartPayments(newPP);
                              }}
                              className="text-xs text-muted-foreground hover:text-destructive transition-colors px-1"
                              aria-label="Remove part payment"
                            >
                              ×
                            </button>
                          </div>
                        )}

                        {/* Inline simulation card: EMI increase */}
                        {hasEMI && (
                          <div className="border-l-2 border-primary bg-primary/5 flex items-center justify-between px-3 py-1.5">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                              <span className="text-xs font-medium text-foreground">
                                EMI increase: +{formatINR(emiIncreases[monthIdx].value)}/mo
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }
  });

  // Compute debt-free date from last schedule row
  const lastRow = scheduleWithCalendar[scheduleWithCalendar.length - 1];
  const debtFreeLabel = lastRow
    ? `${lastRow.calendarMonth} ${lastRow.calendarYear}`
    : "";

  return (
    <div className="w-full" role="table" aria-label="Amortization Schedule">
      <div role="rowgroup">{headerRow}</div>
      <div className="overflow-x-auto" role="rowgroup">
        {allRows}

        {/* Show more button for pagination */}
        {visibleMonths < totalMonths && (
          <button
            onClick={() =>
              setVisibleMonths((prev) => Math.min(prev + 24, totalMonths))
            }
            className="w-full py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors border-t border-border"
          >
            Show next 2 years ({totalMonths - visibleMonths} months remaining)
          </button>
        )}

        {/* Debt-free row */}
        {debtFreeLabel && (
          <div className="bg-positive/10 border-t-2 border-positive flex items-center justify-between px-4 py-3 rounded-b-lg">
            <div>
              <span className="text-sm font-medium text-positive">
                {debtFreeLabel}
              </span>
              <span className="text-xs text-muted-foreground ml-2">
                loan fully paid
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
