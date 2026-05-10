"use client";

import React, { Suspense, useEffect, useState } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function AnalyticsPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;
    if (typeof window === "undefined") return;
    if (window.__consent !== "accepted") return; // gated on consent
    const query = searchParams?.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    window.gtag?.("config", GA_MEASUREMENT_ID, { page_path: url });
  }, [pathname, searchParams]);

  return null;
}

/**
 * Analytics loader. Two layers of gating:
 *   1. The actual <Script> tags only render when consentGiven === true.
 *   2. Reacts to consent changes via the "lastemi:consent-changed" event
 *      dispatched by CookieConsent. So if a user accepts mid-session,
 *      analytics initialises without a page reload.
 *
 * If a user later revokes consent (rare today since we don't expose UI
 * for it yet — TODO), the GA cookies remain until they expire naturally.
 * That's a known limitation; full revocation would need an explicit
 * cookie-purge step.
 */
export function Analytics(): React.ReactElement | null {
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Hydrate from whatever the CookieConsent component set on mount.
    setConsentGiven(window.__consent === "accepted");

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<"accepted" | "rejected">).detail;
      setConsentGiven(detail === "accepted");
    };
    window.addEventListener("lastemi:consent-changed", onChange);
    return () =>
      window.removeEventListener("lastemi:consent-changed", onChange);
  }, []);

  if (!GA_MEASUREMENT_ID) return null;
  if (!consentGiven) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="lazyOnload"
      />
      <Script id="ga-init" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = window.gtag || function(){dataLayer.push(arguments);};
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
        `}
      </Script>
      <Suspense fallback={null}>
        <AnalyticsPageview />
      </Suspense>
    </>
  );
}

export default Analytics;
