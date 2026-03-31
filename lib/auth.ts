import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/lib/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: process.env.NODE_ENV === "development",
  trustHost: true,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    ...(process.env.RESEND_API_KEY
      ? [
          Resend({
            apiKey: process.env.RESEND_API_KEY,
            from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
          }),
        ]
      : []),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      // Only query DB on sign-in (not on every request)
      if (user) {
        token.id = user.id;
        token.plan = (user as { plan?: string }).plan ?? "free";
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    session: async ({ session, token }) => {
      // Pure JWT read — no DB query
      session.user.id = token.id as string;
      session.user.email = token.email as string;
      session.user.name = token.name as string;
      (session.user as { plan?: string }).plan = token.plan as string;
      return session;
    },
  },
  pages: { signIn: "/login", error: "/login" },
});
