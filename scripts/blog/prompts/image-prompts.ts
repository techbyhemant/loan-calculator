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
export const SUFFIX = [
  'professional financial blog header illustration',
  'clean minimalist flat design',
  'abstract conceptual',
  `dark navy (${BRAND.navy}) background with teal (${BRAND.teal}) and mint (${BRAND.mint}) accent colours`,
  'ABSOLUTELY NO TEXT, NO LETTERS, NO NUMBERS, NO WORDS, NO TYPOGRAPHY, NO LABELS, NO CAPTIONS anywhere in the image',
  'NO writing of any kind',
  'no human faces or portraits',
  'high contrast, sharp edges',
  'modern fintech visual style',
  'suitable as a blog header at 1200x630',
].join(', ')

// ─── Helper: wrap a concept with the brand suffix ──────────
export function buildPrompt(concept: string): string {
  const cleaned = concept
    .replace(/no text/gi, '')
    .replace(/no faces/gi, '')
    .trim()
  return `${cleaned}, ${SUFFIX}`
}

// ─── 8 Metaphor templates ──────────────────────────────────
// Each template is a complete prompt (suffix already included).
// Usage: METAPHORS.comparison, METAPHORS.decline, etc.
export const METAPHORS = {
  /** Two objects on a balance scale, one side tipping */
  comparison: buildPrompt(
    'Two glowing objects on a luminous balance scale, one side tipping slightly, ' +
    'representing a financial comparison, geometric shapes, split composition'
  ),

  /** A tall bar chart declining left to right like a staircase */
  decline: buildPrompt(
    'A series of glowing bars declining from left to right like a staircase, ' +
    'representing reducing debt or decreasing cost, geometric precision, ' +
    'subtle downward arrows'
  ),

  /** An upward-curving growth line with sprouting elements */
  growth: buildPrompt(
    'An upward-curving luminous line with small sprouting leaf-like elements, ' +
    'representing financial growth or wealth building, organic geometry, ' +
    'optimistic composition'
  ),

  /** A cracked surface with a glowing hazard symbol beneath */
  warning: buildPrompt(
    'A smooth surface with a visible crack revealing a glowing hazard pattern beneath, ' +
    'representing a financial trap or hidden cost, tension between calm surface and danger below, ' +
    'dramatic lighting'
  ),

  /** A road splitting into two distinct paths */
  fork: buildPrompt(
    'A single glowing path splitting into two distinct directions at a luminous fork, ' +
    'representing a financial decision between two options, clean perspective, ' +
    'each path a different accent colour'
  ),

  /** A horizontal timeline with marked milestone nodes */
  timeline: buildPrompt(
    'A horizontal glowing timeline with marked milestone nodes, ' +
    'representing key financial dates or events over time, ' +
    'left-to-right progression, clean data-visualisation aesthetic'
  ),

  /** Broken chains falling away from a glowing house silhouette */
  freedom: buildPrompt(
    'Broken chain links falling away from a glowing house silhouette, ' +
    'representing debt freedom and financial liberation, ' +
    'triumphant composition, open sky above'
  ),

  /** A large calculator-shaped frame with abstract floating numbers */
  calculation: buildPrompt(
    'A large luminous calculator-shaped frame with abstract geometric patterns ' +
    'floating inside it, representing precise financial calculation, ' +
    'structured grid composition'
  ),
} as const

export type MetaphorKey = keyof typeof METAPHORS

