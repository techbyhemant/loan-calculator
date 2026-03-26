/**
 * Freshness Scanner — Identifies blog posts that need updating.
 *
 * A post needs updating when:
 * 1. It's older than 90 days and contains rate-sensitive data
 * 2. RBI rate has changed since post was published
 * 3. Tax limits have changed (new financial year)
 * 4. A referenced calculator has been significantly updated
 * 5. It's a "best rates" post and rates have moved
 *
 * Output: A list of posts to refresh, with reason and priority.
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface StalePost {
  slug: string;
  title: string;
  publishedAt: string;
  ageInDays: number;
  reasons: string[];
  priority: 'high' | 'medium' | 'low';
  suggestedAction: 'update-facts' | 'rewrite' | 'add-section';
}

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');

// Keywords that indicate rate-sensitive content
const RATE_SENSITIVE_KEYWORDS = [
  'repo rate', 'interest rate', 'rbi', 'mpc',
  'best rate', 'current rate', 'latest rate',
  '2025', '2026', // year references become stale
  'fy 2025', 'fy 2026', 'fy25', 'fy26',
];

// Keywords that indicate tax-sensitive content
const TAX_SENSITIVE_KEYWORDS = [
  '80c', '24(b)', '24b', '80e', '80ee',
  'tax benefit', 'tax saving', 'deduction',
  'old regime', 'new regime', 'itr',
];

export function scanForStaleContent(): StalePost[] {
  const results: StalePost[] = [];

  if (!fs.existsSync(CONTENT_DIR)) return results;

  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.mdx') || f.endsWith('.md'));
  const now = new Date();

  for (const file of files) {
    const filePath = path.join(CONTENT_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(raw);

    const slug = frontmatter.slug || file.replace(/\.mdx?$/, '');
    const publishedAt = frontmatter.publishedAt || frontmatter.date;
    if (!publishedAt) continue;

    const pubDate = new Date(publishedAt);
    const ageInDays = Math.floor((now.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24));
    const contentLower = content.toLowerCase();
    const titleLower = (frontmatter.title || '').toLowerCase();

    const reasons: string[] = [];

    // Check age
    if (ageInDays > 180) {
      reasons.push(`Post is ${ageInDays} days old (>6 months)`);
    } else if (ageInDays > 90) {
      reasons.push(`Post is ${ageInDays} days old (>3 months)`);
    }

    // Check rate-sensitive content
    const isRateSensitive = RATE_SENSITIVE_KEYWORDS.some(kw =>
      contentLower.includes(kw) || titleLower.includes(kw)
    );
    if (isRateSensitive && ageInDays > 60) {
      reasons.push('Contains rate-sensitive data and is >60 days old');
    }

    // Check tax-sensitive content
    const isTaxSensitive = TAX_SENSITIVE_KEYWORDS.some(kw =>
      contentLower.includes(kw) || titleLower.includes(kw)
    );
    if (isTaxSensitive && ageInDays > 120) {
      reasons.push('Contains tax-related data — may need FY update');
    }

    // Check for year references that are now stale
    const currentYear = now.getFullYear();
    const lastYear = currentYear - 1;
    if (contentLower.includes(String(lastYear)) && !contentLower.includes(String(currentYear))) {
      reasons.push(`References ${lastYear} but not ${currentYear} — year update needed`);
    }

    // Check for specific rate values that may have changed
    const rateRegex = /repo rate.*?(\d+\.?\d*)\s*%/i;
    const rateMatch = content.match(rateRegex);
    if (rateMatch) {
      const mentionedRate = parseFloat(rateMatch[1]);
      const currentRate = 5.25; // Should come from fact-injector
      if (Math.abs(mentionedRate - currentRate) > 0.01) {
        reasons.push(`Mentions repo rate ${mentionedRate}% but current rate is ${currentRate}%`);
      }
    }

    if (reasons.length === 0) continue;

    // Determine priority
    let priority: StalePost['priority'] = 'low';
    if (reasons.some(r => r.includes('rate-sensitive') || r.includes('repo rate'))) {
      priority = 'high';
    } else if (reasons.some(r => r.includes('>6 months') || r.includes('year update'))) {
      priority = 'medium';
    }

    // Determine action
    let suggestedAction: StalePost['suggestedAction'] = 'update-facts';
    if (ageInDays > 365) {
      suggestedAction = 'rewrite';
    } else if (reasons.some(r => r.includes('FY update'))) {
      suggestedAction = 'add-section';
    }

    results.push({
      slug,
      title: frontmatter.title || slug,
      publishedAt: publishedAt,
      ageInDays,
      reasons,
      priority,
      suggestedAction,
    });
  }

  // Sort by priority (high first), then by age (oldest first)
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  results.sort((a, b) => {
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (pDiff !== 0) return pDiff;
    return b.ageInDays - a.ageInDays;
  });

  return results;
}

/**
 * Get the single most urgent post to update today.
 * Returns null if nothing needs updating.
 */
export function getMostUrgentUpdate(): StalePost | null {
  const stale = scanForStaleContent();
  return stale.length > 0 ? stale[0] : null;
}

// CLI mode
if (require.main === module) {
  const stale = scanForStaleContent();
  if (stale.length === 0) {
    console.log('All posts are fresh — nothing to update.');
  } else {
    console.log(`\n${stale.length} posts need attention:\n`);
    for (const post of stale) {
      const icon = post.priority === 'high' ? '[HIGH]' : post.priority === 'medium' ? '[MED]' : '[LOW]';
      console.log(`${icon} ${post.title}`);
      console.log(`   Slug: ${post.slug}`);
      console.log(`   Age: ${post.ageInDays} days`);
      console.log(`   Action: ${post.suggestedAction}`);
      for (const reason of post.reasons) {
        console.log(`   -> ${reason}`);
      }
      console.log('');
    }
  }
}
