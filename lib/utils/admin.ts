/**
 * Admin access control. Hybrid model:
 *
 *   1. ADMIN_EMAILS env var lists "bootstrap" admins. When someone
 *      signs in with an email in this list, the auth callback flips
 *      their users.is_admin to TRUE. That way the very first admin
 *      can always self-bootstrap without manual SQL.
 *
 *   2. After bootstrap, day-to-day admin management lives in the DB.
 *      The /admin/admins page lets existing admins promote/revoke
 *      others by toggling users.is_admin — no deploy required.
 *
 * isAdmin checks ALWAYS read users.is_admin (via the session JWT,
 * which is populated from the DB on sign-in). The env var only
 * matters at sign-in time.
 *
 * Two layers of defence:
 *   - app/admin/layout.tsx — redirects non-admins server-side
 *   - server/trpc.ts adminProcedure — rejects mutations from non-admins
 */

const HARDCODED_FALLBACK = ["hbnker31@gmail.com"];

/** Bootstrap list — emails that should be auto-promoted on sign-in. */
export function getBootstrapAdminEmails(): string[] {
  const fromEnv = process.env.ADMIN_EMAILS;
  if (!fromEnv) return HARDCODED_FALLBACK;
  return fromEnv
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Returns true if the given email should be auto-promoted to admin
 * on sign-in. Use this only in the auth callback as a bootstrap hint.
 * Day-to-day checks should use the user's `isAdmin` flag from the
 * session, NOT this function — that flag is the source of truth.
 */
export function isBootstrapAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return getBootstrapAdminEmails().includes(normalized);
}

/**
 * Backwards-compatible alias. Old callers pass an email and want a
 * boolean. We now treat that as "should this email be considered admin
 * for bootstrap purposes" — which is the same answer for the env list,
 * just renamed for clarity.
 *
 * NOTE: this does NOT check the DB. Use session.user.isAdmin or the
 * users.is_admin column for the canonical check post-bootstrap.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  return isBootstrapAdminEmail(email);
}
