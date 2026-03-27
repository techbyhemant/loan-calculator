// ═══════════════════════════════════════════════════════════
// Regenerate blog images using the canonical prompt library
// ═══════════════════════════════════════════════════════════
//
// Usage:
//   npx tsx scripts/blog/regenerate-images.ts [slug]       — regenerate one post
//   npx tsx scripts/blog/regenerate-images.ts               — regenerate all posts in POST_PROMPTS
//   npx tsx scripts/blog/regenerate-images.ts --check       — audit which images exist vs missing
//

import fs from 'fs'
import path from 'path'
import Replicate from 'replicate'
import { POST_PROMPTS, METAPHORS, buildPrompt } from './prompts/image-prompts'
import { POSTS } from './post-list'

const IMAGE_DIR = path.join(process.cwd(), 'public/images/blog')
const RATE_LIMIT_MS = 1500 // 1.5s delay between Replicate calls

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

// ─── Helpers ────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getImagePath(slug: string): string {
  return path.join(IMAGE_DIR, `${slug}.webp`)
}

function imageExists(slug: string): boolean {
  return fs.existsSync(getImagePath(slug))
}

function resolvePrompt(slug: string): string | null {
  // 1. Canonical prompt for this slug
  if (POST_PROMPTS[slug]) return POST_PROMPTS[slug]

  // 2. Check post-list for imagePrompt
  const post = POSTS.find(p => p.slug === slug)
  if (post?.imagePrompt) return buildPrompt(post.imagePrompt)

  return null
}

// ─── Core: generate a single image ─────────────────────────

async function generateImage(slug: string, prompt: string): Promise<boolean> {
  try {
    console.log(`\n   Generating: ${slug}`)
    console.log(`   Prompt: ${prompt.slice(0, 100)}...`)

    const imageOutput = await replicate.run(
      'black-forest-labs/flux-schnell',
      {
        input: {
          prompt,
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

    const imagePath = getImagePath(slug)
    fs.writeFileSync(imagePath, imageBuffer)

    const sizeKb = Math.round(imageBuffer.length / 1024)
    console.log(`   Saved: public/images/blog/${slug}.webp (${sizeKb}KB)`)
    return true
  } catch (err) {
    console.error(`   Failed: ${err instanceof Error ? err.message.slice(0, 100) : 'unknown error'}`)
    return false
  }
}

// ─── Mode: --check (audit) ─────────────────────────────────

function runAudit(): void {
  console.log('\n' + '='.repeat(60))
  console.log('IMAGE AUDIT')
  console.log('='.repeat(60))

  const allSlugs = Object.keys(POST_PROMPTS)
  const existing: string[] = []
  const missing: string[] = []

  for (const slug of allSlugs) {
    if (imageExists(slug)) {
      existing.push(slug)
    } else {
      missing.push(slug)
    }
  }

  console.log(`\nCanonical prompts: ${allSlugs.length}`)
  console.log(`Images found:     ${existing.length}`)
  console.log(`Images missing:   ${missing.length}`)

  if (existing.length > 0) {
    console.log('\n--- Existing ---')
    existing.forEach(s => console.log(`  [OK] ${s}`))
  }

  if (missing.length > 0) {
    console.log('\n--- Missing ---')
    missing.forEach(s => console.log(`  [!!] ${s}`))
  }

  // Also check post-list slugs that have no canonical prompt
  const postListSlugs = POSTS.map(p => p.slug)
  const noCanonical = postListSlugs.filter(s => !POST_PROMPTS[s])
  if (noCanonical.length > 0) {
    console.log(`\n--- Posts without canonical prompt (${noCanonical.length}) ---`)
    noCanonical.forEach(s => {
      const hasImage = imageExists(s) ? '[OK]' : '[!!]'
      console.log(`  ${hasImage} ${s}`)
    })
  }

  console.log('\n' + '='.repeat(60))
}

// ─── Mode: regenerate single slug ──────────────────────────

async function regenerateSingle(slug: string): Promise<void> {
  const prompt = resolvePrompt(slug)
  if (!prompt) {
    console.error(`No prompt found for slug: ${slug}`)
    console.log('\nAvailable canonical slugs:')
    Object.keys(POST_PROMPTS).forEach(s => console.log(`  - ${s}`))
    process.exit(1)
  }

  console.log(`\nRegenerating image for: ${slug}`)
  if (imageExists(slug)) {
    console.log(`   (overwriting existing image)`)
  }

  const success = await generateImage(slug, prompt)
  if (success) {
    console.log(`\nDone. Image saved to public/images/blog/${slug}.webp`)
  } else {
    console.error('\nImage generation failed.')
    process.exit(1)
  }
}

// ─── Mode: regenerate all ──────────────────────────────────

async function regenerateAll(): Promise<void> {
  const slugs = Object.keys(POST_PROMPTS)

  console.log('\n' + '='.repeat(60))
  console.log('REGENERATE ALL CANONICAL IMAGES')
  console.log(`Total: ${slugs.length} posts`)
  console.log('='.repeat(60))

  let success = 0
  let failed = 0

  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i]
    const prompt = POST_PROMPTS[slug]

    console.log(`\n[${i + 1}/${slugs.length}] ${slug}`)

    const ok = await generateImage(slug, prompt)
    if (ok) {
      success++
    } else {
      failed++
    }

    // Rate limiting — wait before next call (skip on last iteration)
    if (i < slugs.length - 1) {
      await sleep(RATE_LIMIT_MS)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('REGENERATION COMPLETE')
  console.log(`   Success: ${success}`)
  console.log(`   Failed:  ${failed}`)
  console.log('='.repeat(60))
}

// ─── Entry point ────────────────────────────────────────────

const arg = process.argv[2]

if (arg === '--check') {
  runAudit()
} else if (arg) {
  regenerateSingle(arg).catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
} else {
  regenerateAll().catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
}
