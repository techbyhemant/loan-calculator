import { loadPublishedTopics, loadQueue, type QueuedPost } from './queue-manager'
import { GROQ_IMAGE_METAPHOR_INSTRUCTIONS } from '../prompts/image-prompts'
import { chatComplete } from '../lib/llm'
import { fetchRecentNews, formatNewsForPrompt } from '../intelligence/news-feed'

function getSeasonalContext(month: string): string {
  const m = month.toLowerCase()
  if (['january', 'february', 'march'].includes(m)) return 'Tax-saving season (deadline March 31). Budget announcements (Feb 1). FY-end financial planning. RBI MPC meeting in Feb.'
  if (['april', 'may', 'june'].includes(m)) return 'New financial year started. Tax filing prep begins. RBI MPC in Apr and Jun. Home buying season.'
  if (['july', 'august', 'september'].includes(m)) return 'Tax filing deadline July 31. RBI MPC in Aug. Festive season approaching — loan demand rises.'
  if (['october', 'november', 'december'].includes(m)) return 'Festive season (Navratri, Diwali, Christmas). Banks offer special loan rates. Bonus season — ideal for part payments. RBI MPC in Oct and Dec. Year-end review.'
  return ''
}

const TOPIC_DISCOVERY_PROMPT = `You are a keyword research and competitive analysis expert for LastEMI (lastemi.com), India's honest debt freedom platform covering ALL types of debt — home loans, personal loans, car loans, education loans, gold loans, credit cards, and consumer EMIs.

YOUR JOB: Discover the BEST blog post topic to publish TODAY based on:

1. SEARCH DEMAND — What Indian borrowers are actively searching for right now
2. COMPETITOR GAPS — Topics that BankBazaar, PaisaBazaar, MoneyControl, ClearTax, Bajaj Finserv, CRED, and emicalculator.net cover POORLY or don't cover at all
3. FRESHNESS — Prioritize topics tied to CURRENT events (RBI rate changes, new tax rules, budget announcements, seasonal patterns)
4. CALCULATOR LINKAGE — Every post MUST link to at least one LastEMI calculator. Available calculators:
   / (EMI Part Payment), /calculators/sip-vs-prepayment, /calculators/home-loan-eligibility,
   /calculators/tax-benefit, /calculators/rent-vs-buy, /calculators/balance-transfer,
   /calculators/salary-to-emi, /calculators/credit-card-payoff, /calculators/minimum-due-trap,
   /calculators/cc-vs-personal-loan, /calculators/multi-card-payoff, /calculators/multi-loan-planner,
   /calculators/personal-loan-payoff, /calculators/car-loan-prepayment,
   /calculators/consumer-emi-true-cost, /calculators/education-loan-80e
5. NOT COVERED YET — Must not repeat anything already published (list provided)

COMPETITOR ANALYSIS — Find gaps in these competitors:
- BankBazaar.com: Covers loan products but BIASED (earns commissions). Their content is promotional, not educational.
- PaisaBazaar.com: Similar bias. Focuses on lead generation, not honest math.
- MoneyControl.com: Good news coverage but NO interactive calculators, NO part payment analysis.
- ClearTax.in: Strong on tax but WEAK on loan strategies, prepayment math, credit card debt.
- Bajaj Finserv: Product-focused, not borrower-focused. No debt payoff strategies.
- emicalculator.net: Basic calculator, NO blog content, NO part payment simulation.

WHAT MAKES LASTEMI DIFFERENT (lean into these angles):
- We show EXACT numbers, not vague advice
- We link to interactive calculators that prove the math
- We cite RBI rules accurately (competitors often get prepayment rules wrong)
- We cover ALL loan types, not just home loans
- We include GST on credit card interest (18%) which most competitors miss
- We show after-tax effective rates (Section 24b, 80E) for loan comparison

CATEGORIES TO COVER (rotate across these, don't stay on one):
- Home loan strategies (part payments, balance transfer, prepayment timing)
- Personal loan management (prepayment with penalty, consolidation)
- Car/two-wheeler loan strategies
- Credit card debt (minimum due trap, CC vs PL, multi-card payoff)
- Education loan planning (80E, moratorium, repayment strategy)
- Consumer EMI / 0% EMI hidden costs
- Tax optimization for borrowers (80C, 24b, 80E, old vs new regime)
- RBI policy impact on EMIs
- Debt payoff strategy (which loan first, avalanche vs snowball)
- CIBIL score and credit management
- Loan process questions (NOC, foreclosure, balance transfer process)
- Income-based loan planning (salary to EMI, FOIR, co-applicant)

OUTPUT FORMAT — Return ONLY valid JSON, no preamble, no explanation:
{
  "topics": [
    {
      "slug": "url-friendly-slug-here",
      "title": "Full Article Title — With Specific Numbers",
      "description": "2-3 sentence brief. Must include a specific insight or number that makes someone click.",
      "seoKeyword": "exact search keyword 3-6 words",
      "searchVolume": 2000,
      "category": "Credit Cards",
      "tags": ["tag1", "tag2", "tag3"],
      "tier": 1,
      "relatedCalculator": "/calculators/credit-card-payoff",
      "imageMetaphor": "WARNING",
      "rationale": "Why NOW — what competitor gap or trending event makes this timely",
      "newsRelevance": 0,
      "newsHook": ""
    }
  ]
}

newsRelevance SCORING (CRITICAL — controls publish cadence):
  0 = Evergreen topic, no news tie-in
  1 = Loosely connected to a recent headline
  2 = Directly triggered by a specific recent headline — timely, urgent, high ranking potential
  Reserve "2" only for topics where a specific headline would go stale if not covered this week.

newsHook (REQUIRED if newsRelevance >= 1):
  One line quoting the specific headline that triggered this topic.
  Example: "Triggered by: 'RBI allows NDF contracts to clients' (Economic Times, today)"

Provide exactly 10 topics. Tier 1 = low competition, fast to rank. Tier 2 = medium competition. Tier 3 = authority building.
70% should be Tier 1 or 2. Mix across at least 4 different categories. At least 2 should be non-home-loan topics.

${GROQ_IMAGE_METAPHOR_INSTRUCTIONS}

IMPORTANT CONSTRAINTS:
- seoKeyword must be 3-6 words
- searchVolume must be a realistic estimate (500-30000)
- slug must be URL-safe, lowercase, hyphens only
- imageMetaphor must be one of: COMPARISON, DECLINE, GROWTH, WARNING, FORK, TIMELINE, FREEDOM, CALCULATION
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
  imageMetaphor: string
  imagePrompt?: string   // legacy fallback
  rationale: string
  newsRelevance?: 0 | 1 | 2
  newsHook?: string
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
  console.log('   🔍 Discovering new topics via Gemini...')

  const coverageContext = buildCoverageContext()
  const currentMonth = new Date().toLocaleString('default', { month: 'long' })
  const currentYear = new Date().getFullYear()

  // Fetch real-time finance news to ground topic selection in actual events.
  const news = await fetchRecentNews(20)
  const newsBlock = formatNewsForPrompt(news)

  const userPrompt = `${coverageContext}

