import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/lib/db/schema";
import { authConfig } from "@/auth.config";

// Full NextAuth config — extends the Edge-safe authConfig (providers,
// callbacks, JWT) with the Drizzle adapter for DB-touching flows
// (account creation, magic-link verification). This file is the ONLY
// place that imports `db` (postgres-js, Node-only).
//
// Use this `auth()` from Node runtime: server components, server actions,
// API routes that aren't on Edge.
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
});
