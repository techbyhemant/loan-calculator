// Automated MPC rate verification using Gemini + Google Search grounding.
//
// Called by the RBI MPC reminder GitHub Action on the 1st of each MPC month.
// Queries Google for the latest RBI MPC decision, parses it with Gemini, then
// either (a) updates data/rbi-rates.json if the rate has changed, or (b) exits
// cleanly with "no change detected".
//
// The workflow opens a PR with the diff so a human approves before deploying —
// the script never auto-merges.
//
// Run locally: npx tsx scripts/rbi/check-mpc-rate.ts
//   env flags: --apply  (actually write the JSON file; otherwise dry-run)
//              --verbose (log Gemini raw response)

import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'rbi-rates.json')
// gemini-2.5-flash has separate grounded-search free-tier quota from the blog
// pipeline's gemini-flash-latest, so this script won't be throttled by daily
// blog generation activity.
const GEMINI_MODEL = process.env.RBI_CHECK_MODEL ?? 'gemini-2.5-flash'

interface RbiRatesConfig {
  $schema?: string
  currentRate: number
  lastUpdated: string
  nextMPCExpected: string
  typicalHomeLoanSpread: number
  history: Array<{ date: string; rate: number; change: number }>
}

interface MpcCheckResult {
  currentRate: number
  lastDecisionDate: string // ISO
  lastDecisionLabel: string // "Apr 2026"
  lastDecisionChange: number
  nextMPCExpected: string // ISO
  confidence: 'high' | 'medium' | 'low'
  sources: string[]
  reasoning: string
}

async function queryGemini(prompt: string): Promise<{ text: string; sources: string[] }> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is required')

  // Use REST API directly because the SDK's grounding API shape lags the
  // Gemini model releases. The google_search tool works on gemini-flash-latest.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    tools: [{ google_search: {} }],
    generationConfig: {
      temperature: 0.1, // factual extraction, minimize creativity
      maxOutputTokens: 4000,
    },
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': apiKey,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Gemini API ${res.status}: ${errText.slice(0, 300)}`)
  }

  const data = await res.json() as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> }
      groundingMetadata?: {
        groundingChunks?: Array<{ web?: { uri?: string; title?: string } }>
      }
    }>
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  const sources = (data.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [])
    .map(c => c.web?.uri)
    .filter((u): u is string => !!u)

  return { text, sources }
}

function parseStructuredResponse(text: string): MpcCheckResult | null {
  // Extract the outermost {...} block — handles code fences, preambles,
  // trailing commentary, etc. Grounded responses often wrap JSON in markdown.
  const firstBrace = text.indexOf('{')
  const lastBrace = text.lastIndexOf('}')
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null

  const candidate = text.slice(firstBrace, lastBrace + 1)
  try {
    return JSON.parse(candidate) as MpcCheckResult
  } catch {
    return null
  }
}

function isValidResult(result: MpcCheckResult): { ok: boolean; reason?: string } {
  // Sanity: repo rate is historically always between 3% and 10% for India
  if (typeof result.currentRate !== 'number' || result.currentRate < 3 || result.currentRate > 10) {
    return { ok: false, reason: `Rate ${result.currentRate} outside sanity range [3, 10]` }
  }
  // Dates must parse
  if (isNaN(Date.parse(result.lastDecisionDate))) {
    return { ok: false, reason: `Invalid lastDecisionDate: ${result.lastDecisionDate}` }
  }
  if (isNaN(Date.parse(result.nextMPCExpected))) {
    return { ok: false, reason: `Invalid nextMPCExpected: ${result.nextMPCExpected}` }
  }
  // Next MPC must be in the future (within 6 months — more sanity)
  const nextDate = new Date(result.nextMPCExpected)
  const now = new Date()
  const sixMonths = 6 * 30 * 24 * 60 * 60 * 1000
  if (nextDate.getTime() - now.getTime() > sixMonths || nextDate.getTime() < now.getTime() - 7 * 24 * 60 * 60 * 1000) {
    return { ok: false, reason: `Next MPC date unreasonable: ${result.nextMPCExpected}` }
  }
  // Change must be plausible
  if (typeof result.lastDecisionChange !== 'number' || Math.abs(result.lastDecisionChange) > 2) {
    return { ok: false, reason: `Change ${result.lastDecisionChange} implausible` }
  }
  if (!result.lastDecisionLabel || !/^[A-Z][a-z]{2} \d{4}$/.test(result.lastDecisionLabel)) {
    return { ok: false, reason: `Bad label format: ${result.lastDecisionLabel}` }
  }
  return { ok: true }
}

