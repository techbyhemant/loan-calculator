"use client";

import React, { Suspense } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

function AnalyticsPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;
    const query = searchParams?.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    // @ts-expect-error gtag is set by the injected script at runtime
    window.gtag?.("config", GA_MEASUREMENT_ID, { page_path: url });
  }, [pathname, searchParams]);

  return null;
}

export function Analytics(): React.ReactElement | null {
  if (!GA_MEASUREMENT_ID) return null;

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
