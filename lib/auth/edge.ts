import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge-safe `auth()` — uses ONLY the slim authConfig (no DrizzleAdapter,
// no postgres-js). With session.strategy === "jwt", auth() just decodes
// the JWT cookie; no DB hit. Safe to import from any runtime.
//
// Use this from the tRPC API route (which runs on Edge for ~5ms cold
// starts and Mumbai-region execution on Vercel free).
//
// Don't use this for sign-in flows — those need the full adapter from
// `lib/auth.ts`.

export const { auth: authEdge } = NextAuth(authConfig);