// ─── Canonical post prompts ────────────────────────────────
// Keys MUST match slugs from post-list.ts exactly.
// Each value is a complete prompt (suffix included via buildPrompt).
export const POST_PROMPTS: Record<string, string> = {
  // Published posts with refined prompts
  'reduce-emi-or-tenure-after-part-payment': buildPrompt(
    'A single glowing path splitting into two distinct directions at a luminous fork — ' +
    'one path leads to a smaller recurring-payment icon, the other to a shorter timeline bar, ' +
    'representing the EMI-vs-tenure decision after a loan part payment'
  ),

  'sip-vs-home-loan-prepayment': buildPrompt(
    'Two glowing objects on a luminous balance scale — a growing investment curve on one side ' +
    'and a shrinking loan-balance bar on the other, ' +
    'representing the SIP versus home loan prepayment comparison'
  ),

  'credit-card-minimum-due-trap': buildPrompt(
    'A smooth credit-card surface with a visible crack revealing a glowing spiral debt pattern beneath, ' +
    'representing the minimum-due trap that grows silently, ' +
    'dramatic tension between calm exterior and hidden cost spiral'
  ),

  'no-cost-emi-hidden-charges-india': buildPrompt(
    'A smooth gleaming shopping-cart surface with a crack revealing a glowing cost block beneath, ' +
    'representing hidden charges inside a no-cost EMI offer, ' +
    'tension between "free" appearance and real price'
  ),

  'which-loan-to-pay-off-first-india': buildPrompt(
    'A series of glowing bars declining from left to right like a priority stack, ' +
    'the tallest bar marked with an accent colour for highest-rate loan, ' +
    'representing the correct order to pay off different loan types'
  ),

  'total-interest-home-loan': buildPrompt(
    'A tall luminous calculator-shaped block with a towering interest-cost bar rising from it, ' +
    'representing the sheer scale of total interest paid on a 20-year home loan, ' +
    'dramatic height contrast between principal and interest portions'
  ),

  'become-debt-free-faster-home-loan': buildPrompt(
    'A series of glowing bars declining from left to right like a staircase ' +
    'leading to a luminous finish-line marker, ' +
    'representing accelerated debt payoff and reaching freedom sooner'
  ),

  'home-loan-tax-benefit-80c-24b-2025': buildPrompt(
    'A large luminous calculator-shaped frame with a subtraction operation pattern inside, ' +
    'a house silhouette feeding deduction arrows into the frame, ' +
    'representing home loan tax benefit calculation under 80C and 24b'
  ),

  'personal-loan-prepayment-penalty-india': buildPrompt(
    'A smooth loan-document surface with a glowing barrier wall rising from it, ' +
    'representing the prepayment penalty blocking early loan closure, ' +
    'warning tones with a cost-gate metaphor'
  ),

  // Additional common posts with canonical prompts
  'part-payment-year-3-vs-year-10': buildPrompt(
    'A horizontal glowing timeline with two marked milestone nodes — one early, one late — ' +
    'the early node radiating a much larger savings aura, ' +
    'representing the timing impact of a home loan part payment'
  ),

  'debt-snowball-vs-avalanche-india': buildPrompt(
    'Two glowing objects on a luminous balance scale — a snowball shape on one side ' +
    'and an avalanche-cascade shape on the other, ' +
    'representing the two debt payoff strategies'
  ),

  'old-vs-new-tax-regime-home-loan': buildPrompt(
    'A single glowing path splitting into two distinct directions — ' +
    'one path coloured teal for the old regime, the other mint for the new regime, ' +
    'representing the tax regime choice for home loan borrowers'
  ),

  'rbi-rate-cut-emi-impact': buildPrompt(
    'A horizontal glowing timeline with a downward step at a central node, ' +
    'a rate-cut arrow flowing from a central-bank silhouette to a home-loan EMI bar that decreases, ' +
    'representing the RBI rate cut impact on home loan EMIs'
  ),

  'debt-free-before-50-india': buildPrompt(
    'Broken chain links falling away from a glowing house silhouette, ' +
    'a road stretching to a luminous milestone marker, ' +
    'representing the journey to debt freedom before age 50'
  ),

  'home-loan-balance-transfer-break-even-calculator': buildPrompt(
    'A horizontal glowing timeline with a marked break-even node, ' +
    'costs declining after the node and savings accumulating, ' +
    'representing the balance transfer break-even calculation'
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
