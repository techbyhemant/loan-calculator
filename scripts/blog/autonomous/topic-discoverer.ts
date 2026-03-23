import Groq from 'groq-sdk'
import { loadPublishedTopics, loadQueue, type QueuedPost } from './queue-manager'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const TOPIC_DISCOVERY_PROMPT = `You are a keyword research expert for LastEMI (lastemi.com),
India's honest debt freedom platform. Your job is to discover blog post topics that:

1. Indian home loan borrowers are actively searching for right now
2. Have not been covered by LastEMI yet (list of covered topics provided below)
3. Have low to medium competition (avoid Bajaj Finserv's core keywords)
4. Match one of these categories:
   - Home loan part payments and prepayment strategies
   - EMI calculation and optimization
   - Indian tax deductions related to loans (80C, 24b, 80E, 80EEA)
   - Debt payoff strategies for multiple loans
   - RBI rules and banking regulations affecting borrowers
   - Loan product comparisons (personal loan, gold loan, LAP)
   - Home loan process questions (NOC, statement, foreclosure)
   - Credit score and loan impact
   - Property purchase and loan planning

OUTPUT FORMAT — Return ONLY valid JSON, no preamble, no explanation:
{
  "topics": [
    {
      "slug": "url-friendly-slug-here",
      "title": "Full Article Title Here",
      "description": "2-3 sentence article brief describing what we cover and the key insight.",
      "seoKeyword": "exact search keyword 3-6 words",
      "searchVolume": 2000,
      "category": "Home Loans",
      "tags": ["tag1", "tag2", "tag3"],
      "tier": 1,
      "relatedCalculator": "/",
      "imagePrompt": "Detailed image prompt for Flux Schnell, no text, no faces, professional fintech style",
      "rationale": "Why this topic is a good opportunity right now"
    }
  ]
}

Provide exactly 10 topics. Tier 1 = low competition fast wins. Tier 2 = medium competition. Tier 3 = broad authority-building.
Prioritize Tier 1 and Tier 2 topics.

IMPORTANT CONSTRAINTS:
- seoKeyword must be 3-6 words
- searchVolume must be a realistic estimate (500-30000)
- slug must be URL-safe, lowercase, hyphens only
- Do NOT suggest topics that are variations of what is already covered
- Avoid topics requiring real-time data you do not have
- All examples and calculations must use Indian context (₹, RBI, SBI, HDFC, etc.)`

interface DiscoveredTopic {
  slug: string
  title: string
  description: string
  seoKeyword: string
  searchVolume: number
  category: string
  tags: string[]
  tier: 1 | 2 | 3
  relatedCalculator?: string
  imagePrompt: string
  rationale: string
}

function buildCoverageContext(): string {
  const published = loadPublishedTopics()
  const queued = loadQueue()

  const allCovered = [
    ...published.map(p => p.seoKeyword),
    ...queued.map(p => p.seoKeyword),
  ]

  if (allCovered.length === 0) {
    return 'No topics have been covered yet. This is the beginning of the blog.'
  }

  return `ALREADY COVERED TOPICS (do NOT repeat these):
${allCovered.map(kw => `- ${kw}`).join('\n')}`
}

export async function discoverNewTopics(count: number = 10): Promise<QueuedPost[]> {
  console.log('   🔍 Discovering new topics via Groq AI...')

  const coverageContext = buildCoverageContext()
  const currentMonth = new Date().toLocaleString('default', { month: 'long' })
  const currentYear = new Date().getFullYear()

  const userPrompt = `${coverageContext}

CURRENT DATE CONTEXT:
- Month: ${currentMonth} ${currentYear}
- This context matters for seasonal relevance (tax season, RBI meetings, festival bonuses)

Discover ${count} new blog post opportunities for LastEMI that avoid all covered topics above.
Focus on what Indian home loan borrowers are confused about or searching for right now.

Return ONLY valid JSON.`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 4000,
      temperature: 0.8,
      messages: [
        { role: 'system', content: TOPIC_DISCOVERY_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) throw new Error('Empty response from Groq')

    const parsed = JSON.parse(responseText) as { topics: DiscoveredTopic[] }
    const topics = parsed.topics || []

    console.log(`   ✅ Discovered ${topics.length} potential new topics`)
    topics.forEach(t => console.log(`      - [Tier ${t.tier}] "${t.seoKeyword}" (~${t.searchVolume}/mo)`))

    return topics.map(t => ({
      slug: t.slug,
      title: t.title,
      description: t.description,
      seoKeyword: t.seoKeyword,
      searchVolume: t.searchVolume,
      category: t.category,
      tags: t.tags,
      tier: t.tier,
      relatedCalculator: t.relatedCalculator,
      imagePrompt: t.imagePrompt,
      discoveredAt: new Date().toISOString(),
      source: 'discovered' as const,
    }))
  } catch (err) {
    console.error('   ❌ Topic discovery failed:', err)
    return []
  }
}
