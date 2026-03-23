# BLOG_AUTOMATION.md
# Place at root of project alongside CLAUDE.md and ARCHITECTURE.md
# Claude Code reads this automatically.
# This file covers the AI-powered blog automation system.

---

## WHAT THIS SYSTEM DOES

Generates complete, publish-ready blog posts for LastEMI (lastemi.com):
1. Takes a topic/keyword from the 36-post list (organized in 3 tiers)
2. Calls Groq API (Llama 3.3 70B) to write the full MDX article
3. Calls Replicate API (Flux Schnell) to generate a featured image
4. Saves the .mdx file to content/blog/
5. Saves the image to public/images/blog/
6. Runs quality checks (12 automated rules) before publishing

One command → complete blog post ready to review and publish.

### Three-Tier Keyword Strategy
- **Tier 1 (9 posts, Weeks 1-3):** Low competition, fast ranking wins
- **Tier 2 (15 posts, Weeks 4-8):** Medium competition, beat Finnovate/homeemi
- **Tier 3 (12 posts, Weeks 9-12):** Broader topics for topical authority

### Workflow Per Post
```bash
npm run blog:generate [slug]        # AI generates article + image
npm run blog:check [slug]           # Quality gate (must pass 10+/12 checks)
# Review the .mdx manually (~25 min)
npm run dev → visit /blog/[slug]    # Visual check
git add + commit + push             # Deploy via Vercel
```

---

## WHY GROQ FOR TEXT, REPLICATE FOR IMAGES

**Groq (text):**
- Already set up in the project (GROQ_API_KEY exists)
- Llama 3.3 70B is the model — good at structured output and long-form writing
- ~6,000 requests/day free
- Fastest inference of any LLM API — blog post generates in ~8 seconds
- Cost: ₹0 (free tier is more than enough)

**Replicate (images):**
- Model: `black-forest-labs/flux-schnell`
- Cost: ~$0.003 per image (~₹0.25 per image)
- 15 blog posts = ₹3.75 total
- Speed: ~3-5 seconds per image
- Quality: Clean, professional — perfect for finance blog headers

---

## FOLDER STRUCTURE FOR AUTOMATION

```
scripts/
└── blog/
    ├── generate-post.ts        ← Main script — run this to generate a post
    ├── generate-image.ts       ← Image generation via Replicate
    ├── prompts/
    │   ├── system-prompt.ts    ← System instructions for the blog writer LLM
    │   └── image-prompts.ts    ← Image prompt templates per category
    └── post-list.ts            ← All 15 posts with their metadata

public/
└── images/
    └── blog/
        ├── reduce-emi-or-tenure-after-part-payment.webp
        ├── total-interest-home-loan.webp
        └── ... (one image per post)
```

---

## ENVIRONMENT VARIABLES NEEDED

Add these to `.env.local`:

```env
# Already exists — used for blog text generation
GROQ_API_KEY=

# New — used for image generation
REPLICATE_API_TOKEN=
```

Get Replicate token at: https://replicate.com/account/api-tokens
Free account gets you $5 credit (~1,666 images at $0.003 each).

---

## THE POST LIST — ALL 15 POSTS

