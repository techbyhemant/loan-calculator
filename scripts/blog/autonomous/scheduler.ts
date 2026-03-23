// Entry point for the autonomous blog system.
// Run: npx tsx scripts/blog/autonomous/scheduler.ts
// This is what GitHub Actions calls on its cron schedule.

import fs from 'fs'
import path from 'path'
import {
  loadQueue,
  dequeueNext,
  enqueue,
  saveQueue,
  getQueueStats,
  getTotalPublishedCount,
  getPostsPublishedThisWeek,
  isDuplicate,
  markPublished,
  logPublishAttempt,
} from './queue-manager'
import { discoverNewTopics } from './topic-discoverer'
import { getActiveSeasonalPosts } from './seasonal-topics'
import { generateBlogPost } from '../generate-post'
import { checkPostQuality } from '../check-quality'

const SPRINT_PHASE_MAX = 3
const MAINTENANCE_PHASE_MAX = 1
const SPRINT_PHASE_POST_COUNT = 36
const MIN_QUEUE_DEPTH = 10

async function run(): Promise<void> {
  console.log('\n' + '═'.repeat(60))
  console.log('LASTEMI AUTONOMOUS BLOG ENGINE')
  console.log(`Date: ${new Date().toISOString()}`)
  console.log('═'.repeat(60))

  const totalPublished = getTotalPublishedCount()
  const isSprintPhase = totalPublished < SPRINT_PHASE_POST_COUNT
  const maxPerWeek = isSprintPhase ? SPRINT_PHASE_MAX : MAINTENANCE_PHASE_MAX
  const postsThisWeek = getPostsPublishedThisWeek()

  console.log(`\n📊 Status:`)
  console.log(`   Phase: ${isSprintPhase ? 'SPRINT (3x/week)' : 'MAINTENANCE (1x/week)'}`)
  console.log(`   Total published: ${totalPublished}`)
  console.log(`   Published this week: ${postsThisWeek}/${maxPerWeek}`)

  if (postsThisWeek >= maxPerWeek) {
    console.log(`\n✅ Weekly limit reached (${postsThisWeek}/${maxPerWeek}). No action needed today.`)
    return
  }

  // Inject seasonal topics at front of queue
  console.log('\n📅 Checking for seasonal topics...')
  const seasonalPosts = getActiveSeasonalPosts()
  const newSeasonalPosts = seasonalPosts.filter(p => !isDuplicate(p.seoKeyword))
  if (newSeasonalPosts.length > 0) {
    console.log(`   Found ${newSeasonalPosts.length} active seasonal topics`)
    const currentQueue = loadQueue()
    saveQueue([...newSeasonalPosts, ...currentQueue])
  }

  // Discover new topics if queue is running low
  const stats = getQueueStats()
  console.log(`\n📋 Queue status: ${stats.total} posts waiting`)
  console.log(`   Tier 1: ${stats.tier1} | Tier 2: ${stats.tier2} | Tier 3: ${stats.tier3}`)

  if (stats.total < MIN_QUEUE_DEPTH) {
    console.log(`\n🔍 Queue running low (${stats.total} < ${MIN_QUEUE_DEPTH}). Discovering new topics...`)
    const newTopics = await discoverNewTopics(15)
    if (newTopics.length > 0) {
      enqueue(newTopics)
      console.log(`   Queue now has ${loadQueue().length} posts`)
    }
  }

  // Get next post from queue
  const nextPost = dequeueNext()
  if (!nextPost) {
    console.log('\n❌ Queue is empty and discovery failed. Cannot publish today.')
    return
  }

  console.log(`\n🚀 Publishing next post:`)
  console.log(`   Title: ${nextPost.title}`)
  console.log(`   Keyword: ${nextPost.seoKeyword}`)
  console.log(`   Tier: ${nextPost.tier} | Source: ${nextPost.source}`)

  try {
    console.log('\n✍️  Generating post...')
    await generateBlogPost(nextPost.slug, nextPost)

    console.log('\n📋 Running quality check...')
    const qualityResult = checkPostQuality(nextPost.slug)

    console.log(`\n   Quality score: ${qualityResult.passCount}/12`)

    if (qualityResult.passCount < 9) {
      console.log(`\n⚠️  Quality too low (${qualityResult.passCount}/12). Skipping.`)
      qualityResult.failures.forEach(f => console.log(`   - ${f}`))

      logPublishAttempt({
        slug: nextPost.slug,
        generatedAt: new Date().toISOString(),
        qualityScore: qualityResult.passCount,
        published: false,
        error: `Quality check failed: ${qualityResult.failures.join(', ')}`,
      })

      if (qualityResult.passCount >= 7) {
        console.log('   Re-queuing for retry...')
        enqueue([{ ...nextPost, discoveredAt: new Date().toISOString() }])
      }
      return
    }

    const mdxContent = fs.readFileSync(
      path.join(process.cwd(), 'content/blog', `${nextPost.slug}.mdx`),
      'utf-8',
    )
    const wordCount = mdxContent.split(/\s+/).length

    // Post-generation SEO: internal links + distribution content
    console.log('\n🔗 Adding internal links...')
    const { addInternalLinks } = await import('./internal-linker')
    await addInternalLinks(nextPost.slug)

    console.log('\n📣 Generating distribution content...')
    const { generateDistributionContent } = await import('./distributor')
    await generateDistributionContent(nextPost)

    markPublished(nextPost, wordCount)
    logPublishAttempt({
      slug: nextPost.slug,
      generatedAt: new Date().toISOString(),
      qualityScore: qualityResult.passCount,
      published: true,
    })

    console.log('\n' + '═'.repeat(60))
    console.log('✅ POST GENERATED SUCCESSFULLY')
    console.log('═'.repeat(60))
    console.log(`   File: content/blog/${nextPost.slug}.mdx`)
    console.log(`   Image: public/images/blog/${nextPost.slug}.webp`)
    console.log(`   Quality: ${qualityResult.passCount}/12`)
    console.log(`   Word count: ~${wordCount}`)
  } catch (err) {
    console.error('\n❌ Generation failed:', err)
    logPublishAttempt({
      slug: nextPost.slug,
      generatedAt: new Date().toISOString(),
      qualityScore: 0,
      published: false,
      error: String(err),
    })
  }
}

run().catch(err => {
  console.error('Fatal error in scheduler:', err)
  process.exit(1)
})
