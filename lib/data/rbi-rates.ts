// Single source of truth for the RBI repo rate across the entire app.
// Update ONE file — `data/rbi-rates.json` — after every MPC meeting; every
// consumer (pages, components, blog prompts) reads from this loader.
//
// Why a loader (vs importing JSON directly):
//   1. Type safety — callers get typed values, not `any`
//   2. Derived helpers (typical home loan rate, month-year labels) without
//      repeating the math at every call site
//   3. Future-proofs a migration to an API/database without touching callers

import rbiRatesData from "@/data/rbi-rates.json";

export interface RateHistoryEntry {
  /** MPC meeting label, e.g. "Feb 2026". */
  date: string;
  /** Repo rate % after the meeting. */
  rate: number;
  /** Change from previous meeting (negative = cut, positive = hike, 0 = hold). */
  change: number;
}

interface RbiRatesConfig {
  currentRate: number;
  lastUpdated: string;
  nextMPCExpected: string;
  typicalHomeLoanSpread: number;
  history: RateHistoryEntry[];
}

// Cast via unknown first — JSON imports come in as any in strict mode.
const DATA = rbiRatesData as unknown as RbiRatesConfig;

/** Current RBI repo rate as a number (e.g. 5.25). */
export function getCurrentRepoRate(): number {
  return DATA.currentRate;
}

/** ISO date string of when the current rate was set. */
export function getRateLastUpdated(): string {
  return DATA.lastUpdated;
}

/** ISO date string of the next expected MPC meeting. */
export function getNextMPCDate(): string {
  return DATA.nextMPCExpected;
}

/** Full MPC history, newest last. */
export function getRateHistory(): RateHistoryEntry[] {
  return DATA.history;
}

/** Most recent MPC entry. */
export function getLatestRateEntry(): RateHistoryEntry {
  return DATA.history[DATA.history.length - 1];
}

/**
 * Representative floating home loan rate = repo + typical bank spread.
 * Used anywhere the app needs "approximate current home loan rate" for examples.
 * NOT the user's actual rate — users enter their own in calculators.
 */
export function getTypicalHomeLoanRate(): number {
  return Number((DATA.currentRate + DATA.typicalHomeLoanSpread).toFixed(2));
}

/**
 * Friendly "As of Feb 2026" style label, derived from lastUpdated.
 * Useful for freshness-dated copy in prompts and pages.
 */
export function getRateAsOfLabel(): string {
  const [year, month] = DATA.lastUpdated.split("-");
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const monthIdx = parseInt(month, 10) - 1;
  return `${monthNames[monthIdx]} ${year}`;
}