```typescript
// scripts/blog/post-list.ts

export interface PostSpec {
  slug: string
  title: string
  description: string
  category: string
  tags: string[]
  seoKeyword: string
  searchVolume: number
  featured: boolean
  relatedCalculator?: string
  imagePrompt: string    // used for Replicate image generation
  publishedAt: string
}

export const POSTS: PostSpec[] = [
  {
    slug: 'reduce-emi-or-tenure-after-part-payment',
    title: 'Reduce EMI or Reduce Tenure After Part Payment — Which Saves More?',
    description: 'When you make a part payment on your home loan, should you reduce EMI or reduce tenure? We run the real numbers on a ₹50L loan so you never have to guess again.',
    category: 'Home Loans',
    tags: ['part payment', 'EMI', 'tenure', 'home loan'],
    seoKeyword: 'reduce EMI or tenure after prepayment',
    searchVolume: 4000,
    featured: true,
    relatedCalculator: '/',
    imagePrompt: 'Clean minimalist illustration of a home loan amortization graph with two paths diverging, one labeled EMI reduction and one labeled tenure reduction, professional financial infographic style, blue and white color scheme, no text',
    publishedAt: '2025-04-01',
  },
  {
    slug: 'total-interest-home-loan',
    title: 'How Much Total Interest Will You Pay on Your ₹50L Home Loan?',
    description: 'Most home loan borrowers don\'t know they will pay more in interest than the original loan. We show you the real numbers and exactly what to do about it.',
    category: 'Home Loans',
    tags: ['home loan', 'interest', 'total cost', 'amortization'],
    seoKeyword: 'total interest paid home loan',
    searchVolume: 6000,
    featured: true,
    relatedCalculator: '/',
    imagePrompt: 'Professional financial infographic showing a large house with a money counter below it, clean minimal design, showing loan principal vs interest as two distinct visual areas, blue and orange color scheme, no text, vector style',
    publishedAt: '2025-04-02',
  },
  {
    slug: 'sip-vs-home-loan-prepayment',
    title: 'SIP vs Home Loan Prepayment: The Honest Answer for Indian Borrowers',
    description: 'Should you invest your surplus in SIP or prepay your home loan? The answer depends on your tax bracket and where you are in your loan tenure. We show you the math.',
    category: 'Debt Strategy',
    tags: ['SIP', 'prepayment', 'mutual fund', 'home loan', 'investment'],
    seoKeyword: 'sip vs home loan prepayment',
    searchVolume: 18000,
    featured: true,
    relatedCalculator: '/calculators/sip-vs-prepayment',
    imagePrompt: 'Split illustration showing two paths: one side shows a growing investment chart representing SIP mutual fund returns, other side shows a shrinking loan balance chart, clean professional financial infographic, green and blue tones, no text',
    publishedAt: '2025-04-03',
  },
  {
    slug: 'home-loan-tax-benefits-80c-24b',
    title: 'Home Loan Tax Benefits: Section 80C and 24(b) Explained Simply',
    description: 'Confused about which home loan tax benefits you can claim? We explain Section 80C, 24(b), 80EE, and 80EEA with actual tax savings calculated for different income brackets.',
    category: 'Tax Planning',
    tags: ['80C', '24b', 'tax benefit', 'home loan', 'income tax'],
    seoKeyword: 'home loan tax benefit 80C 24b',
    searchVolume: 22000,
    featured: false,
    relatedCalculator: '/calculators/tax-benefit',
    imagePrompt: 'Clean illustration of Indian income tax forms with a house icon and rupee symbols, professional infographic style, showing tax deduction concept, government document aesthetic, blue and white color scheme, no faces, no text',
    publishedAt: '2025-04-05',
  },
  {
    slug: 'credit-card-minimum-due-trap',
    title: 'Paying Only Minimum Due on Your Credit Card? Here\'s What It Actually Costs',
    description: 'Paying only the minimum due feels manageable. The real cost is devastating. We show you exactly how long it takes to clear a ₹30,000 credit card balance at minimum payments.',
    category: 'Credit Cards',
    tags: ['credit card', 'minimum due', 'debt trap', 'interest'],
    seoKeyword: 'credit card minimum due trap',
    searchVolume: 8000,
    featured: false,
    relatedCalculator: undefined,
    imagePrompt: 'Minimalist illustration of a credit card with a growing debt spiral or snowball effect, showing money being drained, warning visual metaphor, red and white color scheme, clean vector style, no text, no faces',
    publishedAt: '2025-04-07',
  },
  {
    slug: 'home-loan-balance-transfer-worth-it',
    title: 'Home Loan Balance Transfer: Is It Actually Worth It? (Full Cost Analysis)',
    description: 'A 0.5% lower rate sounds great on paper. But after processing fees, legal charges, and the break-even timeline, is it worth it? We run the complete numbers.',
    category: 'Home Loans',
    tags: ['balance transfer', 'home loan', 'refinance', 'interest rate'],
    seoKeyword: 'home loan balance transfer worth it',
    searchVolume: 9000,
    featured: false,
    relatedCalculator: '/calculators/balance-transfer',
    imagePrompt: 'Clean professional illustration showing money transfer between two banks, arrow indicating movement with rupee symbols, cost analysis visual concept, professional financial style, teal and white color scheme, no text, vector art',
    publishedAt: '2025-04-10',
  },
  {
    slug: 'become-debt-free-faster-home-loan',
    title: 'How to Become Debt-Free 10 Years Early on a ₹50L Home Loan',
    description: 'Three specific strategies that can cut 8-12 years off a typical 20-year home loan without dramatically increasing your monthly cash outflow.',
    category: 'Debt Strategy',
    tags: ['debt free', 'prepayment strategy', 'home loan', 'financial freedom'],
    seoKeyword: 'debt free faster home loan',
    searchVolume: 3500,
    featured: false,
    relatedCalculator: '/',
    imagePrompt: 'Motivational minimalist illustration showing a road or path with a finish line much closer than expected, freedom concept with broken chains or open door, professional financial blog style, green and blue tones, no faces, no text',
    publishedAt: '2025-04-12',
  },
  {
    slug: 'rbi-rate-cut-emi-impact',
    title: 'RBI Cut Repo Rate — Should Your Home Loan EMI Have Dropped?',
    description: 'When the RBI cuts rates, your floating rate home loan EMI should fall. But many banks delay passing on the benefit. Here\'s exactly what to check and what to do.',
    category: 'EMI Management',
    tags: ['RBI', 'repo rate', 'EMI', 'floating rate', 'RLLR'],
    seoKeyword: 'RBI rate cut EMI impact',
    searchVolume: 12000,
    featured: false,
    relatedCalculator: '/rbi-rates',
    imagePrompt: 'Clean infographic showing RBI Reserve Bank of India building with downward arrow indicating rate cut, flowing to a home EMI payment reducing, professional financial news illustration style, saffron and blue tones, no text, vector style',
    publishedAt: '2025-04-15',
  },
  {
    slug: 'gold-loan-vs-personal-loan',
    title: 'Gold Loan vs Personal Loan: Which Is Actually Cheaper?',
    description: 'Gold loans have lower rates but your jewellery is at risk. Personal loans have no collateral risk but higher rates. We compare both with real numbers.',
    category: 'Personal Loans',
    tags: ['gold loan', 'personal loan', 'interest rate', 'collateral'],
    seoKeyword: 'gold loan vs personal loan',
    searchVolume: 11000,
    featured: false,
    relatedCalculator: undefined,
    imagePrompt: 'Split comparison illustration showing gold jewellery on one side and a personal document/contract on other side, clean balanced comparison visual, warm gold and cool blue color split, professional financial infographic, no text, no faces',
    publishedAt: '2025-04-17',
  },
  {
    slug: 'pmay-subsidy-eligibility',
    title: 'PMAY Subsidy 2025: Are You Eligible? How to Claim ₹2.67 Lakhs',
    description: 'The Pradhan Mantri Awas Yojana subsidy can reduce your home loan cost by up to ₹2.67 lakhs. Most eligible borrowers never claim it. Here\'s exactly how.',
    category: 'Home Loans',
    tags: ['PMAY', 'subsidy', 'first time buyer', 'government scheme', 'home loan'],
    seoKeyword: 'PMAY subsidy eligibility',
    searchVolume: 14000,
    featured: false,
    relatedCalculator: undefined,
    imagePrompt: 'Indian government housing scheme illustration showing a modest family home with Ashoka emblem or Indian flag colors, subsidy/benefit visual concept, professional informational style, saffron white green color scheme, no faces, no text, clean vector',
    publishedAt: '2025-04-20',
  },
  {
    slug: 'education-loan-80e-deduction',
    title: 'Education Loan Section 80E: The Tax Deduction Most Borrowers Miss',
    description: 'Section 80E lets you deduct 100% of education loan interest with no upper limit. There is no cap. Yet most borrowers never claim it. Here\'s exactly how it works.',
    category: 'Tax Planning',
    tags: ['education loan', '80E', 'tax deduction', 'income tax'],
    seoKeyword: 'education loan 80E deduction',
    searchVolume: 6500,
    featured: false,
    relatedCalculator: '/calculators/tax-benefit',
    imagePrompt: 'Clean illustration of graduation cap and mortar board with a percentage sign and Indian rupee symbol showing tax saving concept, professional financial infographic, educational theme, blue and gold color scheme, no faces, no text, vector style',
    publishedAt: '2025-04-22',
  },
  {
    slug: 'debt-snowball-vs-avalanche-india',
    title: 'Debt Snowball vs Debt Avalanche: Which Works Better for Indian Loans?',
    description: 'You have a home loan, car loan, and personal loan. Which do you pay off first? The avalanche saves the most money. The snowball keeps you motivated. We explain both.',
    category: 'Debt Strategy',
    tags: ['debt snowball', 'debt avalanche', 'payoff strategy', 'multiple loans'],
    seoKeyword: 'debt snowball vs avalanche india',
    searchVolume: 3000,
    featured: false,
    relatedCalculator: '/dashboard/planner',
    imagePrompt: 'Clean split illustration showing two payoff strategies: one side shows a snowball rolling and growing small debts, other shows an avalanche attacking the largest pile, professional minimalist infographic, blue and white, no text, vector style',
    publishedAt: '2025-04-25',
  },
  {
    slug: 'how-to-read-home-loan-statement',
    title: 'How to Read Your Home Loan Statement (What Your Bank Doesn\'t Explain)',
    description: 'Your home loan statement has numbers that directly affect your wealth. Most borrowers scan it and file it away. We show you exactly what to look for and why it matters.',
    category: 'Home Loans',
    tags: ['home loan statement', 'amortization', 'bank statement', 'loan tracking'],
    seoKeyword: 'home loan statement explained',
    searchVolume: 5000,
    featured: false,
    relatedCalculator: '/',
    imagePrompt: 'Illustration of a financial bank statement document with magnifying glass highlighting key sections, educational infographic style, professional clean look, teal and white color scheme, simplified document design, no actual numbers, no text outside the visual metaphor',
    publishedAt: '2025-04-28',
  },
  {
    slug: 'pre-emi-vs-full-emi',
    title: 'Pre-EMI vs Full EMI for Under-Construction Property: Which to Choose?',
    description: 'Builder asking you to choose between Pre-EMI and Full EMI for your under-construction flat? The wrong choice could cost you lakhs. We explain the difference clearly.',
    category: 'Home Loans',
    tags: ['pre-EMI', 'full EMI', 'under construction', 'home loan'],
    seoKeyword: 'pre EMI vs full EMI',
    searchVolume: 7000,
    featured: false,
    relatedCalculator: '/',
    imagePrompt: 'Illustration of a building under construction on one side transitioning to a completed home on the other side, with EMI payment concept visual, timeline progression, professional real estate financial style, blue and orange tones, no text, no faces, clean vector',
    publishedAt: '2025-05-01',
  },
  {
    slug: 'old-vs-new-tax-regime-home-loan',
    title: 'Old Tax Regime vs New Tax Regime: Which is Better if You Have a Home Loan?',
    description: 'The new tax regime has lower rates but removes home loan deductions. For most home loan borrowers, the old regime wins. We show you when and by how much.',
    category: 'Tax Planning',
    tags: ['old regime', 'new regime', 'home loan', 'tax planning', '80C', '24b'],
    seoKeyword: 'old vs new tax regime home loan',
    searchVolume: 15000,
    featured: false,
    relatedCalculator: '/calculators/tax-benefit',
    imagePrompt: 'Clean side-by-side comparison illustration showing two tax filing paths, old system vs new system visual concept, scales of justice or balance metaphor for comparison, Indian government tax context, professional infographic style, blue and green split, no text, no faces',
    publishedAt: '2025-05-05',
  },
]
```

