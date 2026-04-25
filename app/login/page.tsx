"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="bg-background min-h-screen" />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const isSavingCalculation = searchParams.get("save") === "true";
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    await signIn("resend", { email, callbackUrl: "/dashboard", redirect: false });
    setEmailSent(true);
    setLoading(false);
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <Image src="/long-logo-light.png" alt="LastEMI — Free EMI Calculator for India" width={160} height={46} className="mx-auto h-10 w-auto dark:hidden" />
          <Image src="/long-logo-dark.png" alt="LastEMI — Free EMI Calculator for India" width={160} height={46} className="mx-auto h-10 w-auto hidden dark:block" />
          <p className="text-sm text-muted-foreground mt-2">
            Track all your loans. Become debt-free faster.
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-foreground mb-2 text-center">
            Sign in to your account
          </h2>
          {isSavingCalculation && (
            <p className="text-sm text-muted-foreground text-center mb-4">
              Sign in to save your EMI calculation and track your loan.
            </p>
          )}
          {!isSavingCalculation && <div className="mb-4" />}

          {/* Google Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-card border border-border rounded-lg px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center my-5">
            <div className="flex-1 border-t border-border" />
            <span className="px-3 text-xs text-muted-foreground">or</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Email Magic Link */}
          {!showEmail ? (
            <button
              onClick={() => setShowEmail(true)}
              className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
            >
              Continue with Email
            </button>
          ) : emailSent ? (
            <div className="text-center">
              <div className="text-positive bg-positive/10 border border-positive/20 rounded-lg p-4 text-sm">
                <p className="font-semibold">Check your email!</p>
                <p className="mt-1">
                  We sent a sign-in link to <strong>{email}</strong>
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleEmailSignIn} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loading ? "Sending link..." : "Send sign-in link"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          No password needed. We use secure sign-in links.
        </p>
      </div>
    </div>
  );
}
