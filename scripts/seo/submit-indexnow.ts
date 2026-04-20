/**
 * Submit all site URLs to IndexNow (Bing, Yandex, DuckDuckGo, ChatGPT search)
 * Run: npx tsx scripts/seo/submit-indexnow.ts
 *
 * IndexNow indexes URLs within minutes on Bing/Yandex.
 * DuckDuckGo and ChatGPT search also consume IndexNow data.
 */

export {};

const INDEXNOW_KEY = "34eb3762e4f83b0d19f6a1df92520d6b";
const HOST = "lastemi.com";
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

const URLS = [
  // Homepage
  "/",
  // Calculators — Loan
  "/calculators/sip-vs-prepayment",
  "/calculators/home-loan-eligibility",
  "/calculators/tax-benefit",
  "/calculators/rent-vs-buy",
  "/calculators/balance-transfer",
  "/calculators/salary-to-emi",
  "/calculators/personal-loan-payoff",
  "/calculators/car-loan-prepayment",
  "/calculators/education-loan-80e",
  "/calculators/consumer-emi-true-cost",
  "/calculators/multi-loan-planner",
  // Calculators — Credit Card
  "/calculators/credit-card-payoff",
  "/calculators/minimum-due-trap",
  "/calculators/cc-vs-personal-loan",
  "/calculators/multi-card-payoff",
  // Other pages
  "/rbi-rates",
  "/pricing",
  "/blog",
  "/about",
  "/editorial-standards",
];

async function submitToIndexNow() {
  const fullUrls = URLS.map((path) => `https://${HOST}${path}`);

  console.log(`\n📤 Submitting ${fullUrls.length} URLs to IndexNow...\n`);

  // Submit to Bing (primary IndexNow endpoint)
  const engines = [
    { name: "Bing", url: "https://api.indexnow.org/indexnow" },
  ];

  for (const engine of engines) {
    try {
      const body = {
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: KEY_LOCATION,
        urlList: fullUrls,
      };

      const res = await fetch(engine.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok || res.status === 200 || res.status === 202) {
        console.log(`✅ ${engine.name}: Accepted (${res.status})`);
      } else {
        const text = await res.text();
        console.log(`⚠️ ${engine.name}: ${res.status} — ${text}`);
      }
    } catch (err) {
      console.error(`❌ ${engine.name}: Failed —`, (err as Error).message);
    }
  }

  // Google deprecated /ping in June 2023 and Bing removed its sitemap ping too —
  // neither endpoint does anything useful today. Rely on:
  //   - IndexNow (above) for Bing, Yandex, DuckDuckGo, ChatGPT Search
  //   - Google Search Console (verify once, it auto-fetches sitemap.xml)

  console.log("\n🎉 Done! URLs submitted via IndexNow (Bing/Yandex/DDG).");
  console.log("   For Google: ensure sitemap is registered in Search Console.\n");
}

submitToIndexNow();