---

## SYSTEM PROMPT FOR GROQ (BLOG WRITER)

```typescript
// scripts/blog/prompts/system-prompt.ts

export const BLOG_SYSTEM_PROMPT = `You are a senior personal finance writer for EMIPartPay, 
India's honest debt freedom platform. You write blog posts that help Indian borrowers 
make better decisions about their home loans, EMIs, and debt.

YOUR WRITING RULES:
1. Tone: Direct, honest, no jargon. Like a knowledgeable friend who happens to know finance.
   Not a bank brochure. Not an academic paper. Not corporate speak.
2. Always use Indian number format: ₹50,00,000 (not $500,000 or ₹5000000)
3. Standard example loan: ₹50,00,000 at 8.5% for 20 years unless post requires different
4. Real numbers: calculate actual interest savings, not vague "saves lakhs"
5. Upfront answer: give the conclusion in the second paragraph, not the last one
6. No padding: every paragraph must add value. Cut anything generic.
7. Honest over optimistic: if something has downsides, say so clearly
8. India-specific: mention SBI, HDFC, ICICI, ICICI, Kotak by name for context
9. RBI rules: you know RBI mandates zero prepayment penalty on floating rate loans
10. Tax rules: old regime vs new regime 2025-26, Section 80C (₹1.5L cap), 24(b) (₹2L cap), 80E (no cap)

