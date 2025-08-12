"use client";

import React from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function sendPageview(url: string) {
  if (!GA_MEASUREMENT_ID) return;
  // @ts-expect-error gtag is set by the injected script at runtime
  window.gtag?.("config", GA_MEASUREMENT_ID, { page_path: url });
}

export function Analytics(): JSX.Element | null {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;
    const query = searchParams?.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    sendPageview(url);
  }, [pathname, searchParams]);

  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);} 
          window.gtag = window.gtag || function(){dataLayer.push(arguments);};
          gtag('js', new Date());
          // Disable automatic page_view to handle SPA navigations manually
          gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}

export default Analytics;
