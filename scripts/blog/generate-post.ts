// Run: npx tsx scripts/blog/generate-post.ts [slug]
// Example: npx tsx scripts/blog/generate-post.ts reduce-emi-or-tenure-after-part-payment

import fs from 'fs'
import path from 'path'
import Groq from 'groq-sdk'
import Replicate from 'replicate'
import { POSTS, type PostSpec } from './post-list'
import { BLOG_SYSTEM_PROMPT } from './prompts/system-prompt'
import { buildImagePrompt } from './prompts/image-prompts'
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
    console.log(`⚠️  File already exists: ${mdxPath}`)
    const answer = await promptUser('Overwrite? (y/N): ')
    if (answer.toLowerCase() !== 'y') {
      console.log('Skipped.')
      process.exit(0)
    }
  }

  // 3. Generate text content via Groq
  console.log('✍️  Writing article via Groq (Llama 3.3 70B)...')
  const startText = Date.now()

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 5000,
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

  const articleContent = completion.choices[0]?.message?.content
  if (!articleContent) throw new Error('Groq returned empty content')

  console.log(`   ✅ Article written in ${((Date.now() - startText) / 1000).toFixed(1)}s`)
  console.log(`   📝 Word count: ~${articleContent.split(' ').length} words`)

  // 4. Generate image via Replicate (Flux Schnell) — optional, graceful failure
  console.log('\n🎨 Generating featured image via Replicate (Flux Schnell)...')
  const startImage = Date.now()

  try {
    const imageOutput = await replicate.run(
      'black-forest-labs/flux-schnell',
      {
        input: {
          prompt: buildImagePrompt(post.imagePrompt),
          num_outputs: 1,
          aspect_ratio: '16:9',
          output_format: 'webp',
          output_quality: 85,
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

  // 5. Build the complete MDX file
  const frontmatter = buildFrontmatter(post)
  const fullMdx = `${frontmatter}\n\n${articleContent.trim()}\n`

  // Ensure blog directory exists
  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true })
  }

  fs.writeFileSync(mdxPath, fullMdx, 'utf-8')
  console.log(`\n✅ Blog post saved to: content/blog/${post.slug}.mdx`)

  // 6. Summary
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

  return `Write a COMPLETE, COMPREHENSIVE blog post for LastEMI (lastemi.com).

CRITICAL: The article MUST be between 1,500-1,800 words. Articles under 1,400 words are AUTOMATICALLY REJECTED. Write in-depth with detailed examples, calculations, and analysis. Do NOT write a summary — write a full guide.

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

// Run
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
