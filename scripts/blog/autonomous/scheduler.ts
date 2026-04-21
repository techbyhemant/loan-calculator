// Entry point for the autonomous blog system.
// Run: npx tsx scripts/blog/autonomous/scheduler.ts
// This is what GitHub Actions calls on its cron schedule.
//
// Flow:
// 1. Check finance calendar — any event-triggered posts for today?
// 2. Check mode: SPRINT (<90 posts) or MAINTENANCE (>=90)?
// 3. SPRINT: 1 new post/day + 1 stale update if high-priority found
// 4. MAINTENANCE: 1 new post every 3 days + 1 stale update/day
// 5. Log cost: record tokens used

import fs from 'fs'
import path from 'path'
import {
  loadQueue,
  dequeueNext,
  enqueue,
  saveQueue,
  getQueueStats,
  getTotalPublishedCount,
  isDuplicate,
  markPublished,
  logPublishAttempt,
  type QueuedPost,
} from './queue-manager'
import { discoverNewTopics } from './topic-discoverer'
import { getActiveSeasonalPosts } from './seasonal-topics'
import { getEventsForToday, type FinanceEvent } from '../intelligence/finance-calendar'
import { scanForStaleContent, getMostUrgentUpdate } from '../intelligence/freshness-scanner'
import { updatePost, type UpdateResult } from '../intelligence/update-generator'
import { generateBlogPost } from '../generate-post'
import { checkPostQuality } from '../check-quality'

// ─── Constants ─────────────────────────────────────────
const SPRINT_POST_THRESHOLD = 90
const MIN_QUEUE_DEPTH = 10
const FORCE_MODE = process.argv.includes('--force')
const COST_LOG_FILE = path.join(process.cwd(), 'data', 'blog-cost-log.json')

// ─── Cost tracking ─────────────────────────────────────
interface CostEntry {
  date: string
  action: 'generate' | 'update' | 'discover'
  slug: string
  tokensUsed: number
}

function logCost(entry: CostEntry): void {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  const log: CostEntry[] = fs.existsSync(COST_LOG_FILE)
    ? JSON.parse(fs.readFileSync(COST_LOG_FILE, 'utf-8'))
    : []
  log.push(entry)
  fs.writeFileSync(COST_LOG_FILE, JSON.stringify(log, null, 2))
}

function getTodaysCostTotal(): number {
  if (!fs.existsSync(COST_LOG_FILE)) return 0
  const log: CostEntry[] = JSON.parse(fs.readFileSync(COST_LOG_FILE, 'utf-8'))
  const today = new Date().toISOString().split('T')[0]
  return log
    .filter(e => e.date.startsWith(today))
    .reduce((sum, e) => sum + e.tokensUsed, 0)
}

// ─── Helpers ───────────────────────────────────────────

function getPostsPublishedToday(): number {
  const dataDir = path.join(process.cwd(), 'data')
  const publishedFile = path.join(dataDir, 'published-topics.json')
  if (!fs.existsSync(publishedFile)) return 0
  const published = JSON.parse(fs.readFileSync(publishedFile, 'utf-8'))
  const today = new Date().toISOString().split('T')[0]
  return published.filter((p: { publishedAt: string }) =>
    p.publishedAt.startsWith(today)
  ).length
}

function getUpdatesToday(): number {
  if (!fs.existsSync(COST_LOG_FILE)) return 0
  const log: CostEntry[] = JSON.parse(fs.readFileSync(COST_LOG_FILE, 'utf-8'))
  const today = new Date().toISOString().split('T')[0]
  return log.filter(e => e.date.startsWith(today) && e.action === 'update').length
}

function getDaysSinceLastNewPost(): number {
  const dataDir = path.join(process.cwd(), 'data')
  const publishedFile = path.join(dataDir, 'published-topics.json')
  if (!fs.existsSync(publishedFile)) return Infinity
  const published = JSON.parse(fs.readFileSync(publishedFile, 'utf-8'))
  if (published.length === 0) return Infinity
  const latest = published
    .map((p: { publishedAt: string }) => new Date(p.publishedAt).getTime())
    .sort((a: number, b: number) => b - a)[0]
  return Math.floor((Date.now() - latest) / (1000 * 60 * 60 * 24))
}