MDX FORMAT RULES:
- Use ## for H2 headings (no H1, the title is the H1)
- Use <Callout type="tip"> for important insights
- Use <ComparisonTable headers={[...]} rows={[...]} /> for any side-by-side comparison with numbers
- Use <EmiCalculator /> to embed the calculator (use this once per post, in the middle section)
- Bold key numbers and conclusions using **bold**
- Keep paragraphs short: 2-4 sentences maximum
- Lists are fine but don't over-use them

STRUCTURE (follow this for every post):
1. Opening hook: 2-3 sentences describing the exact pain/confusion the reader has
2. H2: The Short Answer — give the conclusion upfront in 1 paragraph
3. H2: [Main explanation section — name it appropriately]
4. H2: [Numbers/comparison section — always include actual calculations]
5. [Embed <EmiCalculator /> or relevant calculator here]
6. H2: [Exception or nuance — when the general rule doesn't apply]
7. H2: What to Do Right Now — 3-4 actionable steps
8. Closing paragraph: end with this exact CTA:
   "Track your exact savings in your [free loan dashboard](/login) — 
   no credit card, no spam calls, takes 2 minutes."

LENGTH: 1,400-1,800 words. No shorter (won't rank). No longer (user drops off).

OUTPUT FORMAT:
Output ONLY the MDX content that goes AFTER the frontmatter.
Do NOT include the frontmatter block (that is added by the script).
Do NOT include any preamble or explanation.
Start directly with the opening hook paragraph.`
```

---

## IMAGE PROMPT TEMPLATES BY CATEGORY

```typescript
// scripts/blog/prompts/image-prompts.ts

// Base style appended to every image prompt
export const IMAGE_BASE_STYLE = [
  'professional financial blog header image',
  'clean minimalist vector illustration',
  'no text or typography in the image',
  'no human faces',
  'high contrast',
  'suitable for a professional Indian fintech website',
  'aspect ratio 16:9',
  '1200x630 pixels equivalent composition',
].join(', ')

// Add this to every prompt
export function buildImagePrompt(specificPrompt: string): string {
  return `${specificPrompt}, ${IMAGE_BASE_STYLE}`
}
```

---

## THE MAIN GENERATION SCRIPT

```typescript
// scripts/blog/generate-post.ts
// Run: npx tsx scripts/blog/generate-post.ts [slug]
// Example: npx tsx scripts/blog/generate-post.ts reduce-emi-or-tenure-after-part-payment

import fs from 'fs'
import path from 'path'
import Groq from 'groq-sdk'
import Replicate from 'replicate'
import { POSTS } from './post-list'
import { BLOG_SYSTEM_PROMPT } from './prompts/system-prompt'
import { buildImagePrompt } from './prompts/image-prompts'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

const BLOG_DIR = path.join(process.cwd(), 'content/blog')
const IMAGE_DIR = path.join(process.cwd(), 'public/images/blog')

async function generateBlogPost(slug: string): Promise<void> {
  // 1. Find the post spec
  const post = POSTS.find(p => p.slug === slug)
  if (!post) {
    console.error(`❌ No post found with slug: ${slug}`)
    console.log('Available slugs:')
    POSTS.forEach(p => console.log(`  - ${p.slug}`))
    process.exit(1)
  }

  console.log(`\n🚀 Generating post: "${post.title}"`)
  console.log(`   Keyword: ${post.seoKeyword} (${post.searchVolume}/mo)\n`)

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
    max_tokens: 3000,
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

  // 4. Generate image via Replicate (Flux Schnell)
  console.log('\n🎨 Generating featured image via Replicate (Flux Schnell)...')
  const startImage = Date.now()

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

  // Replicate returns a URL or ReadableStream
  const imageUrl = Array.isArray(imageOutput) ? imageOutput[0] : imageOutput
  const imageResponse = await fetch(imageUrl as string)
  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())

  // Ensure image directory exists
  if (!fs.existsSync(IMAGE_DIR)) {
    fs.mkdirSync(IMAGE_DIR, { recursive: true })
  }

  const imagePath = path.join(IMAGE_DIR, `${post.slug}.webp`)
  fs.writeFileSync(imagePath, imageBuffer)

  console.log(`   ✅ Image saved in ${((Date.now() - startImage) / 1000).toFixed(1)}s`)
  console.log(`   📁 Saved to: public/images/blog/${post.slug}.webp`)

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
  console.log(`MDX:     content/blog/${post.slug}.mdx`)
  console.log(`Image:   public/images/blog/${post.slug}.webp`)
  console.log(`URL:     /blog/${post.slug}`)
  console.log('═══════════════════════════════════════')
  console.log('\nNext step: Review the post in your editor, then run:')
  console.log('npm run dev → visit /blog/' + post.slug)
}

// Build the user prompt for Groq
function buildArticleUserPrompt(post: ReturnType<typeof POSTS[0]['valueOf']>): string {
  return `Write a complete blog post for EMIPartPay.

TITLE: ${post.title}
TARGET KEYWORD: "${post.seoKeyword}"
CATEGORY: ${post.category}
TAGS: ${post.tags.join(', ')}
RELATED CALCULATOR: ${post.relatedCalculator ?? 'none'}

SEO DESCRIPTION (use this as your guiding brief):
${post.description}

CALCULATOR TO EMBED:
${post.relatedCalculator
    ? `Embed the calculator at ${post.relatedCalculator} using its component tag.
       Use <EmiCalculator /> for the main calculator (/).
       Use <SipVsPrepaymentCalc /> for /calculators/sip-vs-prepayment.
       Use <EligibilityCalc /> for /calculators/home-loan-eligibility.`
    : 'No calculator to embed in this post.'
  }

TARGET WORD COUNT: 1,400-1,800 words.

Write the full article now. Output ONLY the MDX content, no frontmatter, no preamble.`
}

// Build the MDX frontmatter block
function buildFrontmatter(post: typeof POSTS[0]): string {
  return `---
title: "${post.title.replace(/"/g, '\\"')}"
slug: "${post.slug}"
description: "${post.description.replace(/"/g, '\\"')}"
publishedAt: "${post.publishedAt}"
category: "${post.category}"
tags: [${post.tags.map(t => `"${t}"`).join(', ')}]
featured: ${post.featured}
${post.relatedCalculator ? `relatedCalculator: "${post.relatedCalculator}"` : ''}
image: "/images/blog/${post.slug}.webp"
seoKeyword: "${post.seoKeyword}"
searchVolume: ${post.searchVolume}
---`
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
  POSTS.forEach(p => console.log(`  ${p.slug} (${p.searchVolume}/mo)`))
  process.exit(0)
}

generateBlogPost(slug).catch(err => {
  console.error('❌ Generation failed:', err)
  process.exit(1)
})
```

