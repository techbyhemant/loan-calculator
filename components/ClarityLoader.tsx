"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const CLARITY_ID = "w2axpexouw"; // hardcoded — same value the previous inline script used

/**
 * Microsoft Clarity loader, gated on cookie consent.
 *
 * Subscribes to the same "lastemi:consent-changed" event the
 * CookieConsent + Analytics components use. Renders the Clarity
 * <Script> only after the user has explicitly accepted analytics
 * cookies. Stays hidden if rejected.
 *
 * If a user accepts mid-session, Clarity initialises immediately —
 * no page reload required.
 */
export function ClarityLoader() {
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setConsentGiven(window.__consent === "accepted");

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<"accepted" | "rejected">).detail;
      setConsentGiven(detail === "accepted");
    };
    window.addEventListener("lastemi:consent-changed", onChange);
    return () =>
      window.removeEventListener("lastemi:consent-changed", onChange);
  }, []);

  if (!consentGiven) return null;

  return (
    <Script id="ms-clarity" strategy="lazyOnload">
      {`
        (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i+"?ref=bwt";y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");
      `}
    </Script>
  );
}
