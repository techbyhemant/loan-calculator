// Run: npx tsx scripts/blog/generate-all.ts
// Generates all posts that don't yet have an .mdx file
// Processes in tier order (Tier 1 first) for optimal SEO impact

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { POSTS } from './post-list'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

async function generateAll(): Promise<void> {
  // Sort by tier first, then by publishWeek within each tier
  const pending = POSTS
    .filter(p => {
      const mdxPath = path.join(BLOG_DIR, `${p.slug}.mdx`)
      return !fs.existsSync(mdxPath)
    })
    .sort((a, b) => a.tier !== b.tier ? a.tier - b.tier : a.publishWeek - b.publishWeek)

  const tier1 = pending.filter(p => p.tier === 1).length
  const tier2 = pending.filter(p => p.tier === 2).length
  const tier3 = pending.filter(p => p.tier === 3).length

  console.log(`\n📋 Found ${pending.length} posts to generate (${POSTS.length - pending.length} already exist)`)
  console.log(`📊 Publishing order: ${tier1} Tier-1 posts → ${tier2} Tier-2 posts → ${tier3} Tier-3 posts\n`)

  if (pending.length === 0) {
    console.log('✅ All posts already generated.')
    return
  }

  for (let i = 0; i < pending.length; i++) {
    const post = pending[i]
    console.log(`\n[${i + 1}/${pending.length}] [T${post.tier} W${post.publishWeek}] Processing: ${post.slug}`)

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
    } catch {
      console.error(`   ❌ Failed to generate ${post.slug}`)
      console.log('   Continuing with next post...')
    }
  }

  console.log('\n═══════════════════════════════════════')
  console.log('BATCH GENERATION COMPLETE')
  console.log('═══════════════════════════════════════')
  console.log(`Generated: ${pending.length} posts`)
  console.log('Next: Run npm run blog:check [slug] on each post before publishing.')
}

generateAll()
