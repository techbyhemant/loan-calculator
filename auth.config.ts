import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Edge-compatible NextAuth config. NO adapter, NO DB import. JWT-only.
// This file is safe to import from any runtime (Edge, Node, middleware).
//
// IMPORTANT: only providers that DON'T require a DB adapter belong here.
// Resend (email magic link) writes verification tokens to the DB, so its
// presence triggers a `MissingAdapter` error at NextAuth construction time
// — even if we never actively call the email flow from Edge. The full
// provider list lives in `lib/auth.ts` (Node runtime), which `[...nextauth]`
// route imports directly for sign-in flows.
//
// For session validation (which is what every tRPC request does), JWT
// strategy means no DB touch — just JWT cookie decode. Google as the only
// provider here is enough for NextAuth to construct cleanly; we don't
// actually invoke any provider, just validate the existing JWT cookie.

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
