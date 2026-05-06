import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/lib/db/schema";
import { authConfig } from "@/auth.config";
import { isBootstrapAdminEmail } from "@/lib/utils/admin";

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
  events: {
    // Bootstrap-admin promotion. Runs on every successful sign-in.
    // If the user's email is in ADMIN_EMAILS but their users.is_admin
    // flag is still FALSE, flip it to TRUE so future sessions see the
    // persisted DB value (and can't be revoked from env alone).
    //
    // We never demote here. Removing an admin requires either editing
    // users.is_admin via the /admin/admins UI or a manual SQL update.
    // That's intentional — env removal alone shouldn't yank access.
    signIn: async ({ user }) => {
      if (!user?.id || !user?.email) return;
      if (!isBootstrapAdminEmail(user.email)) return;
      // Already admin? skip the write.
      const existing = (user as { isAdmin?: boolean }).isAdmin;
      if (existing === true) return;
      try {
        await db
          .update(users)
          .set({ isAdmin: true, updatedAt: new Date() })
          .where(eq(users.id, user.id as string));
      } catch (err) {
        // Don't fail sign-in if the promotion write hiccups — log and
        // move on. The user will retry the env check next time they sign in.
        console.error("[auth.events.signIn] bootstrap admin promote failed:", err);
      }
    },
  },
});