function financeEventToQueuedPost(event: FinanceEvent): QueuedPost {
  return {
    slug: event.topic.slug,
    title: event.topic.title,
    description: event.topic.description,
    seoKeyword: event.topic.seoKeyword,
    searchVolume: 10000,
    category: event.topic.category,
    tags: [event.topic.category.toLowerCase(), 'rbi', 'emi'],
    tier: 1 as const,
    relatedCalculator: event.topic.relatedCalculator,
    imagePrompt: '',
    imageMetaphor: 'TIMELINE' as const,  // calendar events are always timeline-related
    discoveredAt: new Date().toISOString(),
    source: 'seasonal' as const,
  }
}

// ─── Core: Generate a new post ─────────────────────────

async function generateNewPost(post: QueuedPost): Promise<{ success: boolean; tokensUsed: number }> {
  let tokensUsed = 0

  try {
    console.log('\n   Generating post...')
    await generateBlogPost(post.slug, post)

    console.log('   Running quality check...')
    const qualityResult = checkPostQuality(post.slug)

    console.log(`   Quality score: ${qualityResult.passCount}/12`)

    if (qualityResult.passCount < 9) {
      console.log(`   Quality too low (${qualityResult.passCount}/12). Skipping.`)
      qualityResult.failures.forEach(f => console.log(`   - ${f}`))

      logPublishAttempt({
        slug: post.slug,
        generatedAt: new Date().toISOString(),
        qualityScore: qualityResult.passCount,
        published: false,
        error: `Quality check failed: ${qualityResult.failures.join(', ')}`,
      })

      if (qualityResult.passCount >= 7) {
        console.log('   Re-queuing for retry...')
        enqueue([{ ...post, discoveredAt: new Date().toISOString() }])
      }
      return { success: false, tokensUsed: 3000 } // Estimate for failed generation
    }

    const mdxContent = fs.readFileSync(
      path.join(process.cwd(), 'content/blog', `${post.slug}.mdx`),
      'utf-8',
    )
    const wordCount = mdxContent.split(/\s+/).length

    // Post-generation SEO: internal links + distribution content
    console.log('   Adding internal links...')
    const { addInternalLinks } = await import('./internal-linker')
    await addInternalLinks(post.slug)

    console.log('   Generating distribution content...')
    const { generateDistributionContent } = await import('./distributor')
    await generateDistributionContent(post)

    markPublished(post, wordCount)
    logPublishAttempt({
      slug: post.slug,
      generatedAt: new Date().toISOString(),
      qualityScore: qualityResult.passCount,
      published: true,
    })

    // Estimate tokens: ~1000 prompt + ~2000 completion for generation + ~500 for distribution
    tokensUsed = 3500

    console.log(`   POST GENERATED: content/blog/${post.slug}.mdx (${wordCount} words, ${qualityResult.passCount}/12 quality)`)

    return { success: true, tokensUsed }
  } catch (err) {
    console.error('   Generation failed:', err)
    logPublishAttempt({
      slug: post.slug,
      generatedAt: new Date().toISOString(),
      qualityScore: 0,
      published: false,
      error: String(err),
    })
    return { success: false, tokensUsed: 1000 }
  }
}

// ─── Core: Update a stale post ─────────────────────────

async function refreshStalePost(): Promise<UpdateResult | null> {
  const urgent = getMostUrgentUpdate()
  if (!urgent) {
    console.log('   No stale posts found — all content is fresh.')
    return null
  }

  console.log(`   Updating stale post: "${urgent.title}"`)
  console.log(`   Priority: ${urgent.priority} | Action: ${urgent.suggestedAction}`)
  urgent.reasons.forEach(r => console.log(`   -> ${r}`))

  const result = await updatePost(urgent)

  if (result.success) {
    console.log(`   UPDATED: ${result.slug}`)
    logCost({
      date: new Date().toISOString(),
      action: 'update',
      slug: result.slug,
      tokensUsed: result.tokensUsed ?? 2000,
    })
  } else {
    console.log(`   Update failed: ${result.error}`)
  }

  return result
}

