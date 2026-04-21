// ═══════════════════════════════════════════════════════════
// Image Prompt System for LastEMI Blog
// ═══════════════════════════════════════════════════════════
// Every blog header image is generated via Replicate Flux Schnell.
// AI models produce gibberish when asked to render text, so we
// aggressively instruct NO TEXT of any kind in every prompt.
//
// This file is the SINGLE SOURCE OF TRUTH for all image prompts.
// ═══════════════════════════════════════════════════════════

// ─── Brand colours ─────────────────────────────────────────
export const BRAND = {
  navy:  '#0B1426',
  teal:  '#0B7A8C',
  mint:  '#26C49A',
  amber: '#F59E0B',
  red:   '#EF4444',
} as const

// ─── Standard style suffix appended to every prompt ────────
// Written defensively: image models hallucinate text whenever prompts mention
// concrete real-world objects (calendars, documents, signs, price tags).
// We anchor on abstract geometric shapes + a known editorial-illustration style.
export const SUFFIX = [
  'editorial magazine illustration in the style of Monocle and the Financial Times weekend edition',
  'flat 2D vector illustration, abstract geometric composition',
  'pure abstract shapes only — NO calendars, NO documents, NO credit cards, NO signs, NO price tags, NO bank buildings, NO objects that would naturally contain writing',
  `dark navy (${BRAND.navy}) background with teal (${BRAND.teal}) and mint (${BRAND.mint}) accent colours, subtle amber (${BRAND.amber}) highlights where emphasis is needed`,
  'absolutely no text, no letters, no numbers, no words, no typography, no labels, no captions, no glyphs, no runes, no writing of any kind anywhere',
  'no human faces, no hands, no bodies, no portraits',
  'no photorealism, no 3D rendering',
  'clean sharp vector edges, generous negative space, strong compositional balance',
  'sophisticated restrained colour palette, premium fintech aesthetic',
  'wide landscape composition, horizontal 16:9 balance, main focal element occupying centre-right',
].join(', ')

// ─── Helper: wrap a concept with the brand suffix ──────────
export function buildPrompt(concept: string): string {
  const cleaned = concept
    .replace(/no text/gi, '')
    .replace(/no faces/gi, '')
    .trim()
  return `${cleaned}, ${SUFFIX}`
}

// ─── 8 Metaphor templates — pure abstract compositions ────
// These deliberately avoid ALL real-world objects. Real objects (calendars,
// documents, credit cards) trigger the model's text-rendering circuits which
// produce garbled glyphs. Abstract shapes keep output clean.
export const METAPHORS = {
  /** Balance: two masses, one slightly heavier */
  comparison: buildPrompt(
    'Two abstract rounded geometric masses suspended on a thin horizontal axis, ' +
    'the mass on the right slightly lower indicating imbalance, ' +
    'one mass rendered in teal and the other in mint, smooth tonal gradient, ' +
    'negative space framing the composition'
  ),

  /** Decline: stepped-down bars */
  decline: buildPrompt(
    'A sequence of five rounded vertical bars arranged left-to-right, each bar shorter than the previous, ' +
    'forming a descending staircase, teal-to-mint vertical gradient across the set, ' +
    'soft outer glow around each bar, clean rhythmic spacing'
  ),

  /** Growth: curve rising from lower-left to upper-right */
  growth: buildPrompt(
    'A single luminous curve rising smoothly from lower-left to upper-right, ' +
    'small abstract circular nodes placed at key inflection points along the curve, ' +
    'mint-green with subtle glow, confident upward trajectory, geometric leaves implied as tangent arcs'
  ),

  /** Warning: cracked surface revealing glow beneath */
  warning: buildPrompt(
    'A flat smooth navy surface with a single sharp jagged fissure running diagonally through it, ' +
    'vivid amber and red light bleeding through the fissure from beneath, ' +
    'tension between calm surface and hidden danger, dramatic restrained lighting'
  ),

  /** Fork: path splitting into two */
  fork: buildPrompt(
    'A single luminous line travelling from the bottom of the frame that bifurcates into two ' +
    'distinct diverging paths, one branch curving left in teal, the other curving right in mint, ' +
    'each branch of equal weight, clean symmetric split, negative space around both paths'
  ),

  /** Timeline: horizontal axis with milestone dots */
  timeline: buildPrompt(
    'A thin horizontal glowing line spanning the full width, with five evenly spaced circular nodes along it, ' +
    'one of the nodes slightly larger and glowing more brightly as a highlighted milestone, ' +
    'progression reading left-to-right, clean data-visualisation aesthetic'
  ),

  /** Freedom: broken links scattering upward */
  freedom: buildPrompt(
    'A set of interlocking abstract oval rings breaking apart and dispersing upward and outward, ' +
    'rings transitioning from heavy dark navy at the bottom to light mint glow at the top, ' +
    'sense of release and upward motion, open uncluttered upper composition'
  ),

  /** Calculation: structured grid of geometric cells */
  calculation: buildPrompt(
    'A precise geometric grid of small rounded square cells arranged in a 4x4 pattern occupying the centre-right, ' +
    'each cell a subtle variation in teal-to-mint tone, two cells highlighted in amber for emphasis, ' +
    'rigorous mathematical composition, no symbols or numerals inside any cell'
  ),
} as const

export type MetaphorKey = keyof typeof METAPHORS