---

## BATCH GENERATION SCRIPT

Generate all pending posts in sequence:

```typescript
// scripts/blog/generate-all.ts
// Run: npx tsx scripts/blog/generate-all.ts
// Generates all posts that don't yet have an .mdx file

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { POSTS } from './post-list'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

async function generateAll(): Promise<void> {
  const pending = POSTS.filter(p => {
    const mdxPath = path.join(BLOG_DIR, `${p.slug}.mdx`)
    return !fs.existsSync(mdxPath)
  })

  console.log(`\n📋 Found ${pending.length} posts to generate (${POSTS.length - pending.length} already exist)\n`)

  if (pending.length === 0) {
    console.log('✅ All posts already generated.')
    return
  }

  for (let i = 0; i < pending.length; i++) {
    const post = pending[i]
    console.log(`\n[${i + 1}/${pending.length}] Processing: ${post.slug}`)

    try {
      execSync(`npx tsx scripts/blog/generate-post.ts ${post.slug}`, {
        stdio: 'inherit',
        env: process.env,
      })
      // Rate limit: wait 3 seconds between posts to avoid API limits
      if (i < pending.length - 1) {
        console.log('   ⏳ Waiting 3s before next post...')
        await new Promise(r => setTimeout(r, 3000))
      }
    } catch (err) {
      console.error(`   ❌ Failed to generate ${post.slug}:`, err)
      console.log('   Continuing with next post...')
    }
  }

  console.log('\n═══════════════════════════════════════')
  console.log('BATCH GENERATION COMPLETE')
  console.log('═══════════════════════════════════════')
  console.log(`Generated: ${pending.length} posts`)
  console.log('Review each post at /blog/[slug] before submitting sitemap.')
}

generateAll()
```