CURRENT DATE CONTEXT:
- Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
- Month: ${currentMonth} ${currentYear}
- RBI repo rate: 5.25% (as of Feb 2026)
- Tax filing deadline: July 31 for individuals
- Seasonal context: ${getSeasonalContext(currentMonth)}

RECENT INDIAN FINANCE NEWS (last 72 hours — use to find news-driven topics):
${newsBlock}

When a headline above directly affects Indian loan borrowers (RBI rate move, new tax rule,
bank rate change, regulatory update), create a topic with newsRelevance: 2 and cite the
headline in newsHook. These topics rank fast because they capture fresh intent.

WHAT COMPETITORS ARE DOING RIGHT NOW:
- BankBazaar/PaisaBazaar: Pushing loan product comparison pages (biased, commission-driven)
- MoneyControl: News articles about RBI policy, market commentary (no actionable tools)
- ClearTax: Tax-season content ramping up, but no loan calculator integration
- Bajaj Finserv: Product landing pages, no educational blog content

LASTEMI'S PUBLISHED CONTENT COUNT: ${loadPublishedTopics().length} posts so far
TARGET: We need to publish 1 post DAILY for 90 days to build topical authority

Discover ${count} new blog post topics that:
1. Fill gaps our competitors are missing
2. Are timely for ${currentMonth} ${currentYear}
3. Link to our unique calculators (the main differentiator)
4. Cover diverse loan types (not just home loans)
5. Have specific, number-driven titles that make people click

Return ONLY valid JSON.`

  try {
    const { text } = await chatComplete({
      maxTokens: 4000,
      temperature: 0.8,
      responseFormat: 'json',
      messages: [
        { role: 'system', content: TOPIC_DISCOVERY_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    })

    if (!text) throw new Error('Empty response from Gemini')

    // Strip markdown code fences defensively (responseMimeType should prevent these, but be safe)
    const responseText = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()

    const parsed = JSON.parse(responseText) as { topics: DiscoveredTopic[] }
    const topics = parsed.topics || []

    const newsDriven = topics.filter(t => (t.newsRelevance ?? 0) >= 2).length
    console.log(`   ✅ Discovered ${topics.length} topics (${newsDriven} news-driven)`)
    topics.forEach(t => {
      const news = (t.newsRelevance ?? 0) >= 2 ? ' 📰' : ''
      console.log(`      - [Tier ${t.tier}] "${t.seoKeyword}" (~${t.searchVolume}/mo)${news}`)
    })

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
      imagePrompt: t.imagePrompt ?? '',
      imageMetaphor: t.imageMetaphor,
      discoveredAt: new Date().toISOString(),
      source: 'discovered' as const,
      newsRelevance: t.newsRelevance ?? 0,
      newsHook: t.newsHook ?? '',
    }))
  } catch (err) {
    console.error('   ❌ Topic discovery failed:', err)
    return []
  }
}
