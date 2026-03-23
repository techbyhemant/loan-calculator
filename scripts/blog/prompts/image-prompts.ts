// Base style appended to every image prompt
export const IMAGE_BASE_STYLE = [
  'professional financial blog header image',
  'clean minimalist vector illustration',
  'no text or typography in the image',
  'no human faces',
  'high contrast',
  'suitable for a professional Indian fintech website',
  'aspect ratio 16:9',
  '1200x630 pixels equivalent composition',
].join(', ')

// Add this to every prompt
export function buildImagePrompt(specificPrompt: string): string {
  return `${specificPrompt}, ${IMAGE_BASE_STYLE}`
}
