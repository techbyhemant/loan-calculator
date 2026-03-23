import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const QUEUE_FILE = path.join(DATA_DIR, 'blog-queue.json')
const PUBLISHED_FILE = path.join(DATA_DIR, 'published-topics.json')
const LOG_FILE = path.join(DATA_DIR, 'publish-log.json')

export interface QueuedPost {
  slug: string
  title: string
  description: string
  seoKeyword: string
  searchVolume: number
  category: string
  tags: string[]
  tier: 1 | 2 | 3
  publishWeek?: number
  featured?: boolean
  relatedCalculator?: string
  imagePrompt: string
  publishedAt?: string
  discoveredAt: string
  scheduledFor?: string
  source: 'predefined' | 'discovered' | 'seasonal'
}

export interface PublishedTopic {
  slug: string
  seoKeyword: string
  publishedAt: string
  wordCount: number
}

export interface PublishLogEntry {
  slug: string
  generatedAt: string
  qualityScore: number
  published: boolean
  error?: string
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

export function loadQueue(): QueuedPost[] {
  ensureDataDir()
  if (!fs.existsSync(QUEUE_FILE)) return []
  return JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf-8'))
}

export function saveQueue(queue: QueuedPost[]): void {
  ensureDataDir()
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2))
}

export function dequeueNext(): QueuedPost | null {
  const queue = loadQueue()
  if (queue.length === 0) return null
  const next = queue[0]
  saveQueue(queue.slice(1))
  return next
}

export function enqueue(posts: QueuedPost[]): void {
  const queue = loadQueue()
  const published = loadPublishedTopics()
  const publishedKeywords = new Set(published.map(p => p.seoKeyword.toLowerCase()))
  const queuedKeywords = new Set(queue.map(p => p.seoKeyword.toLowerCase()))

  const newPosts = posts.filter(p => {
    const kw = p.seoKeyword.toLowerCase()
    return !publishedKeywords.has(kw) && !queuedKeywords.has(kw)
  })

  saveQueue([...queue, ...newPosts])
  console.log(`   Enqueued ${newPosts.length} new posts (${posts.length - newPosts.length} skipped as duplicates)`)
}

export function getQueueStats(): { total: number; tier1: number; tier2: number; tier3: number } {
  const queue = loadQueue()
  return {
    total: queue.length,
    tier1: queue.filter(p => p.tier === 1).length,
    tier2: queue.filter(p => p.tier === 2).length,
    tier3: queue.filter(p => p.tier === 3).length,
  }
}

export function loadPublishedTopics(): PublishedTopic[] {
  ensureDataDir()
  if (!fs.existsSync(PUBLISHED_FILE)) return []
  return JSON.parse(fs.readFileSync(PUBLISHED_FILE, 'utf-8'))
}

export function markPublished(post: QueuedPost, wordCount: number): void {
  const published = loadPublishedTopics()
  published.push({
    slug: post.slug,
    seoKeyword: post.seoKeyword,
    publishedAt: new Date().toISOString(),
    wordCount,
  })
  fs.writeFileSync(PUBLISHED_FILE, JSON.stringify(published, null, 2))
}

export function logPublishAttempt(entry: PublishLogEntry): void {
  ensureDataDir()
  const log: PublishLogEntry[] = fs.existsSync(LOG_FILE)
    ? JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'))
    : []
  log.push(entry)
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2))
}

export function isDuplicate(seoKeyword: string): boolean {
  const published = loadPublishedTopics()
  const queue = loadQueue()
  const kw = seoKeyword.toLowerCase()

  const publishedMatch = published.some(p => {
    const pk = p.seoKeyword.toLowerCase()
    return pk === kw || pk.includes(kw) || kw.includes(pk)
  })

  const queuedMatch = queue.some(p => {
    const pk = p.seoKeyword.toLowerCase()
    return pk === kw || pk.includes(kw) || kw.includes(pk)
  })

  return publishedMatch || queuedMatch
}

export function getPostsPublishedThisWeek(): number {
  const published = loadPublishedTopics()
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  return published.filter(p => new Date(p.publishedAt) > oneWeekAgo).length
}

export function getTotalPublishedCount(): number {
  return loadPublishedTopics().length
}