---

## PACKAGE.JSON SCRIPTS TO ADD

Add these to the `scripts` section of `package.json`:

```json
{
  "scripts": {
    "blog:generate": "npx tsx scripts/blog/generate-post.ts",
    "blog:generate-all": "npx tsx scripts/blog/generate-all.ts",
    "blog:list": "npx tsx -e \"import('./scripts/blog/post-list.ts').then(m => m.POSTS.forEach(p => console.log(p.slug)))\""
  }
}
```

**Usage:**
```bash
# Generate one specific post
npm run blog:generate reduce-emi-or-tenure-after-part-payment

# Generate all pending posts
npm run blog:generate-all

# List all available posts
npm run blog:list
```

---

## ADDITIONAL DEPENDENCY TO INSTALL

```bash
npm install replicate
```

Groq SDK is already installed. tsx is already available via Next.js toolchain.

---

## REVIEW WORKFLOW AFTER GENERATION

1. Run the generate script
2. Check the generated .mdx file in your editor:
   - Does the opening hook address the reader's real pain?
   - Are all ₹ numbers realistic and in correct Indian format?
   - Is the calculator embedded in the right place?
   - Does the conclusion actually answer the title question?
3. Run `npm run dev` and visit `/blog/[slug]`
4. Check the generated image at `public/images/blog/[slug].webp`
   - If image is off: re-run with a tweaked imagePrompt in post-list.ts