// ─── Main scheduler ────────────────────────────────────

async function run(): Promise<{ generationAttempted: boolean; generationSucceeded: boolean }> {
  let generationAttempted = false
  let generationSucceeded = false
  console.log('\n' + '='.repeat(60))
  console.log('LASTEMI AUTONOMOUS BLOG ENGINE')
  console.log(`Date: ${new Date().toISOString()}`)
  console.log('='.repeat(60))

  const totalPublished = getTotalPublishedCount()
  const isSprintPhase = totalPublished < SPRINT_POST_THRESHOLD
  const alreadyPublishedToday = getPostsPublishedToday()
  const alreadyUpdatedToday = getUpdatesToday()
  const daysSinceLastPost = getDaysSinceLastNewPost()

  console.log(`\nStatus:`)
  console.log(`   Phase: ${isSprintPhase ? `SPRINT (daily, ${totalPublished}/${SPRINT_POST_THRESHOLD})` : 'MAINTENANCE (1 new/3 days)'}`)
  console.log(`   Total published: ${totalPublished}`)
  console.log(`   Published today: ${alreadyPublishedToday}`)
  console.log(`   Updated today: ${alreadyUpdatedToday}`)
  console.log(`   Days since last post: ${daysSinceLastPost === Infinity ? 'never' : daysSinceLastPost}`)
  console.log(`   Tokens used today: ${getTodaysCostTotal()}`)

  // ─── Step 1: Check finance calendar ──────────────────
  console.log('\n--- Step 1: Finance Calendar Check ---')
  const calendarEvents = getEventsForToday()
  if (calendarEvents.length > 0) {
    console.log(`   Found ${calendarEvents.length} event-triggered topic(s):`)
    const eventPosts: QueuedPost[] = []
    for (const event of calendarEvents) {
      console.log(`   -> ${event.name}: "${event.topic.title}"`)
      const queuedPost = financeEventToQueuedPost(event)
      if (!isDuplicate(queuedPost.seoKeyword)) {
        eventPosts.push(queuedPost)
      } else {
        console.log(`      (skipped — already published or queued)`)
      }
    }
    if (eventPosts.length > 0) {
      const currentQueue = loadQueue()
      saveQueue([...eventPosts, ...currentQueue]) // Front of queue = high priority
      console.log(`   Queued ${eventPosts.length} event post(s) with high priority`)
    }
  } else {
    console.log('   No calendar events for today.')
  }

  // ─── Step 1b: Inject seasonal topics ─────────────────
  console.log('\n--- Step 1b: Seasonal Topics Check ---')
  const seasonalPosts = getActiveSeasonalPosts()
  const newSeasonalPosts = seasonalPosts.filter(p => !isDuplicate(p.seoKeyword))
  if (newSeasonalPosts.length > 0) {
    console.log(`   Found ${newSeasonalPosts.length} active seasonal topic(s)`)
    const currentQueue = loadQueue()
    saveQueue([...newSeasonalPosts, ...currentQueue])
  } else {
    console.log('   No new seasonal topics.')
  }

  // ─── Step 2: Ensure queue depth ──────────────────────
  const stats = getQueueStats()
  console.log(`\n--- Step 2: Queue Status ---`)
  console.log(`   Queue: ${stats.total} posts (T1: ${stats.tier1} | T2: ${stats.tier2} | T3: ${stats.tier3})`)

  if (stats.total < MIN_QUEUE_DEPTH) {
    console.log(`   Queue running low (${stats.total} < ${MIN_QUEUE_DEPTH}). Discovering new topics...`)
    const newTopics = await discoverNewTopics(15)
    if (newTopics.length > 0) {
      enqueue(newTopics)
      logCost({
        date: new Date().toISOString(),
        action: 'discover',
        slug: 'topic-discovery',
        tokensUsed: 4000, // Estimate for discovery call
      })
      console.log(`   Queue now has ${loadQueue().length} posts`)
    }
  }

  // ─── Step 3: Decide what to do today ─────────────────
  if (isSprintPhase) {
    // SPRINT MODE: 1 post/day default, up to 3 when news-driven topics exist.
    // We pull from the queue, then add news-driven discoveries if needed.
    console.log('\n--- Step 3: SPRINT Mode (news-aware) ---')

    // Pull up to 3 candidates from the queue — but only publish the news-driven ones
    // beyond the first. This prevents mass-publishing evergreen content.
    const candidates = [] as (ReturnType<typeof dequeueNext> & object)[]
    for (let i = 0; i < 3; i++) {
      const p = dequeueNext()
      if (!p) break
      candidates.push(p)
    }

    // If queue is empty OR we got only evergreen topics, discover news-driven ones.
    // Any topic with newsRelevance >= 2 justifies an additional post today.
    const hasHighNews = candidates.some(p => (p.newsRelevance ?? 0) >= 2)
    if (candidates.length === 0 || !hasHighNews) {
      console.log('   Checking for news-driven topics...')
      const discovered = await discoverNewTopics(5)
      if (discovered.length > 0) {
        logCost({
          date: new Date().toISOString(),
          action: 'discover',
          slug: 'on-demand-discovery',
          tokensUsed: 4000,
        })
        // Filter only news-driven (newsRelevance >= 2), queue the rest for later
        const newsDriven = discovered.filter(d => (d.newsRelevance ?? 0) >= 2)
        const evergreen = discovered.filter(d => (d.newsRelevance ?? 0) < 2)
        if (evergreen.length > 0) enqueue(evergreen)

        // If queue was empty, use first discovered (news-driven OR evergreen)
        if (candidates.length === 0 && discovered.length > 0) {
          candidates.push(discovered[0])
          // Remove this one from further queueing consideration
          if ((discovered[0].newsRelevance ?? 0) < 2 && evergreen.length > 0) {
            // Already enqueued above, but the one we just popped shouldn't be re-added
          }
        }
        // Add ALL news-driven topics as additional candidates
        for (const nd of newsDriven) {
          if (!candidates.find(c => c.slug === nd.slug)) candidates.push(nd)
        }
      }
    }

    // Publish logic: always publish the first. Publish additional ONLY if newsRelevance >= 2.
    // Hard cap at 3 per day.
    const toPublish = [] as typeof candidates
    for (const c of candidates) {
      if (toPublish.length === 0) {
        toPublish.push(c) // First post always goes
      } else if ((c.newsRelevance ?? 0) >= 2 && toPublish.length < 3) {
        toPublish.push(c) // Additional posts only if news-driven
      } else {
        // Put it back on the queue for a future run
        enqueue([c])
      }
    }

    console.log(`   Will publish ${toPublish.length} post(s) today` +
      (toPublish.length > 1 ? ` (${toPublish.filter(p => (p.newsRelevance ?? 0) >= 2).length} news-driven)` : ''))

    for (const nextPost of toPublish) {
      const newsTag = (nextPost.newsRelevance ?? 0) >= 2 ? ' 📰' : ''
      console.log(`\n   NEW POST${newsTag}: "${nextPost.title}"`)
      console.log(`   Keyword: ${nextPost.seoKeyword} | Tier: ${nextPost.tier} | Source: ${nextPost.source ?? 'queue'}`)
      if (nextPost.newsHook) console.log(`   Hook: ${nextPost.newsHook}`)

      generationAttempted = true
      const result = await generateNewPost(nextPost)
      if (result.success) generationSucceeded = true
      logCost({
        date: new Date().toISOString(),
        action: 'generate',
        slug: nextPost.slug,
        tokensUsed: result.tokensUsed,
      })
    }

    if (toPublish.length === 0) {
      console.log('   Could not find or discover a topic — skipping today.')
    }

    // 3b. Run freshness scanner and update 1 stale post if high-priority
    console.log('\n--- Step 3b: Freshness Check (Sprint) ---')
    if (alreadyUpdatedToday === 0) {
      const staleResults = scanForStaleContent()
      const highPriority = staleResults.filter(p => p.priority === 'high')
      console.log(`   Stale posts: ${staleResults.length} total, ${highPriority.length} high-priority`)

      if (highPriority.length > 0) {
        console.log('   Updating 1 high-priority stale post...')
        await refreshStalePost()
      } else {
        console.log('   No high-priority stale posts — skipping update.')
      }
    } else {
      console.log(`   Already updated ${alreadyUpdatedToday} post(s) today — skipping.`)
    }

  } else {
    // MAINTENANCE MODE: 1 new post every 3 days + 1 update per day
    console.log('\n--- Step 3: MAINTENANCE Mode ---')

    // 3a. Generate 1 new post every 3 days
    const shouldGenerateNew = daysSinceLastPost >= 3 && alreadyPublishedToday === 0
    if (shouldGenerateNew) {
      let nextPost = dequeueNext()
      if (!nextPost) {
        console.log('   Queue empty — discovering a fresh topic via AI...')
        const discovered = await discoverNewTopics(3)
        if (discovered.length > 0) {
          nextPost = discovered[0]
          if (discovered.length > 1) enqueue(discovered.slice(1))
        }
      }
      if (nextPost) {
        console.log(`\n   NEW POST (maintenance): "${nextPost.title}"`)
        console.log(`   Keyword: ${nextPost.seoKeyword} | Tier: ${nextPost.tier} | Source: ${nextPost.source ?? 'discovered'}`)

        generationAttempted = true
        const result = await generateNewPost(nextPost)
        generationSucceeded = result.success
        logCost({
          date: new Date().toISOString(),
          action: 'generate',
          slug: nextPost.slug,
          tokensUsed: result.tokensUsed,
        })
      } else {
        console.log('   Queue is empty — cannot generate a new post.')
      }
    } else if (alreadyPublishedToday > 0) {
      console.log(`   Already published today — skipping generation.`)
    } else {
      console.log(`   Last post was ${daysSinceLastPost} day(s) ago — next new post in ${3 - daysSinceLastPost} day(s).`)
    }

    // 3b. Update 1 stale post every day
    console.log('\n--- Step 3b: Daily Update (Maintenance) ---')
    if (alreadyUpdatedToday === 0) {
      await refreshStalePost()
    } else {
      console.log(`   Already updated ${alreadyUpdatedToday} post(s) today — skipping.`)
    }

    // 3c. Run freshness scanner weekly (on Mondays)
    const today = new Date()
    if (today.getDay() === 1) { // Monday
      console.log('\n--- Weekly Freshness Report (Monday) ---')
      const staleResults = scanForStaleContent()
      if (staleResults.length === 0) {
        console.log('   All posts are fresh.')
      } else {
        console.log(`   ${staleResults.length} posts need attention:`)
        const byPriority = { high: 0, medium: 0, low: 0 }
        for (const p of staleResults) {
          byPriority[p.priority]++
        }
        console.log(`   High: ${byPriority.high} | Medium: ${byPriority.medium} | Low: ${byPriority.low}`)
        // Show top 5
        staleResults.slice(0, 5).forEach(p => {
          console.log(`   - [${p.priority.toUpperCase()}] ${p.title} (${p.ageInDays}d old)`)
        })
      }
    }
  }

  // ─── Step 4: Cost summary ────────────────────────────
  const todayCost = getTodaysCostTotal()
  console.log('\n--- Cost Summary ---')
  console.log(`   Tokens used today: ${todayCost} (Gemini free tier — no cost)`)

  console.log('\n' + '='.repeat(60))
  console.log('SCHEDULER RUN COMPLETE')
  console.log('='.repeat(60))

  return { generationAttempted, generationSucceeded }
}

run().then(result => {
  // Fail the workflow if we tried to generate a new post but didn't produce one.
  // This surfaces API errors, quality failures, etc. as red X's in GitHub Actions
  // instead of silently committing empty "daily-update" markers.
  if (result.generationAttempted && !result.generationSucceeded) {
    console.error('\n❌ Generation attempted but failed — exiting 1 to fail CI.')
    process.exit(1)
  }
}).catch(err => {
  console.error('Fatal error in scheduler:', err)
  process.exit(1)
})
