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

// Full NextAuth config — Drizzle adapter + Resend (email magic link).
// Imported ONLY by `app/api/auth/[...nextauth]/route.ts`.
// This isolation keeps the adapter + email provider out of every other
// SSR bundle (dashboard, layout, pricing) where they would otherwise
// trip MissingAdapter under any adapter weirdness.

export const { handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  debug: process.env.NODE_ENV === "development",
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
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
