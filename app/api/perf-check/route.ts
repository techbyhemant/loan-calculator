import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

// Diagnostic-only endpoint. Hit https://lastemi.com/api/perf-check from
// your browser; the JSON response shows where the time goes.
//
//   coldStart  = function init time (Vercel cold-start cost)
//   firstQuery = end-to-end first DB query (handshake + round trip + Postgres)
//   warmQuery  = end-to-end second DB query (round trip only — handshake reused)
//
// If firstQuery − warmQuery is large (>200ms), the connection persistence
// fix is helping. If warmQuery is large (>100ms), it's pure network
// (Mumbai DB ↔ US East function) and only region migration solves it.
//
// REMOVE this file once perf is dialed in.

export const dynamic = "force-dynamic"; // never cache

let _coldStartAt: number | null = null;
const _moduleLoadedAt = Date.now();
if (_coldStartAt === null) _coldStartAt = _moduleLoadedAt;

export async function GET() {
  const requestStart = Date.now();
  const sinceModuleLoad = requestStart - _moduleLoadedAt;

  // First DB call — full path (TCP/TLS handshake if cold, then query)
  const q1Start = Date.now();
  await db.execute(sql`SELECT 1 as ping`);
  const q1Ms = Date.now() - q1Start;

  // Second DB call — same connection if everything is wired right
  const q2Start = Date.now();
  await db.execute(sql`SELECT 1 as ping`);
  const q2Ms = Date.now() - q2Start;

  // Third — should be even faster (warmest)
  const q3Start = Date.now();
  await db.execute(sql`SELECT 1 as ping`);
  const q3Ms = Date.now() - q3Start;

  return NextResponse.json({
    region: process.env.VERCEL_REGION ?? "unknown",
    nodeVersion: process.version,
    sinceModuleLoadMs: sinceModuleLoad,
    firstQueryMs: q1Ms,
    secondQueryMs: q2Ms,
    thirdQueryMs: q3Ms,
    interpretation: {
      isFunctionCold: sinceModuleLoad < 200,
      handshakeOverheadMs: Math.max(0, q1Ms - q3Ms),
      pureNetworkMs: q3Ms,
    },
    note:
      q3Ms > 200
        ? "Heavy steady-state latency — region mismatch dominates. See docs/perf-vercel-supabase-region.md."
        : q3Ms > 100
          ? "Moderate latency — usable, but could be improved with region pinning."
          : "DB latency is healthy.",
  });
}
