import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://lastemi.com";
  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/calculators/sip-vs-prepayment`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/calculators/home-loan-eligibility`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/calculators/tax-benefit`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/calculators/salary-to-emi`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/calculators/rent-vs-buy`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/calculators/balance-transfer`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/calculators/credit-card-payoff`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/calculators/minimum-due-trap`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/calculators/cc-vs-personal-loan`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/calculators/multi-card-payoff`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/calculators/multi-loan-planner`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/calculators/consumer-emi-true-cost`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/calculators/personal-loan-payoff`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/calculators/education-loan-80e`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/calculators/car-loan-prepayment`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    // Basic loan-type EMI calculators (high-volume head terms)
    { url: `${baseUrl}/calculators/gold-loan-emi`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/calculators/car-loan-emi`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/calculators/personal-loan-emi`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    // Programmatic home-loan-amount landing pages
    { url: `${baseUrl}/home-loan-emi-calculator`, lastModified: now, changeFrequency: "monthly", priority: 0.95 },
    { url: `${baseUrl}/home-loan-emi-calculator/15-lakh`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/home-loan-emi-calculator/20-lakh`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/home-loan-emi-calculator/25-lakh`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/home-loan-emi-calculator/50-lakh`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/home-loan-emi-calculator/60-lakh`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/home-loan-emi-calculator/75-lakh`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/home-loan-emi-calculator/90-lakh`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/home-loan-emi-calculator/1-crore`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/rbi-rates`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/editorial-standards`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];

  const posts = getAllPosts();
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.publishedAt,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [...staticPages, ...blogPages];
}
