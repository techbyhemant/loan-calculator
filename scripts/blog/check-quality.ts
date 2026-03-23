// scripts/blog/check-quality.ts
// Run: npx tsx scripts/blog/check-quality.ts [slug]
// Also importable: import { checkPostQuality } from './check-quality'

import fs from 'fs'
import path from 'path'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

export interface QualityResult {
  passCount: number
  failCount: number
  failures: string[]
  ready: boolean
}

interface QualityCheck {
  name: string
  pass: boolean
  message: string
}

function buildChecks(body: string): QualityCheck[] {
  const words = body.split(/\s+/).filter(Boolean).length

  return [
    {
      name: 'Word count (1,400-1,800)',
      pass: words >= 1400 && words <= 1800,
      message: `${words} words — ${words < 1400 ? 'TOO SHORT, will not rank' : 'TOO LONG, bounce rate risk'}`,
    },
    {
      name: 'Has a verdict upfront',
      pass: /short answer|verdict|here is why|the answer is/i.test(body.slice(0, 800)),
      message: 'No clear verdict in first 800 characters — readers will bounce',
    },
    {
      name: 'Has embedded calculator',
      pass: /<EmiCalculator|<SipVsPrepay|<EligibilityCalc|<TaxBenefitCalc/.test(body),
      message: 'No calculator component embedded — dwell time will be low',
    },
    {
      name: 'Uses Indian rupee format',
      pass: /₹[\d,]+/.test(body),
      message: 'No ₹ amounts found — check number formatting',
    },
    {
      name: 'Uses Indian number format correctly',
      pass: !/₹\d{7,}(?!,)/.test(body),
      message: 'Non-Indian number format found (e.g. ₹5000000 instead of ₹50,00,000)',
    },
    {
      name: 'Has internal links',
      pass: /\(\/[a-z]/.test(body),
      message: 'No internal links found — add links to calculators and dashboard',
    },
    {
      name: 'Has H2 sections (##)',
      pass: (body.match(/^## /gm) || []).length >= 3,
      message: `Only ${(body.match(/^## /gm) || []).length} H2 sections — needs at least 3`,
    },
    {
      name: 'No "it depends on your situation" conclusion',
      pass: !/it depends on your (individual |specific |unique |personal |financial )?situation/i.test(body),
      message: 'Wishy-washy conclusion detected — replace with a clear verdict',
    },
    {
      name: 'No opening with a question',
      pass: !/^(Are you|Do you|Have you|Is it|Should you|When should|What is|Why do)/i.test(body.trim()),
      message: 'Article opens with a question — replace with the pain/problem statement',
    },
    {
      name: 'No "In this article we will"',
      pass: !/in this article (we will|you will|we'll|you'll)/i.test(body),
      message: 'Generic intro phrase found — delete and start with the hook',
    },
    {
      name: 'Has closing CTA linking to /login',
      pass: /\/login/.test(body),
      message: 'No CTA linking to /login — add the lastemi.com sign-up prompt at the end',
    },
    {
      name: 'Has at least one Callout component',
      pass: /<Callout/.test(body),
      message: 'No <Callout> components — add one for the RBI rule or key insight',
    },
  ]
}

// Programmatic API — returns structured result for the scheduler
export function checkPostQuality(slug: string): QualityResult {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) {
    return { passCount: 0, failCount: 12, failures: ['File not found'], ready: false }
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const body = content.split('---').slice(2).join('---')
  const checks = buildChecks(body)

  const failures = checks.filter(c => !c.pass).map(c => `${c.name}: ${c.message}`)
  const passCount = checks.filter(c => c.pass).length
  return { passCount, failCount: checks.length - passCount, failures, ready: passCount >= 10 }
}

// CLI version — logs to console
function checkPost(slug: string): void {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`)

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`)
    process.exit(1)
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const body = content.split('---').slice(2).join('---')
  const words = body.split(/\s+/).filter(Boolean).length
  const checks = buildChecks(body)

  console.log(`\n📋 Quality Check: ${slug}`)
  console.log(`   Word count: ${words}`)
  console.log('═══════════════════════════════════════\n')

  let passCount = 0
  let failCount = 0

  checks.forEach(check => {
    if (check.pass) {
      console.log(`   ✅ ${check.name}`)
      passCount++
    } else {
      console.log(`   ❌ ${check.name}`)
      console.log(`      → ${check.message}`)
      failCount++
    }
  })

  console.log(`\n═══════════════════════════════════════`)
  console.log(`Result: ${passCount}/${checks.length} checks passed`)

  if (failCount === 0) {
    console.log('✅ Post is ready to publish')
  } else if (failCount <= 2) {
    console.log(`⚠️  Fix ${failCount} issue(s) before publishing`)
  } else {
    console.log(`❌ ${failCount} issues found — regenerate or edit before publishing`)
  }
  console.log('')
}

// CLI entry point
const slug = process.argv[2]
if (slug) {
  checkPost(slug)
}
