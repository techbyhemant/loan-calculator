import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware handles:
 * 1. Return 410 (Gone) for known old-site URL patterns
 * 2. Redirect www → non-www (canonical domain: lastemi.com)
 * 3. Add X-Robots-Tag: noindex for 410/error responses
 */

// Old site URL patterns (games/video site with Thai content)
const OLD_PATH_PREFIXES = ["/video", "/game", "/games"];
// Query params that signal a ghost URL from the prior domain owner → 410 Gone
const GONE_QUERY_PARAMS = ["video", "juth"];

// Known-good query params used by the app. Anything outside this set on an
// otherwise-valid page triggers X-Robots-Tag: noindex, nofollow (page still
// renders for users, but search engines won't index the variant).
const ALLOWED_QUERY_PARAMS = new Set<string>([
  // Shareable calculator token
  "s",
  // User-facing calculator inputs (reserved for future shareable-link params)
  "amount",
  "rate",
  "tenure",
  "start",
  "emi",
  "type",
  // Attribution / affiliate
  "ref",
  // Marketing / ads
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "msclkid",
  // Next.js / auth
  "callbackUrl",
  "error",
  "code",
  "state",
]);

function goneHTML(path: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>410 Gone - LastEMI</title>
  <meta name="description" content="This page has been permanently removed." />
  <link rel="canonical" href="https://lastemi.com" />
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f9fafb; color: #374151;">
  <div style="text-align: center; max-width: 480px; padding: 2rem;">
    <h1 style="font-size: 3rem; margin: 0; color: #6b7280;">410</h1>
    <p style="font-size: 1.125rem; color: #9ca3af; margin: 0.5rem 0 1.5rem;">This page has been permanently removed.</p>
    <p style="font-size: 0.875rem; color: #9ca3af; margin-bottom: 1.5rem;">
      This domain previously hosted a different website. That content no longer exists.
    </p>
    <a href="https://lastemi.com" style="color: #4f46e5; text-decoration: none; font-weight: 500; font-size: 0.9375rem;">
      Visit LastEMI - India&apos;s Debt Freedom Platform &rarr;
    </a>
  </div>
</body>
</html>`;
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const host = request.headers.get("host") ?? "";

  // 1. Redirect www → non-www
  if (host.startsWith("www.")) {
    const nonWwwHost = host.replace(/^www\./, "");
    const url = request.nextUrl.clone();
    url.host = nonWwwHost;
    url.protocol = "https";
    return NextResponse.redirect(url, 301);
  }

  // 2. Return 410 for known old-site URL patterns
  const isOldPath = OLD_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );
  const hasGoneQueryParam = GONE_QUERY_PARAMS.some((param) =>
    searchParams.has(param),
  );

  if (isOldPath || hasGoneQueryParam) {
    return new NextResponse(goneHTML(pathname), {
      status: 410,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  }

  // 3. For valid paths with unknown query params, still serve the page but
  //    tell search engines not to index that variant. The canonical tag on
  //    the page points to the clean URL, so link equity is preserved.
  const response = NextResponse.next();

  const paramKeys = Array.from(searchParams.keys());
  const hasUnknownParam = paramKeys.some(
    (key) => !ALLOWED_QUERY_PARAMS.has(key),
  );
  if (paramKeys.length > 0 && hasUnknownParam) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - Static assets in public folder
     */
    "/((?!_next/static|_next/image|favicon\\.ico|favicon-.*\\.png|apple-touch-icon\\.png|images/|site\\.webmanifest|llms\\.txt).*)",
  ],
};
