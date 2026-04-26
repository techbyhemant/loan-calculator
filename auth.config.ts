import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";

// Edge-compatible NextAuth config. NO adapter, NO DB import. JWT-only.
// This file is safe to import from any runtime (Edge, Node, middleware).
//
// The Drizzle adapter and DB-touching providers live in `lib/auth.ts` which
// is the *full* config used during sign-in flows that need to write to DB.
// For session validation (which is what every tRPC request does), JWT
// strategy means no DB touch — just JWT cookie decode. So this slim config
// is enough for `auth()` calls in Edge contexts.
//
// Why this matters: the tRPC route runs on Edge runtime, so its createContext
// must use an auth() that doesn't transitively import postgres-js (which
// uses Node TCP and crashes Edge). This file is that import boundary.

export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
      if (user) {
        token.id = user.id;
        token.plan = (user as { plan?: string }).plan ?? "free";
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user.id = token.id as string;
      session.user.email = token.email as string;
      session.user.name = token.name as string;
      (session.user as { plan?: string }).plan = token.plan as string;
      return session;
    },
  },
  pages: { signIn: "/login", error: "/login" },
};
