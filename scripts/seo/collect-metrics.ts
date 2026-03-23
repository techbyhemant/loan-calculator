import fs from "fs";
import path from "path";
import { loadPublishedTopics } from "../blog/autonomous/queue-manager";

const METRICS_DIR = path.join(process.cwd(), "data/seo-metrics");

interface WeeklyMetrics {
  date: string;
  totalPosts: number;
  newPostsThisWeek: number;
  googleSearchConsole: {
    totalImpressions: number | null;
    totalClicks: number | null;
    averagePosition: number | null;
    indexedPages: number | null;
  };
  aiVisibility: {
    checkedAt: string;
    chatgptMentions: number | null;
    perplexityMentions: number | null;
    geminiMentions: number | null;
    notes: string;
  };
  topRankingKeywords: string[];
}

function collectMetrics(): void {
  if (!fs.existsSync(METRICS_DIR)) {
    fs.mkdirSync(METRICS_DIR, { recursive: true });
  }

  const published = loadPublishedTopics();
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const newThisWeek = published.filter(
    (p) => new Date(p.publishedAt) > oneWeekAgo,
  ).length;

  const metrics: WeeklyMetrics = {
    date: now.toISOString(),
    totalPosts: published.length,
    newPostsThisWeek: newThisWeek,
    googleSearchConsole: {
      totalImpressions: null,
      totalClicks: null,
      averagePosition: null,
      indexedPages: null,
    },
    aiVisibility: {
      checkedAt: now.toISOString(),
      chatgptMentions: null,
      perplexityMentions: null,
      geminiMentions: null,
      notes: "",
    },
    topRankingKeywords: [],
  };

  const filename = `metrics-${now.toISOString().split("T")[0]}.json`;
  fs.writeFileSync(
    path.join(METRICS_DIR, filename),
    JSON.stringify(metrics, null, 2),
  );

  console.log(`\n📊 Weekly Metrics Template Created`);
  console.log(`   File: data/seo-metrics/${filename}`);
  console.log(`\n   Please fill in manually:`);
  console.log("   1. Google Search Console → Performance → Last 7 days");
  console.log("   2. AI visibility checks (see docs/ai-visibility-checks.md)");
  console.log(`\n   Auto-collected:`);
  console.log(`   - Total published posts: ${published.length}`);
  console.log(`   - New this week: ${newThisWeek}`);
}

collectMetrics();
