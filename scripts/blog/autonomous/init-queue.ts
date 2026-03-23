// Run once: npx tsx scripts/blog/autonomous/init-queue.ts
// Initializes the queue with all predefined posts from post-list.ts

import { POSTS } from '../post-list'
import { saveQueue, loadPublishedTopics } from './queue-manager'
import type { QueuedPost } from './queue-manager'

const published = loadPublishedTopics()
const publishedSlugs = new Set(published.map(p => p.slug))

const queuedPosts: QueuedPost[] = POSTS
  .filter(p => !publishedSlugs.has(p.slug))
  .sort((a, b) => a.tier !== b.tier ? a.tier - b.tier : a.publishWeek - b.publishWeek)
  .map(p => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    seoKeyword: p.seoKeyword,
    searchVolume: p.searchVolume,
    category: p.category,
    tags: p.tags,
    tier: p.tier,
    relatedCalculator: p.relatedCalculator,
    imagePrompt: p.imagePrompt,
    publishedAt: p.publishedAt,
    discoveredAt: new Date().toISOString(),
    source: 'predefined' as const,
  }))

saveQueue(queuedPosts)
console.log(`✅ Queue initialized with ${queuedPosts.length} posts`)
console.log(`   Tier 1: ${queuedPosts.filter(p => p.tier === 1).length}`)
console.log(`   Tier 2: ${queuedPosts.filter(p => p.tier === 2).length}`)
console.log(`   Tier 3: ${queuedPosts.filter(p => p.tier === 3).length}`)
console.log('\nFirst 5 posts in queue:')
queuedPosts.slice(0, 5).forEach((p, i) => {
  console.log(`  ${i + 1}. [Tier ${p.tier}] ${p.seoKeyword}`)
})
