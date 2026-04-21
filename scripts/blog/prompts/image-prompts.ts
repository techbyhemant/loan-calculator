// ═══════════════════════════════════════════════════════════
// LastEMI blog image prompt system — single-style lock
// ═══════════════════════════════════════════════════════════
//
// Design philosophy:
//   - ONE cohesive visual identity across every blog image.
//   - Three directional variants (rise / decline / pivot) — all share the
//     same style DNA so blog-index pages feel like one magazine.
//   - Zero concrete objects (no houses, calendars, credit cards, buildings,
//     calculators). These are the triggers that cause text hallucination
//     and style drift in Flux / SD models.
//   - Tight palette: deep navy base + mint accent + occasional warm amber.
//     No teal, no red, no purple — those colors break cohesion.
//
// The `rise`/`decline`/`pivot` variants map directly to narrative arcs of
// each article type. A topic either tells a rising story (savings, growth,
// freedom), a declining one (debt reduction, cost cuts), or a pivoting one
// (decisions, comparisons, policy moments).
// ═══════════════════════════════════════════════════════════

// ─── Brand palette (locked) ─────────────────────────────
export const BRAND = {
  navy:  '#0B1426',
  teal:  '#0B7A8C',
  mint:  '#26C49A',
  amber: '#F59E0B',
  red:   '#EF4444',
} as const

// ─── The one style lock applied to every image ──────────
// This string is the single source of truth for the look. Any change here
// propagates to every image. Crafted deliberately — do not tweak casually.
const STYLE_LOCK = [
  'editorial financial blog illustration',
  'hand-drawn flat vector style inspired by The New York Times opinion section and Financial Times weekend illustrations',
  'soft glowing abstract organic curve as the sole central subject',
  `deep navy background (${BRAND.navy}) with soft cool-dark gradient ambience`,
  `primary accent: luminous mint green (${BRAND.mint})`,
  `secondary accent if needed: warm amber glow (${BRAND.amber}) — used ONLY as a single focal point of emphasis, never throughout`,
  'small delicate accents floating alongside the curve: tiny glowing particle dots, delicate leaf-like sprouts, or small luminous orbs',
  'wide landscape composition, 16:9 aspect ratio, generous negative space, main subject occupying the lower two-thirds',
  'atmospheric depth with soft bokeh and light mist in the background',
  // Heavy-weight NO rules — each is repeated with emphasis for model compliance:
  'ABSOLUTELY NO TEXT, NO LETTERS, NO NUMBERS, NO WORDS, NO TYPOGRAPHY, NO LABELS, NO CAPTIONS, NO GLYPHS',
  'NO concrete objects whatsoever — NO houses, NO buildings, NO calendars, NO documents, NO credit cards, NO calculators, NO coins, NO currency symbols, NO keyboards, NO screens, NO vehicles, NO balance scales, NO geometric shapes like cubes or spheres resting on surfaces',
  'NO human figures, NO faces, NO hands',
  'NO 3D rendering, NO photorealism, NO isometric illustrations',
  'NO bar charts, NO pie charts, NO numerical grids',
  'soft ethereal dreamlike quality, premium sophisticated restraint, the feel of a hand-drawn magazine spread',
].join(', ')

// ─── Three directional variants (locked) ────────────────
// Each variant keeps the style lock but shifts the curve's direction
// to match the article's narrative arc.

export const METAPHORS = {
  /**
   * RISE — for topics about growth, savings, tax benefits, debt freedom,
   * positive outcomes, new beginnings.
   */
  rise: [
    'A single luminous mint green curve rising gracefully from the lower-left edge of the frame, arcing upward to a glowing endpoint near the upper-right',
    'delicate tiny glowing leaf-sprouts emerging along the length of the curve at irregular intervals',
    'a single warm amber glow at the curve\'s upper endpoint as the focal emphasis',
    'soft mint particle dust floating in the surrounding negative space',
    STYLE_LOCK,
  ].join(', '),

  /**
   * DECLINE — for topics about reducing debt, lowering costs, prepayment,
   * cutting interest, paying off faster.
   */
  decline: [
    'A single luminous mint green curve descending gracefully from the upper-left edge of the frame, arcing downward to a soft resolved endpoint near the lower-right',
    'delicate tiny glowing particle dots shedding gently downward from the curve like resolved tension',
    'the lower-right endpoint softly dissolving into calm mint haze',
    'a single warm amber glow at the curve\'s starting point signifying the original weight',
    'soft mint particle dust settling in the lower third of the composition',
    STYLE_LOCK,
  ].join(', '),

  /**
   * PIVOT — for topics about decisions, comparisons, policy moments,
   * RBI changes, verdicts, crossroads.
   */
  pivot: [
    'A single luminous mint green curve travelling horizontally across the middle of the frame, with a clear central pivot moment where the curve subtly changes direction',
    'a single warm amber glowing orb positioned exactly at the pivot point as the focal emphasis',
    'delicate tiny glowing particle dots radiating gently outward from the pivot moment',
    'the curve softly fading toward both left and right edges',
    'soft mint particle dust suspended around the pivot',
    STYLE_LOCK,
  ].join(', '),
} as const

