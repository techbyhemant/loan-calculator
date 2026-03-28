// Run: npx tsx scripts/blog/generate-post.ts [slug]
// Example: npx tsx scripts/blog/generate-post.ts reduce-emi-or-tenure-after-part-payment

import fs from 'fs'
import path from 'path'
import Groq from 'groq-sdk'
import Replicate from 'replicate'
import { POSTS, type PostSpec } from './post-list'
import { BLOG_SYSTEM_PROMPT } from './prompts/system-prompt'
import { POST_PROMPTS, METAPHORS, buildPrompt } from './prompts/image-prompts'
import { insertExternalLinks } from './intelligence/external-links'
import type { QueuedPost } from './autonomous/queue-manager'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

const BLOG_DIR = path.join(process.cwd(), 'content/blog')
const IMAGE_DIR = path.join(process.cwd(), 'public/images/blog')

export async function generateBlogPost(slug: string, postSpec?: QueuedPost): Promise<void> {
  // 1. Find the post spec (use provided spec or look up in POSTS)
  const post = postSpec ?? POSTS.find(p => p.slug === slug)
  if (!post) {
    console.error(`❌ No post found with slug: ${slug}`)
    console.log('Available slugs:')
    POSTS.forEach(p => console.log(`  - ${p.slug}`))
    process.exit(1)
  }

  console.log(`\n🚀 Generating post: "${post.title}"`)
  console.log(`   Keyword: ${post.seoKeyword} (${post.searchVolume}/mo)`)
  console.log(`   Tier: ${post.tier}\n`)

  // 2. Check if already exists
  const mdxPath = path.join(BLOG_DIR, `${post.slug}.mdx`)
  if (fs.existsSync(mdxPath)) {
    // In CI (non-interactive), skip existing files
    if (!process.stdin.isTTY || process.env.CI) {
      console.log(`⚠️  File already exists: ${mdxPath} — skipping (CI mode)`)
      return
    }
    console.log(`⚠️  File already exists: ${mdxPath}`)
    const answer = await promptUser('Overwrite? (y/N): ')
    if (answer.toLowerCase() !== 'y') {
      console.log('Skipped.')
      return
    }
  }

  // 3. Generate text content via Groq
  console.log('✍️  Writing article via Groq (Llama 3.3 70B)...')
  const startText = Date.now()

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 8000,
    temperature: 0.7,
    messages: [
      {
        role: 'system',
        content: BLOG_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: buildArticleUserPrompt(post),
      },
    ],
  })

  let articleContent = completion.choices[0]?.message?.content
  if (!articleContent) throw new Error('Groq returned empty content')

  let wordCount = articleContent.split(/\s+/).length
  console.log(`   ✅ Article written in ${((Date.now() - startText) / 1000).toFixed(1)}s`)
  console.log(`   📝 Word count: ~${wordCount} words`)

  // Retry if too short — Llama sometimes produces short outputs
  if (wordCount < 1200) {
    console.log(`   ⚠️  Too short (${wordCount} < 1200). Retrying with stronger instruction...`)
    const retry = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 8000,
      temperature: 0.7,
      messages: [
        { role: 'system', content: BLOG_SYSTEM_PROMPT },
        { role: 'user', content: buildArticleUserPrompt(post) },
        { role: 'assistant', content: articleContent },
        { role: 'user', content: 'This article is TOO SHORT. It has only ' + wordCount + ' words but needs MINIMUM 1,500 words. Please EXPAND every section with more detail, more numerical examples, more step-by-step calculations, and more comparison data. Add sections you may have skipped. Output the COMPLETE expanded article from the beginning.' },
      ],
    })
    const retryContent = retry.choices[0]?.message?.content
    if (retryContent && retryContent.split(/\s+/).length > wordCount) {
      articleContent = retryContent
      wordCount = articleContent.split(/\s+/).length
      console.log(`   ✅ Retry produced ${wordCount} words`)
    }
  }

  // 4. Generate image via Replicate (Flux Schnell) — optional, graceful failure
  console.log('\n🎨 Generating featured image via Replicate (Flux Schnell)...')
  const startImage = Date.now()

  const imagePrompt = (() => {
    // 1. Canonical prompt for this slug
    if (POST_PROMPTS[post.slug]) return POST_PROMPTS[post.slug];

    // 2. Metaphor template
    const metaphor = (post as unknown as Record<string, unknown>).imageMetaphor;
    if (metaphor) {
      const key = (metaphor as string).toLowerCase() as keyof typeof METAPHORS;
      if (METAPHORS[key]) return METAPHORS[key];
    }

    // 3. Raw imagePrompt with suffix enforced
    if (post.imagePrompt) return buildPrompt(post.imagePrompt);

    // 4. Fallback
    console.warn(`⚠️  No image prompt for ${post.slug} — using decline template`);
    return METAPHORS.decline;
  })();

  console.log(`   Prompt: ${imagePrompt.slice(0, 100)}...`)

  try {
    const imageOutput = await replicate.run(
      'black-forest-labs/flux-schnell',
      {
        input: {
          prompt: imagePrompt,
          num_outputs: 1,
          aspect_ratio: '16:9',
          output_format: 'webp',
          output_quality: 90,
          go_fast: true,
        }
      }
    )

    const imageUrl = Array.isArray(imageOutput) ? imageOutput[0] : imageOutput
    const imageResponse = await fetch(imageUrl as string)
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())

    if (!fs.existsSync(IMAGE_DIR)) {
      fs.mkdirSync(IMAGE_DIR, { recursive: true })
    }

    const imagePath = path.join(IMAGE_DIR, `${post.slug}.webp`)
    fs.writeFileSync(imagePath, imageBuffer)

    console.log(`   ✅ Image saved in ${((Date.now() - startImage) / 1000).toFixed(1)}s`)
    console.log(`   📁 Saved to: public/images/blog/${post.slug}.webp`)
  } catch (imgErr) {
    console.log(`   ⚠️  Image generation failed (${imgErr instanceof Error ? imgErr.message.slice(0, 80) : 'unknown error'})`)
    console.log(`   📝 Post will be published without a featured image`)
  }

  // 5. Insert external links (before internal links, which run separately on the saved file)
  console.log('\n🔗 Inserting external links...')
  const contentWithLinks = insertExternalLinks(articleContent.trim(), 5)
  const externalLinksAdded = (contentWithLinks.match(/\]\(https?:\/\//g) || []).length -
    (articleContent.trim().match(/\]\(https?:\/\//g) || []).length
  console.log(`   ✅ Added ${externalLinksAdded} external links`)

  // 6. Build the complete MDX file
  const frontmatter = buildFrontmatter(post)
  const fullMdx = `${frontmatter}\n\n${contentWithLinks}\n`

  // Ensure blog directory exists
  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true })
  }

  fs.writeFileSync(mdxPath, fullMdx, 'utf-8')
  console.log(`\n✅ Blog post saved to: content/blog/${post.slug}.mdx`)

  // 7. Summary
  console.log('\n═══════════════════════════════════════')
  console.log('GENERATION COMPLETE')
  console.log('═══════════════════════════════════════')
  console.log(`Post:    ${post.title}`)
  console.log(`Tier:    ${post.tier}`)
  console.log(`MDX:     content/blog/${post.slug}.mdx`)
  console.log(`Image:   public/images/blog/${post.slug}.webp`)
  console.log(`URL:     /blog/${post.slug}`)
  console.log('═══════════════════════════════════════')
  console.log('\nNext steps:')
  console.log(`  npm run blog:check ${post.slug}`)
  console.log(`  npm run dev → visit /blog/${post.slug}`)
}

