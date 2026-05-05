import { supabaseAdmin } from "@/lib/supabase/admin";
import { LIFETIME_CAMPAIGN } from "./planGating";

/**
 * Counts users who already bought the Founding Member Lifetime SKU and
 * returns how many spots are still available out of the campaign cap.
 *
 * Server-only — used by both the /pricing page (server component) and
 * the create-lifetime-order API route. Cached for 60 seconds at the
 * function level so we don't hammer Supabase on every page render
 * during the campaign period.
 *
 * Returns 0 if the campaign deadline has passed, even if spots remain.
 */
let cachedCount: { value: number; at: number } | null = null;
const CACHE_TTL_MS = 60 * 1000;

export async function getLifetimeSpotsRemaining(): Promise<number> {
  // Hard end-date overrides the spot count.
  if (new Date() > new Date(LIFETIME_CAMPAIGN.endsAt)) return 0;

  if (cachedCount && Date.now() - cachedCount.at < CACHE_TTL_MS) {
    return Math.max(0, LIFETIME_CAMPAIGN.totalSpots - cachedCount.value);
  }

  const { count, error } = await supabaseAdmin
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("plan_type", "lifetime");

  if (error) {
    console.error("[getLifetimeSpotsRemaining] Supabase error:", error);
    // Fail open — show the lifetime card. Better than hiding it on a
    // transient DB hiccup. The API route still has its own re-check.
    return LIFETIME_CAMPAIGN.totalSpots;
  }

  const taken = count ?? 0;
  cachedCount = { value: taken, at: Date.now() };
  return Math.max(0, LIFETIME_CAMPAIGN.totalSpots - taken);
}