async function main() {
  const dryRun = !process.argv.includes('--apply')
  const verbose = process.argv.includes('--verbose')

  console.log('Loading current config...')
  const current = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) as RbiRatesConfig
  console.log(`  currentRate: ${current.currentRate}%`)
  console.log(`  lastUpdated: ${current.lastUpdated}`)
  console.log(`  history entries: ${current.history.length}`)
  console.log(`  last history entry: ${current.history[current.history.length - 1].date}`)

  const prompt = `You are verifying the RBI (Reserve Bank of India) repo rate for our website.

Use Google Search to find the MOST RECENT RBI Monetary Policy Committee (MPC) decision and the next scheduled MPC meeting date.

Return ONLY a JSON object in this exact shape (no markdown, no preamble):

{
  "currentRate": <number, current repo rate as decimal e.g. 5.25>,
  "lastDecisionDate": "<ISO date of most recent MPC decision day, YYYY-MM-DD>",
  "lastDecisionLabel": "<Short month-year label matching the decision, format exactly 'Mmm YYYY' e.g. 'Apr 2026'>",
  "lastDecisionChange": <number, change vs prior meeting: negative for cut, positive for hike, 0 for hold, e.g. -0.25>,
  "nextMPCExpected": "<ISO date of the next scheduled MPC decision day, YYYY-MM-DD>",
  "confidence": "<'high' if multiple authoritative sources agree, 'medium' if one source, 'low' otherwise>",
  "sources": ["<url1>", "<url2>"],
  "reasoning": "<one-sentence summary of what the MPC decided and why — for human review>"
}

CRITICAL rules:
- Only return the JSON object, no other text.
- Use the ACTUAL decision day, not the meeting start day (e.g. a Apr 6-8 meeting's decision day is Apr 8).
- Prefer rbi.org.in, Reuters, Bloomberg, Economic Times, Moneycontrol, Business Standard as sources.
- If you cannot determine with confidence, set confidence to "low" and explain in reasoning.`

  console.log('\nQuerying Gemini with Google Search grounding...')
  const { text, sources } = await queryGemini(prompt)

  if (verbose) {
    console.log('\n--- Raw Gemini response ---')
    console.log(text)
    console.log('--- Grounding sources ---')
    sources.forEach(s => console.log(`  ${s}`))
    console.log('---')
  }

  const result = parseStructuredResponse(text)
  if (!result) {
    console.error('\n❌ Failed to parse Gemini response as JSON')
    console.error('Raw text:', text.slice(0, 500))
    process.exit(1)
  }

  console.log('\n--- Gemini returned ---')
  console.log(`  currentRate:        ${result.currentRate}%`)
  console.log(`  lastDecisionDate:   ${result.lastDecisionDate}`)
  console.log(`  lastDecisionLabel:  ${result.lastDecisionLabel}`)
  console.log(`  lastDecisionChange: ${result.lastDecisionChange}`)
  console.log(`  nextMPCExpected:    ${result.nextMPCExpected}`)
  console.log(`  confidence:         ${result.confidence}`)
  console.log(`  reasoning:          ${result.reasoning}`)

  const validation = isValidResult(result)
  if (!validation.ok) {
    console.error(`\n❌ Validation failed: ${validation.reason}`)
    console.error('Refusing to write changes. Human intervention required.')
    process.exit(2)
  }

  if (result.confidence === 'low') {
    console.error('\n⚠️  Low confidence — not writing changes. Human should verify manually.')
    console.error(`Reasoning: ${result.reasoning}`)
    process.exit(3)
  }

  // Decide what (if anything) changed
  const lastHistoryEntry = current.history[current.history.length - 1]
  const alreadyHaveLatest = lastHistoryEntry.date === result.lastDecisionLabel
  const rateChanged = current.currentRate !== result.currentRate
  const nextMpcChanged = current.nextMPCExpected !== result.nextMPCExpected

  if (alreadyHaveLatest && !nextMpcChanged) {
    console.log('\n✅ Config already up to date. No changes needed.')
    console.log('GH_OUTPUT:needs_update=false')
    return
  }

  // Build the new config
  const updated: RbiRatesConfig = { ...current }

  if (!alreadyHaveLatest) {
    updated.history = [
      ...current.history,
      {
        date: result.lastDecisionLabel,
        rate: result.currentRate,
        change: result.lastDecisionChange,
      },
    ]
    updated.currentRate = result.currentRate
    updated.lastUpdated = result.lastDecisionDate
    console.log(`\n📝 New history entry: ${result.lastDecisionLabel} @ ${result.currentRate}% (change ${result.lastDecisionChange})`)
  }

  if (nextMpcChanged) {
    updated.nextMPCExpected = result.nextMPCExpected
    console.log(`📝 nextMPCExpected: ${current.nextMPCExpected} → ${result.nextMPCExpected}`)
  }

  if (rateChanged) {
    console.log(`📝 currentRate: ${current.currentRate}% → ${result.currentRate}%`)
  }

  console.log('\n--- Sources Gemini used ---')
  const allSources = [...new Set([...(result.sources ?? []), ...sources])]
  allSources.slice(0, 10).forEach(s => console.log(`  ${s}`))

  if (dryRun) {
    console.log('\n[DRY RUN] Would write changes to data/rbi-rates.json')
    console.log('Re-run with --apply to write.')
    console.log('GH_OUTPUT:needs_update=true')
    return
  }

  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(updated, null, 2) + '\n',
  )
  console.log('\n✅ Wrote data/rbi-rates.json')
  console.log('GH_OUTPUT:needs_update=true')

  // Emit a summary file for the workflow to include in the PR body
  const summary = [
    `## RBI MPC update — ${result.lastDecisionLabel}`,
    '',
    `**Decision:** repo rate ${result.lastDecisionChange === 0 ? 'held' : result.lastDecisionChange < 0 ? 'cut' : 'hiked'} to ${result.currentRate}% on ${result.lastDecisionDate}.`,
    '',
    `**Reasoning (per Gemini):** ${result.reasoning}`,
    '',
    `**Next MPC expected:** ${result.nextMPCExpected}`,
    '',
    `**Confidence:** ${result.confidence}`,
    '',
    '**Sources verified by Gemini Search grounding:**',
    ...allSources.slice(0, 5).map(s => `- ${s}`),
    '',
    '---',
    '',
    '⚠️ Human review required. This PR was opened by automation — verify the numbers against [rbi.org.in](https://www.rbi.org.in) before merging.',
  ].join('\n')
  fs.writeFileSync('/tmp/rbi-mpc-pr-body.md', summary)
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
