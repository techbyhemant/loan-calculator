// Required env vars: MONGODB_URI, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, RESEND_API_KEY, NEXTAUTH_SECRET
// Set these in .env.local before auth will work

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient } from "mongodb";

// Lazy singleton — only attempts connection at runtime, not build time
let _clientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> {
  if (!_clientPromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      // Return a never-resolving promise during build to avoid crash
      return new Promise(() => {});
    }
    const client = new MongoClient(uri);
    _clientPromise = client.connect();
  }
  return _clientPromise;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY ?? "",
      from: "login@emipartpay.com",
    }),
  ],
  adapter: MongoDBAdapter(getClientPromise()),
  session: { strategy: "jwt" },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.plan = (user as { plan?: string }).plan ?? "free";
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user.id = token.id as string;
      (session.user as { plan?: string }).plan = token.plan as string;
      return session;
    },
  },
  pages: { signIn: "/login", error: "/login" },
});