// Build the user prompt for Groq
function buildArticleUserPrompt(post: PostSpec | QueuedPost): string {
  const tierContext: Record<number, string> = {
    1: 'This is a Tier 1 post — low competition keyword. The goal is fast ranking. Focus on being more specific and calculator-forward than any existing result. Competitors on this keyword have no embedded calculators and give wishy-washy conclusions.',
    2: 'This is a Tier 2 post — medium competition keyword. Sites like Finnovate.in and homeemi.in currently rank here with DA 25-40. We beat them with a deeper calculator integration, honest verdict upfront, and the specific Indian regulatory detail they miss.',
    3: 'This is a Tier 3 post — broader topic for topical authority building. Depth and internal linking matter more than sharp keyword focus here. This builds the topic cluster that helps Tier 1 and 2 posts rank.',
  }

  return `Write a COMPLETE, COMPREHENSIVE, LONG blog post for LastEMI (lastemi.com).

ABSOLUTE MINIMUM: 1,500 WORDS. TARGET: 1,800 WORDS.
This is NON-NEGOTIABLE. If your output is under 1,500 words it is AUTOMATICALLY DELETED.
You MUST write at least 7 substantial sections with 200+ words each.
Include at least 3 detailed numerical examples with step-by-step ₹ calculations.
Include at least 2 comparison tables.
Include detailed explanations — this is a GUIDE, not a summary.
DO NOT be brief. DO NOT skip sections. Write EVERYTHING the system prompt requires.

TITLE: ${post.title}
TARGET KEYWORD: "${post.seoKeyword}"
MONTHLY SEARCH VOLUME: ${post.searchVolume}
CATEGORY: ${post.category}
TAGS: ${post.tags.join(', ')}
PUBLISHING PRIORITY: ${tierContext[post.tier]}
RELATED CALCULATOR: ${post.relatedCalculator ?? 'none'}

ARTICLE BRIEF:
${post.description}

SPECIFIC REQUIREMENTS FOR THIS ARTICLE:
- The opening hook must describe the exact moment of confusion or pain
- The verdict must appear in paragraph 2, not at the end
- The calculator must be embedded in section 4 (after the numbers, before exceptions)
- Include at least one statement that a bank or NBFC would never publish
- Use ₹50,00,000 at 8.5% for 20 years as the standard example unless specified otherwise
- All rupee amounts must use Indian number format: ₹50,00,000 not ₹5000000
${post.relatedCalculator ? `- Embed ${getCalculatorComponent(post.relatedCalculator)} in section 4` : ''}

INTERNAL LINKS TO INCLUDE (pick 2-3 that are natural):
- Part payment calculator → /
- SIP vs prepayment calculator → /calculators/sip-vs-prepayment
- Home loan eligibility → /calculators/home-loan-eligibility
- Tax benefit calculator → /calculators/tax-benefit
- Free loan dashboard → /login
- Payoff planner → /dashboard/planner

TARGET WORD COUNT: 1,400-1,800 words.

Write the full article now. Output ONLY the MDX content, no frontmatter, no preamble.`
}

