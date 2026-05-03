import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/lib/db/schema";
import { authConfig } from "@/auth.config";

// Full NextAuth config — extends the Edge-safe authConfig with:
//   - The Drizzle adapter for DB-touching flows (account creation,
//     magic-link verification token storage)
//   - The Resend (email magic link) provider, which can't live in the
//     Edge config because it requires an adapter
//
// This file is the ONLY place that imports `db` (postgres-js, Node-only).
// The /api/auth/[...nextauth] route uses these handlers and runs in Node.
//
// For Edge-runtime contexts (the tRPC route at /api/trpc), import the slim
// auth from `lib/auth/edge.ts` instead — that one skips the adapter and
// only validates JWTs (no DB touch).

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  debug: process.env.NODE_ENV === "development",
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  // Extend the slim provider list (Google) with email magic link.
  providers: [
    ...authConfig.providers,
    ...(process.env.RESEND_API_KEY
      ? [
          Resend({
            apiKey: process.env.RESEND_API_KEY,
            from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
          }),
        ]
      : []),
  ],
});
