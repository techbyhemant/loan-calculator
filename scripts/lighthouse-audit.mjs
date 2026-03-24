#!/usr/bin/env node
/**
 * Lighthouse Audit Script
 *
 * Runs Lighthouse on all public pages and outputs a summary JSON.
 *
 * Usage:
 *   1. Start your dev server: npm run dev
 *   2. Run: node scripts/lighthouse-audit.mjs
 *   3. Copy the output summary and paste into Claude Code to fix issues
 *
 * Requirements: npm install -D lighthouse chrome-launcher
 */

import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { writeFileSync } from 'fs';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// All public (non-auth) pages to audit
const PAGES = [
  '/',
  '/calculators/sip-vs-prepayment',
  '/calculators/home-loan-eligibility',
  '/calculators/tax-benefit',
  '/calculators/salary-to-emi',
  '/calculators/rent-vs-buy',
  '/calculators/balance-transfer',
  '/blog',
  '/rbi-rates',
  '/pricing',
  '/about',
  '/editorial-standards',
  '/login',
];

const THRESHOLDS = {
  performance: 90,
  accessibility: 95,
  'best-practices': 90,
  seo: 95,
};

async function runAudit(url, chrome) {
  const result = await lighthouse(url, {
    port: chrome.port,
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    formFactor: 'mobile',
    screenEmulation: {
      mobile: true,
      width: 375,
      height: 812,
      deviceScaleFactor: 3,
    },
    throttling: {
      cpuSlowdownMultiplier: 4,
      downloadThroughputKbps: 1600,
      uploadThroughputKbps: 750,
      rttMs: 150,
    },
  });

  const lhr = JSON.parse(result.report);

  const scores = {};
  for (const [key, cat] of Object.entries(lhr.categories)) {
    scores[key] = Math.round(cat.score * 100);
  }

  // Extract failing audits with actionable details
  const issues = [];
  for (const [id, audit] of Object.entries(lhr.audits)) {
    if (audit.score !== null && audit.score < 1 && audit.scoreDisplayMode !== 'informative') {
      const issue = {
        id,
        title: audit.title,
        score: Math.round(audit.score * 100),
        description: audit.description?.split('[Learn more]')[0]?.trim(),
        displayValue: audit.displayValue || null,
      };

      // Include specific items for actionable fixes (first 3 only to keep output manageable)
      if (audit.details?.items?.length > 0) {
        issue.items = audit.details.items.slice(0, 3).map(item => {
          const clean = {};
          if (item.node?.selector) clean.selector = item.node.selector;
          if (item.node?.snippet) clean.snippet = item.node.snippet?.substring(0, 200);
          if (item.url) clean.url = item.url;
          if (item.totalBytes) clean.totalBytes = item.totalBytes;
          if (item.wastedMs) clean.wastedMs = item.wastedMs;
          if (item.wastedBytes) clean.wastedBytes = item.wastedBytes;
          return Object.keys(clean).length > 0 ? clean : null;
        }).filter(Boolean);
      }

      issues.push(issue);
    }
  }

  // Core Web Vitals
  const cwv = {
    LCP: lhr.audits['largest-contentful-paint']?.displayValue,
    FID: lhr.audits['max-potential-fid']?.displayValue,
    CLS: lhr.audits['cumulative-layout-shift']?.displayValue,
    FCP: lhr.audits['first-contentful-paint']?.displayValue,
    TBT: lhr.audits['total-blocking-time']?.displayValue,
    SI: lhr.audits['speed-index']?.displayValue,
  };

  return { url, scores, cwv, issues };
}

async function main() {
  console.log('🔍 Starting Lighthouse audit...\n');

  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox'] });
  const results = [];
  const failures = [];

  for (const page of PAGES) {
    const url = `${BASE_URL}${page}`;
    process.stdout.write(`  Auditing ${page}...`);

    try {
      const result = await runAudit(url, chrome);
      results.push(result);

      const fail = Object.entries(result.scores).some(
        ([key, score]) => score < THRESHOLDS[key]
      );
      if (fail) failures.push(result);

      const status = fail ? '⚠️' : '✅';
      console.log(` ${status} P:${result.scores.performance} A:${result.scores.accessibility} BP:${result.scores['best-practices']} SEO:${result.scores.seo}`);
    } catch (err) {
      console.log(` ❌ Error: ${err.message}`);
      results.push({ url, error: err.message });
    }
  }

  await chrome.kill();

  // Write full report
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    thresholds: THRESHOLDS,
    summary: {
      totalPages: PAGES.length,
      passing: PAGES.length - failures.length,
      failing: failures.length,
    },
    results,
  };

  writeFileSync('lighthouse-report.json', JSON.stringify(report, null, 2));

  // Write a Claude-friendly summary of just the issues
  if (failures.length > 0) {
    console.log('\n\n--- ISSUES TO FIX (paste this into Claude Code) ---\n');

    const summary = failures.map(f => ({
      page: f.url.replace(BASE_URL, ''),
      scores: f.scores,
      cwv: f.cwv,
      topIssues: f.issues
        .sort((a, b) => a.score - b.score)
        .slice(0, 10),
    }));

    const output = JSON.stringify(summary, null, 2);
    console.log(output);
    writeFileSync('lighthouse-issues.json', output);
    console.log('\n\nSaved to: lighthouse-issues.json');
    console.log('→ Run: cat lighthouse-issues.json | pbcopy');
    console.log('→ Then paste into Claude Code and ask it to fix the issues');
  } else {
    console.log('\n✅ All pages pass thresholds!');
  }
}

main().catch(console.error);
