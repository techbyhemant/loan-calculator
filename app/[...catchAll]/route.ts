/**
 * Catch-all route: returns 410 (Gone) for any URL not matched by a specific route.
 * This handles old site URLs that don't match the known patterns in middleware,
 * plus any other random/invalid URLs that Google may still have indexed.
 *
 * Next.js routing priority ensures this only runs for truly unmatched paths:
 * - Static routes (e.g., /pricing, /rbi-rates) take priority
 * - Dynamic routes (e.g., /blog/[slug]) take priority
 * - Convention routes (robots.txt, sitemap.xml, opengraph-image) take priority
 * - This catch-all runs last
 */

export async function GET() {
  return new Response(goneHTML(), {
    status: 410,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}

// Handle all HTTP methods to ensure 410 for POST, PUT, etc. too
export const HEAD = GET;
export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
export const PATCH = GET;

function goneHTML(): string {
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
    <p style="font-size: 1.125rem; color: #9ca3af; margin: 0.5rem 0 1rem;">This page has been permanently removed.</p>
    <p style="font-size: 0.875rem; color: #9ca3af; margin-bottom: 1.5rem;">
      This domain previously hosted a different website. That content no longer exists.
    </p>
    <a href="https://lastemi.com" style="color: #4f46e5; text-decoration: none; font-weight: 500;">
      Visit LastEMI &rarr;
    </a>
  </div>
</body>
</html>`;
}
