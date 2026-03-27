/**
 * Submit URLs to Google Indexing API for fast indexing.
 *
 * Setup:
 * 1. Enable Indexing API in Google Cloud Console
 * 2. Create a service account + download JSON key
 * 3. Add service account email as Owner in Search Console
 * 4. Set GOOGLE_INDEXING_KEY_PATH env var to the JSON key file path
 *
 * Run: npx tsx scripts/seo/submit-google-indexing.ts
 */

export {};

const URLS = [
  "https://lastemi.com/",
  "https://lastemi.com/calculators/sip-vs-prepayment",
  "https://lastemi.com/calculators/credit-card-payoff",
  "https://lastemi.com/calculators/minimum-due-trap",
  "https://lastemi.com/calculators/home-loan-eligibility",
  "https://lastemi.com/calculators/tax-benefit",
  "https://lastemi.com/calculators/multi-loan-planner",
  "https://lastemi.com/calculators/personal-loan-payoff",
  "https://lastemi.com/calculators/car-loan-prepayment",
  "https://lastemi.com/calculators/cc-vs-personal-loan",
  "https://lastemi.com/rbi-rates",
  "https://lastemi.com/blog",
];

async function getAccessToken(): Promise<string> {
  const crypto = await import("crypto");

  // Support two methods:
  // 1. GOOGLE_INDEXING_KEY_JSON — full JSON string in env var (for Vercel/production)
  // 2. GOOGLE_INDEXING_KEY_PATH — path to JSON file (for local dev)
  let key: { client_email: string; private_key: string };

  if (process.env.GOOGLE_INDEXING_KEY_JSON) {
    key = JSON.parse(process.env.GOOGLE_INDEXING_KEY_JSON);
  } else if (process.env.GOOGLE_INDEXING_KEY_PATH) {
    const fs = await import("fs");
    key = JSON.parse(fs.readFileSync(process.env.GOOGLE_INDEXING_KEY_PATH, "utf-8"));
  } else {
    console.log("\n⚠️  Google Indexing API key not configured.\n");
    console.log("   Option A (recommended for production):");
    console.log("   Set GOOGLE_INDEXING_KEY_JSON with the full JSON content in .env.local\n");
    console.log("   Option B (local dev):");
    console.log("   Set GOOGLE_INDEXING_KEY_PATH=/path/to/key.json in .env.local\n");
    console.log("   Setup steps:");
    console.log("   1. Enable Indexing API at console.cloud.google.com");
    console.log("   2. Create service account → download JSON key");
    console.log("   3. Add service account email as Owner in Search Console");
    process.exit(1);
  }

  // Create JWT
  const header = Buffer.from(
    JSON.stringify({ alg: "RS256", typ: "JWT" })
  ).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      iss: key.client_email,
      scope: "https://www.googleapis.com/auth/indexing",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  ).toString("base64url");

  const signature = crypto.sign(
    "sha256",
    Buffer.from(`${header}.${payload}`),
    key.private_key
  );
  const jwt = `${header}.${payload}.${signature.toString("base64url")}`;

  // Exchange JWT for access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = (await tokenRes.json()) as { access_token: string };
  return tokenData.access_token;
}

async function submitUrl(accessToken: string, url: string): Promise<void> {
  const res = await fetch(
    "https://indexing.googleapis.com/v3/urlNotifications:publish",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        url,
        type: "URL_UPDATED",
      }),
    }
  );

  if (res.ok) {
    console.log(`  OK: ${url}`);
  } else {
    const err = await res.text();
    console.log(`  FAIL: ${url} -- ${res.status}: ${err}`);
  }
}

async function main() {
  console.log("\nSubmitting URLs to Google Indexing API...\n");

  const accessToken = await getAccessToken();

  for (const url of URLS) {
    await submitUrl(accessToken, url);
    // Rate limit: 1 request per second
    await new Promise((r) => setTimeout(r, 1100));
  }

  console.log(`\nDone. Submitted ${URLS.length} URLs to Google.\n`);
}

main();