// ─── Canonical post prompts ────────────────────────────────
// Keys MUST match slugs from post-list.ts exactly.
// Design rule: use abstract shapes only. Never mention "house", "credit card",
// "calendar", "document", "currency symbol" — they trigger text/logo hallucination.
export const POST_PROMPTS: Record<string, string> = {
  'reduce-emi-or-tenure-after-part-payment': buildPrompt(
    'A single luminous line travelling upward and splitting into two diverging paths — ' +
    'the left path curves gently in teal, the right path descends steeply in mint, ' +
    'negative space around both, crisp symmetric bifurcation'
  ),

  'sip-vs-home-loan-prepayment': buildPrompt(
    'Two abstract geometric masses on a thin horizontal axis — a rising curve on one side, ' +
    'a stack of descending bars on the other, negative space around each, ' +
    'restrained asymmetric balance'
  ),

  'credit-card-minimum-due-trap': buildPrompt(
    'A smooth flat navy surface with a jagged diagonal fissure opening to reveal a concentric ' +
    'spiral of warm amber glow beneath, the spiral tightening inward, tension between calm surface and hidden intensity'
  ),

  'no-cost-emi-hidden-charges-india': buildPrompt(
    'A pristine flat geometric block with a crack revealing angular amber shapes underneath, ' +
    'the cracked surface appearing pristine on top, restrained dramatic lighting'
  ),

  'which-loan-to-pay-off-first-india': buildPrompt(
    'Five rounded vertical bars arranged left-to-right, the leftmost bar tallest and glowing amber for priority, ' +
    'subsequent bars descending in teal, clear hierarchical rhythm'
  ),

  'total-interest-home-loan': buildPrompt(
    'Two abstract vertical rectangles side by side — a small teal rectangle and a much larger amber one towering beside it, ' +
    'dramatic proportion contrast, negative space framing'
  ),

  'become-debt-free-faster-home-loan': buildPrompt(
    'A descending staircase of rounded bars terminating in a single luminous circular node at the right edge, ' +
    'mint glow at the terminus, sense of arrival'
  ),

  'home-loan-tax-benefit-80c-24b-2025': buildPrompt(
    'A 4x4 grid of rounded square cells with two cells illuminated in mint and one in amber, ' +
    'arranged as an abstract calculation matrix, no symbols inside cells'
  ),

  'personal-loan-prepayment-penalty-india': buildPrompt(
    'A clean horizontal line interrupted midway by a tall vertical barrier of amber, the line continues faintly after the barrier, ' +
    'sense of obstruction and cost'
  ),

  'part-payment-year-3-vs-year-10': buildPrompt(
    'A horizontal line with two circular nodes — the left node significantly larger and radiating mint glow, ' +
    'the right node smaller and dimmer, illustrating the compounding value of early action'
  ),

  'debt-snowball-vs-avalanche-india': buildPrompt(
    'Two abstract mass forms on a horizontal axis — one a tight compact circle in teal, ' +
    'the other a cascading angular form in mint, balanced composition'
  ),

  'old-vs-new-tax-regime-home-loan': buildPrompt(
    'A single line splitting into two paths — the left path solid teal, the right path solid mint, ' +
    'perfect symmetric divergence, clean geometric decision metaphor'
  ),

  'rbi-rate-cut-emi-impact': buildPrompt(
    'A horizontal stepped line descending by one level at a central pivot node, ' +
    'the descent glowing mint, subtle amber highlight on the pivot node'
  ),

  'debt-free-before-50-india': buildPrompt(
    'Interlocking oval rings breaking apart and dispersing upward, transitioning from dark navy at base to bright mint at top, ' +
    'a single luminous circular marker at the upper right signalling arrival'
  ),

  'home-loan-balance-transfer-break-even-calculator': buildPrompt(
    'A horizontal timeline with a pivot node at centre — left of the pivot bars descend in amber (costs), ' +
    'right of the pivot bars ascend in mint (savings), dramatic crossover composition'
  ),

  'home-loan-strategy-fy-2026-27': buildPrompt(
    'A luminous upward curve ascending from the left, with a fresh circular marker at its origin glowing bright mint, ' +
    'suggesting the beginning of a new journey, clean optimistic geometric composition'
  ),

  'rbi-repo-rate-impact-on-emi': buildPrompt(
    'A horizontal stepped line descending smoothly by one level at a central pivot node, ' +
    'a second thinner line beneath ascending slightly after the pivot, mint for the upper line, amber for the lower, ' +
    'illustrating one variable moving down while another responds, clean data-vis aesthetic'
  ),
}

// ─── Groq instructions for autonomous topic discovery ──────
// When the topic-discoverer asks Groq for new topics, this
// instruction block tells it to choose a metaphor key instead
// of writing a raw image prompt.
export const GROQ_IMAGE_METAPHOR_INSTRUCTIONS = `
For the "imageMetaphor" field, choose ONE of these 8 metaphor keys.
Pick the one that best matches the article concept:

  COMPARISON  — Comparing two financial products or options (balance scale)
  DECLINE     — Reducing debt, costs, or balances over time (declining bars)
  GROWTH      — Building wealth, increasing savings, or positive trends (upward curve)
  WARNING     — Hidden costs, traps, or financial dangers (cracked surface)
  FORK        — Choosing between two financial strategies (splitting path)
  TIMELINE    — Events, milestones, or changes over time (horizontal timeline)
  FREEDOM     — Debt freedom, loan closure, or financial liberation (broken chains)
  CALCULATION — Precise number-crunching, EMI math, or tax computation (calculator frame)

Return ONLY the key as a string value, e.g. "imageMetaphor": "COMPARISON".
Do NOT write a full image prompt — the system maps keys to brand-consistent prompts.
`