export type MetaphorKey = keyof typeof METAPHORS

// ─── Legacy-compat: buildPrompt wraps a raw concept with the style lock ──
// Used by the autonomous discoverer when Gemini provides an ad-hoc concept.
// Prefer the METAPHORS variants — this is the fallback.
export function buildPrompt(concept: string): string {
  const cleaned = concept
    .replace(/no text/gi, '')
    .replace(/no faces/gi, '')
    .trim()
  return `${cleaned}, ${STYLE_LOCK}`
}

// Back-compat alias so older callers referencing `SUFFIX` still work.
export const SUFFIX = STYLE_LOCK

// ─── Topic → metaphor mapping ───────────────────────────
// Used as a fallback when a post's slug isn't in POST_PROMPTS. Keyword-based.
export function inferMetaphor(slug: string, keyword?: string): MetaphorKey {
  const text = `${slug} ${keyword ?? ''}`.toLowerCase()

  // Decline signals — reducing, prepayment, payoff, cost cutting
  if (/prepay|pre-pay|payoff|pay-off|reduc|cut|lower|debt[- ]free|clos|foreclos|save|saving/.test(text)) {
    return 'decline'
  }
  // Pivot signals — decisions, comparisons, rbi, policy, rate changes, vs/or
  if (/\bvs\b|\bor\b|versus|compare|comparison|decision|rbi|repo|policy|impact|rate[- ]cut|verdict|choose/.test(text)) {
    return 'pivot'
  }
  // Default to rise — growth, benefits, savings outcomes, strategies, tax optimisation
  return 'rise'
}

// ─── Canonical post prompts ─────────────────────────────
// Each canonical post gets an explicit metaphor choice (overrides inferMetaphor).
// When adding a new post, just reference one of: METAPHORS.rise, METAPHORS.decline, METAPHORS.pivot.
export const POST_PROMPTS: Record<string, string> = {
  // Published + generated posts — explicit metaphor per narrative arc
  'reduce-emi-or-tenure-after-part-payment': METAPHORS.pivot,
  'sip-vs-home-loan-prepayment': METAPHORS.pivot,
  'credit-card-minimum-due-trap': METAPHORS.decline,
  'no-cost-emi-hidden-charges-india': METAPHORS.decline,
  'which-loan-to-pay-off-first-india': METAPHORS.decline,
  'total-interest-home-loan': METAPHORS.decline,
  'become-debt-free-faster-home-loan': METAPHORS.rise,
  'home-loan-tax-benefit-80c-24b-2025': METAPHORS.rise,
  'personal-loan-prepayment-penalty-india': METAPHORS.decline,
  'part-payment-year-3-vs-year-10': METAPHORS.pivot,
  'debt-snowball-vs-avalanche-india': METAPHORS.pivot,
  'old-vs-new-tax-regime-home-loan': METAPHORS.pivot,
  'rbi-rate-cut-emi-impact': METAPHORS.pivot,
  'debt-free-before-50-india': METAPHORS.rise,
  'home-loan-balance-transfer-break-even-calculator': METAPHORS.pivot,
  'home-loan-strategy-fy-2026-27': METAPHORS.rise,
  'rbi-repo-rate-impact-on-emi': METAPHORS.pivot,

  // Currently-published posts
  'car-loan-balance-transfer-benefits': METAPHORS.decline,
  'car-loan-prepayment-benefits': METAPHORS.decline,
  'consumer-emi-hidden-costs': METAPHORS.decline,
  'credit-card-debt-consolidation-strategies': METAPHORS.decline,
  'education-loan-tax-benefits': METAPHORS.rise,
  'home-loan-balance-transfer-savings': METAPHORS.decline,
  'home-loan-tax-filing-2026': METAPHORS.rise,
  'personal-loan-consolidation-strategies': METAPHORS.decline,
  'personal-loan-prepayment-penalty-2026': METAPHORS.decline,
  'rbi-monetary-policy-2026-april-emi-impact': METAPHORS.pivot,
  'rent-vs-buy-decision': METAPHORS.pivot,
  'tax-optimization-for-borrowers': METAPHORS.rise,
  'tax-saving-investments-for-loan-borrowers': METAPHORS.rise,
}

// ─── Instructions for autonomous topic discovery ────────
// Tells the discoverer to choose one of the 3 variants per topic.
export const GROQ_IMAGE_METAPHOR_INSTRUCTIONS = `
For the "imageMetaphor" field, choose ONE of these 3 values based on the article's narrative arc:

  rise    — Topic tells a growth/positive/benefit story (tax savings, investment growth, debt freedom, strategy, optimization, new beginnings)
  decline — Topic tells a reduction story (reducing debt, lowering interest, cutting costs, prepayment, faster payoff, balance transfer cost savings)
  pivot   — Topic tells a decision/comparison story (X vs Y, policy changes, RBI impact, verdicts, crossroads, rate changes)

Return the lowercase key as the string value, e.g. "imageMetaphor": "rise".
Do NOT write a full image prompt — the system handles that from the key.
`
