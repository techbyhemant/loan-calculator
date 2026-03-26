/**
 * Update Generator — Refreshes existing blog posts with current data.
 *
 * Instead of generating a completely new post, this:
 * 1. Reads the existing post content
 * 2. Identifies what's stale (rates, years, tax limits)
 * 3. Generates updated content using Groq
 * 4. Preserves the slug, URL, and SEO value
 * 5. Updates the publishedAt/lastReviewed dates
 *
 * This is critical for SEO — Google rewards freshly updated content.
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Groq from 'groq-sdk';
import { getFactBlock } from './fact-injector';
import type { StalePost } from './freshness-scanner';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface UpdateResult {
  success: boolean;
  slug: string;
  changes: string[];
  tokensUsed?: number;
  error?: string;
}

export async function updatePost(stalePost: StalePost): Promise<UpdateResult> {
  const mdxPath = path.join(CONTENT_DIR, `${stalePost.slug}.mdx`);
  const mdPath = path.join(CONTENT_DIR, `${stalePost.slug}.md`);
  const filePath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null;

  if (!filePath) {
    return { success: false, slug: stalePost.slug, changes: [], error: 'File not found' };
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content } = matter(raw);

  const factBlock = getFactBlock();

  const updatePrompt = buildUpdatePrompt(stalePost, content, factBlock);

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a financial content editor for LastEMI, an Indian debt management platform. You update existing blog posts with fresh data while preserving SEO value.

RULES:
- Keep the same structure, headings, and flow
- Only update FACTUAL DATA: rates, percentages, limits, year references
- Do NOT change the writing style or add fluff
- Preserve all calculator links and internal links
- Update any year references to current year
- If RBI rate has changed, recalculate all EMI examples
- Keep word count within ±100 words of original
- Use Indian number format: ₹50,00,000 not ₹5,000,000
- Output ONLY the updated article body (no frontmatter)`,
        },
        {
          role: 'user',
          content: updatePrompt,
        },
      ],
      temperature: 0.3, // Low temperature for factual accuracy
      max_tokens: 4000,
    });

    const updatedContent = response.choices[0]?.message?.content;
    if (!updatedContent) {
      return { success: false, slug: stalePost.slug, changes: [], error: 'Empty response from Groq' };
    }

    // Track token usage
    const tokensUsed = (response.usage?.prompt_tokens ?? 0) + (response.usage?.completion_tokens ?? 0);

    // Update frontmatter
    const today = new Date().toISOString().split('T')[0];
    frontmatter.lastReviewed = today;
    if (stalePost.suggestedAction === 'rewrite') {
      frontmatter.publishedAt = today;
    }

    // Write updated file
    const updatedFile = matter.stringify(updatedContent.trim(), frontmatter);
    fs.writeFileSync(filePath, updatedFile, 'utf-8');

    return {
      success: true,
      slug: stalePost.slug,
      changes: stalePost.reasons,
      tokensUsed,
    };
  } catch (err) {
    return {
      success: false,
      slug: stalePost.slug,
      changes: [],
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

function buildUpdatePrompt(stalePost: StalePost, currentContent: string, factBlock: string): string {
  return `
## TASK: Update this existing blog post with current data.

## REASONS THIS POST IS STALE:
${stalePost.reasons.map(r => `- ${r}`).join('\n')}

## SUGGESTED ACTION: ${stalePost.suggestedAction}

## CURRENT FINANCIAL DATA (use these EXACT numbers):
${factBlock}

## CURRENT ARTICLE CONTENT:
${currentContent}

## INSTRUCTIONS:
1. Read the article carefully
2. Identify all stale facts, rates, year references, and tax limits
3. Replace them with the current data provided above
4. Recalculate any EMI examples if rates have changed
5. Keep the same structure, tone, and word count
6. Output the FULL updated article body (no frontmatter)
  `.trim();
}

// CLI mode
if (require.main === module) {
  const slug = process.argv[2];
  if (!slug) {
    console.error('Usage: npx tsx scripts/blog/intelligence/update-generator.ts <slug>');
    process.exit(1);
  }

  (async () => {
    const result = await updatePost({
      slug,
      title: slug,
      publishedAt: '',
      ageInDays: 0,
      reasons: ['Manual update requested'],
      priority: 'high',
      suggestedAction: 'update-facts',
    });

    if (result.success) {
      console.log(`Updated: ${result.slug}`);
      console.log(`   Changes: ${result.changes.join(', ')}`);
      if (result.tokensUsed) {
        console.log(`   Tokens used: ${result.tokensUsed}`);
      }
    } else {
      console.error(`Failed: ${result.error}`);
    }
  })();
}