function getCalculatorComponent(calcPath: string): string {
  const map: Record<string, string> = {
    '/': '<EmiCalculator />',
    '/calculators/sip-vs-prepayment': '<SipVsPrepaymentCalc />',
    '/calculators/home-loan-eligibility': '<EligibilityCalc />',
    '/calculators/tax-benefit': '<TaxBenefitCalc />',
    '/calculators/balance-transfer': '<EmiCalculator />',
    '/rbi-rates': '<EmiCalculator />',
    '/dashboard': '<EmiCalculator />',
    '/dashboard/planner': '<EmiCalculator />',
  }
  return map[calcPath] ?? '<EmiCalculator />'
}

// Build the MDX frontmatter block
function buildFrontmatter(post: PostSpec | QueuedPost): string {
  const lines = [
    '---',
    `title: "${post.title.replace(/"/g, '\\"')}"`,
    `slug: "${post.slug}"`,
    `description: "${post.description.replace(/"/g, '\\"')}"`,
    `publishedAt: "${post.publishedAt ?? new Date().toISOString().split('T')[0]}"`,
    `category: "${post.category}"`,
    `tags: [${post.tags.map(t => `"${t}"`).join(', ')}]`,
    `featured: ${post.featured ?? false}`,
    `tier: ${post.tier}`,
  ];
  if (post.publishWeek != null) lines.push(`publishWeek: ${post.publishWeek}`);
  lines.push(
    `seoKeyword: "${post.seoKeyword}"`,
    `searchVolume: ${post.searchVolume}`,
    `image: "/images/blog/${post.slug}.webp"`,
    `author: "LastEMI Editorial Team"`,
  );
  if (post.relatedCalculator) lines.push(`relatedCalculator: "${post.relatedCalculator}"`);
  lines.push('---');
  return lines.join('\n');
}

// Simple stdin prompt helper
function promptUser(question: string): Promise<string> {
  return new Promise(resolve => {
    process.stdout.write(question)
    process.stdin.once('data', data => resolve(data.toString().trim()))
  })
}

// CLI runner — only runs when this file is executed directly (not imported)
const isDirectRun = process.argv[1]?.includes('generate-post')
if (isDirectRun) {
  const slug = process.argv[2]
  if (!slug) {
    console.log('Usage: npx tsx scripts/blog/generate-post.ts [slug]')
    console.log('\nAvailable posts:')
    POSTS.forEach(p => console.log(`  [T${p.tier} W${p.publishWeek}] ${p.slug} (${p.searchVolume}/mo)`))
    process.exit(0)
  }

  generateBlogPost(slug).catch(err => {
    console.error('❌ Generation failed:', err)
    process.exit(1)
  })
}
