// `lib/auth.ts` is the public surface for read-only session checks —
// `auth()` calls in Server Components, server route handlers, server
// actions. It re-exports the slim Edge-safe `auth()` so the heavy
// DrizzleAdapter + Resend provider DON'T get bundled into every page
// that just wants to check "is the user signed in?".
//
// Bundling them in caused NextAuth to fire MissingAdapter at runtime on
// dashboard SSR: every dashboard request loaded the full module, which
// validates the email provider against the adapter, and any adapter
// initialization weirdness cascaded into a 500.
//
// The FULL config (adapter + email magic link + account linking) lives
// in `lib/auth/handlers.ts` and is imported only by `[...nextauth]/route.ts`
// — the single route that actually runs sign-in flows.
//
// Client components import signIn/signOut from `next-auth/react` directly.

export { authEdge as auth } from "@/lib/auth/edge";
