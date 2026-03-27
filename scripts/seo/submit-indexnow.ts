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

  // Also ping Google sitemap
  console.log("\n📤 Pinging Google sitemap...");
  try {
    const googleRes = await fetch(
      `https://www.google.com/ping?sitemap=https://${HOST}/sitemap.xml`
    );
    console.log(`✅ Google sitemap ping: ${googleRes.status}`);
  } catch (err) {
    console.error("❌ Google ping failed:", (err as Error).message);
  }

  // Ping Bing sitemap
  console.log("📤 Pinging Bing sitemap...");
  try {
    const bingRes = await fetch(
      `https://www.bing.com/ping?sitemap=https://${HOST}/sitemap.xml`
    );
    console.log(`✅ Bing sitemap ping: ${bingRes.status}`);
  } catch (err) {
    console.error("❌ Bing ping failed:", (err as Error).message);
  }

  console.log("\n🎉 Done! URLs should appear in Bing within minutes.");
  console.log("   Google typically takes 2-7 days after sitemap ping.\n");
}

submitToIndexNow();
