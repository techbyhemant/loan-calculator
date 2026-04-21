// Free real-time news feed for the topic discoverer.
// Pulls RSS from Indian finance news sources. No API keys, no cost.
//
// The discoverer feeds these headlines into its prompt so topic selection
// reacts to yesterday's news, not just hard-coded seasonal rules.

export interface NewsHeadline {
  title: string
  source: string
  pubDate: string
  url: string
}

interface FeedConfig {
  name: string
  url: string
  // Only keep headlines containing at least one of these keywords.
  // Keeps the feed focused on loan/debt/EMI/RBI content.
  keywordFilter?: string[]
}

const FEEDS: FeedConfig[] = [
  {
    name: 'Economic Times — Banking/Finance',
    url: 'https://economictimes.indiatimes.com/industry/banking/finance/rssfeeds/13358319.cms',
  },
  {
    name: 'Moneycontrol — Personal Finance',
    url: 'https://www.moneycontrol.com/rss/personalfinance.xml',
  },
  {
    name: 'Business Standard — Finance',
    url: 'https://www.business-standard.com/rss/finance-103.rss',
  },
  {
    name: 'RBI Press Releases',
    url: 'https://website.rbi.org.in/documents/d/pressreleaserss/PressReleaserss-RSS.xml',
  },
  {
    name: 'LiveMint — Money',
    url: 'https://www.livemint.com/rss/money',
  },
]

// Only headlines relevant to our niche. Empty list = keep all.
const RELEVANCE_KEYWORDS = [
  'loan', 'emi', 'repo rate', 'rbi', 'home loan', 'personal loan',
  'credit card', 'interest rate', 'prepayment', 'tax', 'mortgage',
  'borrower', 'debt', 'lending', 'nbfc', 'banking', 'finance',
  'section 80', 'section 24', 'balance transfer', 'foreclosure',
]

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ').trim()
}

// Lightweight RSS/Atom parser — avoids adding a dependency for ~30 lines.
function parseFeed(xml: string): { title: string; pubDate: string; link: string }[] {
  const items: { title: string; pubDate: string; link: string }[] = []
  const itemRegex = /<(?:item|entry)\b[^>]*>([\s\S]*?)<\/(?:item|entry)>/gi
  let match: RegExpExecArray | null
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]
    const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(block)?.[1]
    const pubDate =
      /<pubDate>([\s\S]*?)<\/pubDate>/i.exec(block)?.[1] ??
      /<updated>([\s\S]*?)<\/updated>/i.exec(block)?.[1] ??
      /<dc:date>([\s\S]*?)<\/dc:date>/i.exec(block)?.[1]
    const link =
      /<link[^>]*>([\s\S]*?)<\/link>/i.exec(block)?.[1] ??
      /<link[^>]+href="([^"]+)"/i.exec(block)?.[1]
    if (title && link) {
      items.push({
        title: stripTags(title.replace(/<!\[CDATA\[|\]\]>/g, '')),
        pubDate: pubDate ? stripTags(pubDate.replace(/<!\[CDATA\[|\]\]>/g, '')) : '',
        link: stripTags(link.replace(/<!\[CDATA\[|\]\]>/g, '')),
      })
    }
  }
  return items
}

async function fetchFeed(feed: FeedConfig): Promise<NewsHeadline[]> {
  try {
    const res = await fetch(feed.url, {
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'Mozilla/5.0 LastEMIBot/1.0' },
    })
    if (!res.ok) {
      console.log(`   ⚠️  ${feed.name}: ${res.status}`)
      return []
    }
    const xml = await res.text()
    const items = parseFeed(xml)
    return items.map(i => ({
      title: i.title,
      source: feed.name,
      pubDate: i.pubDate,
      url: i.link,
    }))
  } catch (err) {
    console.log(`   ⚠️  ${feed.name}: ${err instanceof Error ? err.message : 'fetch failed'}`)
    return []
  }
}

function isRelevant(headline: string): boolean {
  const lower = headline.toLowerCase()
  return RELEVANCE_KEYWORDS.some(k => lower.includes(k))
}

function isRecent(pubDate: string, maxAgeHours = 72): boolean {
  if (!pubDate) return true // Keep items with missing dates rather than drop them
  const parsed = Date.parse(pubDate)
  if (isNaN(parsed)) return true
  const ageHours = (Date.now() - parsed) / (1000 * 60 * 60)
  return ageHours <= maxAgeHours
}

/** Fetch current loan/finance news headlines from all sources. */
export async function fetchRecentNews(maxHeadlines = 25): Promise<NewsHeadline[]> {
  console.log('   📰 Fetching news from Indian finance RSS feeds...')

  const results = await Promise.all(FEEDS.map(fetchFeed))
  const all = results.flat()

  const filtered = all
    .filter(h => isRelevant(h.title))
    .filter(h => isRecent(h.pubDate))
    // Dedupe by title
    .filter((h, i, arr) => arr.findIndex(x => x.title === h.title) === i)
    // Newest first
    .sort((a, b) => {
      const da = Date.parse(a.pubDate) || 0
      const db = Date.parse(b.pubDate) || 0
      return db - da
    })
    .slice(0, maxHeadlines)

  console.log(`   📰 ${filtered.length} relevant headlines (of ${all.length} total)`)
  return filtered
}

/** Format headlines as a compact block for injection into an LLM prompt. */
export function formatNewsForPrompt(news: NewsHeadline[]): string {
  if (news.length === 0) return '(No recent news headlines available.)'
  return news
    .map((h, i) => `${i + 1}. [${h.source.split('—')[0].trim()}] ${h.title}`)
    .join('\n')
}
