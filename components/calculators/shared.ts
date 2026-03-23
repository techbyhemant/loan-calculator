/**
 * Shared calculator styles — single source of truth.
 * Change these once → all 6+ calculators update consistently.
 */

export const CALC_STYLES = {
  /** Text input / NumericInput field */
  input:
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none",

  /** Input label */
  label: "block text-sm font-medium text-gray-700 mb-1",

  /** Section card (wraps a group of inputs or results) */
  card: "bg-white border border-gray-100 rounded-xl shadow-sm p-4 sm:p-6",

  /** Result stat card (single value display) */
  statCard: "bg-white border border-gray-100 rounded-xl shadow-sm p-4 text-center",

  /** Section heading inside a card */
  sectionTitle: "text-lg font-semibold text-gray-900 mb-4",

  /** Grid for 2-column input layout */
  inputGrid: "grid grid-cols-1 sm:grid-cols-2 gap-4",

  /** Toggle button — active state */
  toggleActive: "flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors bg-blue-600 text-white border-blue-600",

  /** Toggle button — inactive state */
  toggleInactive:
    "flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors bg-white text-gray-700 border-gray-200 hover:border-gray-300",

  /** Winner card ring */
  winnerRing: "border-green-300 ring-2 ring-green-100",

  /** Result table */
  table: "w-full text-sm",
  tableHead: "bg-gray-50",
  tableHeadCell: "text-left px-4 py-3 font-medium text-gray-700",
  tableHeadCellRight: "text-right px-4 py-3 font-medium text-gray-700",
  tableRow: "divide-y divide-gray-100",
  tableCell: "px-4 py-3 text-gray-600",
  tableCellRight: "px-4 py-3 text-right font-medium",

  /** Verdict banners */
  verdictGood: "rounded-xl p-4 text-center font-semibold text-lg bg-green-50 text-green-800 border border-green-200",
  verdictBad: "rounded-xl p-4 text-center font-semibold text-lg bg-red-50 text-red-800 border border-red-200",
  verdictNeutral: "rounded-xl p-4 text-center font-semibold text-lg bg-amber-50 text-amber-800 border border-amber-200",

  /** Info/warning callouts */
  calloutInfo: "bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700",
  calloutWarning: "text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm",
} as const;