5. If content needs tweaks: edit the .mdx file directly
6. When satisfied: commit both files to git

**The AI gives you 90% of the way there. You provide the final 10%.**

---

## IMAGE QUALITY TIPS

If Flux Schnell output isn't quite right, try these adjustments:

**For more professional look:** Add "corporate", "enterprise", "Fortune 500 quality"
**For cleaner/simpler:** Add "flat design", "icon style", "geometric"
**If too complex:** Add "simple", "minimal", "single concept"
**If text appears:** Add "absolutely no text", "no typography", "no letters"
**For better finance feel:** Add "Bloomberg", "Financial Times style"

To regenerate just the image for a post:
```typescript
// scripts/blog/regenerate-image.ts [slug]
// Modify the imagePrompt in post-list.ts first, then run this
```

---

## WHAT THIS SYSTEM COSTS

| Item | Cost | Notes |
|---|---|---|
| Groq (Llama 3.3 70B) | ₹0 | Free tier: 6,000 req/day |
| Replicate (Flux Schnell) | ~$0.003/image | ₹0.25 per image |
| 36 blog posts total | ~₹9 | For all images |
| Ongoing (3 posts/week) | ~₹3/month | 12 images/month |

Total first-year cost for the entire blog: **< ₹100**

---

## FUTURE IMPROVEMENTS (OPTIONAL)

These are not needed now but possible later:

- **Auto-publish to social:** After generation, auto-tweet/post summary to X/Twitter
- **Translation:** Replicate the pipeline for Hindi versions of top posts
- **Update workflow:** Script to refresh stale posts when tax rules change (every April)
- **A/B headlines:** Generate 3 title variants and track which ranks better
