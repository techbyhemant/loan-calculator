/**
 * Admin access control. The list of admin emails comes from the
 * ADMIN_EMAILS env var (comma-separated). Falls back to a hard-coded
 * default so the system always has at least one admin even if the env
 * var is misconfigured.
 *
 * isAdmin is checked in two places:
 *  - app/admin/layout.tsx — server-side route gate, redirects non-admins
 *  - server/trpc.ts adminProcedure — rejects mutations from non-admins
 *
 * Don't trust client-side checks alone. The route layout gate keeps
 * non-admins from seeing the UI; the tRPC procedure check keeps a
 * malicious actor from calling admin mutations directly.
 */

const HARDCODED_FALLBACK = ["hbnker31@gmail.com"];

function getAdminEmails(): string[] {
  const fromEnv = process.env.ADMIN_EMAILS;
  if (!fromEnv) return HARDCODED_FALLBACK;
  return fromEnv
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return getAdminEmails().includes(normalized);
}
