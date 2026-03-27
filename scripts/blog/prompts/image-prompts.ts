// Base style appended to every image prompt
// CRITICAL: AI models generate gibberish when asked to render text.
// We aggressively instruct NO TEXT of any kind.
export const IMAGE_BASE_STYLE = [
  'professional financial blog header illustration',
  'clean minimalist flat design',
  'abstract conceptual illustration',
  'ABSOLUTELY NO TEXT, NO LETTERS, NO NUMBERS, NO WORDS, NO TYPOGRAPHY, NO LABELS, NO CAPTIONS anywhere in the image',
  'NO writing of any kind',
  'no human faces or portraits',
  'soft gradients with teal (#0B7A8C) and mint (#26C49A) accent colors',
  'light neutral background',
  'simple geometric shapes and icons only',
  'high contrast, sharp edges',
  'modern fintech visual style',
  'suitable as a blog header at 1200x630',
].join(', ')

// Add this to every prompt
export function buildImagePrompt(specificPrompt: string): string {
  // Strip any text-related instructions from the specific prompt
  const cleaned = specificPrompt
    .replace(/no text/gi, '')
    .replace(/no faces/gi, '')
    .trim()
  return `${cleaned}, ${IMAGE_BASE_STYLE}`
}
