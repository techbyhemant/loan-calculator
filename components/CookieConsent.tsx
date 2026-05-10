"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Cookie consent banner — DPDP Act 2023 compliance.
 *
 * The DPDP Act (in force in India from 2024) requires explicit consent
 * before placing tracking cookies. We use Google Analytics 4 and
 * Microsoft Clarity, both of which set tracking cookies. This banner
 * gates them: nothing tracks until the user explicitly accepts.
 *
 * Design choices, given the LastEMI brand:
 *   - Default state: NO consent (privacy-by-default)
 *   - Reject is equally prominent as Accept (no dark pattern)
 *   - Single click resolves; banner does not nag
 *   - Choice persists in localStorage; no server-side storage of consent
 *   - Granular control linked from the banner (not an opaque "manage all")
 *
 * The consent state is read by:
 *   - components/Analytics.tsx (gates GA loading)
 *   - app/layout.tsx (gates the Clarity script)
 *
 * Both check `window.__consent === "accepted"` before initialising.
 */

const STORAGE_KEY = "lastemi_cookie_consent_v1";

declare global {
  interface Window {
    __consent?: "accepted" | "rejected";
  }
}

function readStoredConsent(): "accepted" | "rejected" | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "accepted" || v === "rejected") return v;
  } catch {
    // localStorage unavailable (private browsing, blocked); treat as null
  }
  return null;
}

function writeStoredConsent(value: "accepted" | "rejected") {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ignore — banner will reappear next session, acceptable trade-off
  }
  if (typeof window !== "undefined") {
    window.__consent = value;
    // Notify any listeners (Analytics component) that consent has changed
    window.dispatchEvent(new CustomEvent("lastemi:consent-changed", { detail: value }));
  }
}

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const stored = readStoredConsent();
    if (stored) {
      // Hydrate the global so Analytics / Clarity can initialise immediately
      if (typeof window !== "undefined") window.__consent = stored;
      return; // already decided, no banner
    }
    // Small delay so the banner doesn't flash immediately on every page load
    const t = setTimeout(() => setShow(true), 800);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  const accept = () => {
    writeStoredConsent("accepted");
    setShow(false);
  };
  const reject = () => {
    writeStoredConsent("rejected");
    setShow(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg"
    >
      <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
        <div className="flex-1 text-sm text-foreground">
          <p>
            We use a couple of analytics cookies (Google Analytics, Microsoft
            Clarity) to understand how the site is used. We do not sell your
            data, do not share it with banks, and do not capture your phone
            number. See our{" "}
            <Link
              href="/privacy"
              className="text-primary underline font-medium"
            >
              Privacy Policy
            </Link>{" "}
            for details.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={reject}
            className="text-sm font-medium px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-foreground"
          >
            Reject
          </button>
          <button
            onClick={accept}
            className="text-sm font-medium px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
