import type { QueuedPost } from './queue-manager'

interface SeasonalTrigger {
  name: string
  isActive: (date: Date) => boolean
  posts: Omit<QueuedPost, 'discoveredAt' | 'source'>[]
}

const currentYear = new Date().getFullYear()
const nextYearShort = (currentYear + 1).toString().slice(2)

const SEASONAL_TRIGGERS: SeasonalTrigger[] = [
  {
    name: 'Tax Filing Season (Jan-Mar)',
    isActive: (date) => date.getMonth() >= 0 && date.getMonth() <= 2,
    posts: [
      {
        slug: `home-loan-tax-filing-${currentYear}`,
        title: `Home Loan Tax Filing ${currentYear}: Claim Every Deduction Before March 31`,
        description: 'The financial year ends March 31. Here is exactly what to file, in what order, to maximize your home loan tax benefits before the deadline.',
        seoKeyword: `home loan tax filing ${currentYear} before march 31`,
        searchVolume: 8000,
        category: 'Tax Planning',
        tags: ['tax filing', 'home loan', 'march 31', 'deadline', '80C', '24b'],
        tier: 1,
        relatedCalculator: '/calculators/tax-benefit',
        imagePrompt: 'Calendar with March 31 highlighted as a tax deadline, home loan document beside it, urgency concept, red and blue, professional financial infographic, no text, no faces',
      },
    ],
  },
  {
    name: 'New Financial Year (April)',
    isActive: (date) => date.getMonth() === 3,
    posts: [
      {
        slug: `home-loan-strategy-fy-${currentYear}-${nextYearShort}`,
        title: `Home Loan Strategy for FY ${currentYear}-${nextYearShort}: What to Do in April`,
        description: 'The new financial year starts now. The first three months are the best time to make part payments. Here is exactly what to do and why April matters most.',
        seoKeyword: `home loan strategy new financial year ${currentYear}`,
        searchVolume: 5000,
        category: 'Debt Strategy',
        tags: ['new financial year', 'April', 'part payment strategy', 'home loan'],
        tier: 1,
        relatedCalculator: '/',
        imagePrompt: 'New year calendar flipping to April, financial planning concept, fresh start and loan strategy visual, green and blue, no text, no faces, clean vector',
      },
    ],
  },
  {
    name: 'Union Budget (Feb)',
    isActive: (date) => date.getMonth() === 1,
    posts: [
      {
        slug: `union-budget-${currentYear}-home-loan-impact`,
        title: `Union Budget ${currentYear}: What It Means for Your Home Loan and EMI`,
        description: `The Union Budget ${currentYear} has been announced. Here is exactly what changed for home loan borrowers, what stayed the same, and what to do now.`,
        seoKeyword: `union budget ${currentYear} home loan impact`,
        searchVolume: 25000,
        category: 'Home Loans',
        tags: ['union budget', 'home loan', 'tax benefit', 'EMI', 'government policy'],
        tier: 1,
        relatedCalculator: '/calculators/tax-benefit',
        imagePrompt: 'Budget briefcase with a house and EMI concept beside it, government policy and personal finance intersection, Indian government aesthetic, saffron and blue, no text, professional vector',
      },
    ],
  },
  {
    name: 'RBI Monetary Policy (Feb, Apr, Jun, Aug, Oct, Dec)',
    isActive: (date) => [1, 3, 5, 7, 9, 11].includes(date.getMonth()),
    posts: [
      {
        slug: `rbi-monetary-policy-${currentYear}-${new Date().toLocaleString('default', { month: 'long' }).toLowerCase()}-emi-impact`,
        title: `RBI Policy ${new Date().toLocaleString('default', { month: 'long' })} ${currentYear}: How It Affects Your Home Loan EMI`,
        description: 'The RBI Monetary Policy Committee met this month. Here is exactly what the decision means for floating rate home loan borrowers and what to do next.',
        seoKeyword: `RBI policy ${new Date().toLocaleString('default', { month: 'long' })} ${currentYear} home loan EMI`,
        searchVolume: 15000,
        category: 'EMI Management',
        tags: ['RBI', 'monetary policy', 'repo rate', 'EMI', 'home loan'],
        tier: 1,
        relatedCalculator: '/rbi-rates',
        imagePrompt: 'RBI Reserve Bank of India building with policy decision concept, rate announcement visual, Indian central bank aesthetic, saffron and blue, no text, professional financial news illustration',
      },
    ],
  },
  {
    name: 'Festival Season - Bonus Time (Oct-Nov)',
    isActive: (date) => date.getMonth() >= 9 && date.getMonth() <= 10,
    posts: [
      {
        slug: `diwali-bonus-home-loan-part-payment-${currentYear}`,
        title: 'Diwali Bonus? Here Is Exactly How Much to Put Towards Your Home Loan',
        description: 'Got your annual bonus? Before you spend it, here is the exact calculation showing how much of your bonus to put towards your home loan vs invest elsewhere.',
        seoKeyword: 'diwali bonus home loan prepayment how much India',
        searchVolume: 12000,
        category: 'Part Payments',
        tags: ['diwali', 'bonus', 'part payment', 'home loan', 'annual bonus'],
        tier: 1,
        relatedCalculator: '/',
        imagePrompt: 'Festive Indian home with a financial planning element, bonus payment going towards a home loan, celebration and smart finance visual, warm diwali colors with financial blue, no text, no faces, tasteful vector',
      },
    ],
  },
  {
    name: 'Year End Planning (Dec)',
    isActive: (date) => date.getMonth() === 11,
    posts: [
      {
        slug: `year-end-home-loan-checklist-${currentYear}`,
        title: `Year-End Home Loan Checklist ${currentYear}: 6 Things to Do Before December 31`,
        description: 'December is the last chance to optimize your home loan before the financial year ends. Here are 6 specific actions that will save you money starting January.',
        seoKeyword: `year end home loan checklist ${currentYear} before december`,
        searchVolume: 6000,
        category: 'Debt Strategy',
        tags: ['year end', 'checklist', 'home loan', 'tax planning', 'December'],
        tier: 1,
        relatedCalculator: '/calculators/tax-benefit',
        imagePrompt: 'December calendar with a checklist overlay and home loan document, year-end planning concept, clean professional financial visual, blue and white with subtle festive feel, no text, no faces',
      },
    ],
  },
]

export function getActiveSeasonalPosts(): QueuedPost[] {
  const now = new Date()
  const activePosts: QueuedPost[] = []

  for (const trigger of SEASONAL_TRIGGERS) {
    if (trigger.isActive(now)) {
      for (const post of trigger.posts) {
        activePosts.push({
          ...post,
          discoveredAt: now.toISOString(),
          source: 'seasonal',
        })
      }
    }
  }

  return activePosts
}
