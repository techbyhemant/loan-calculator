export interface BlogPostFrontmatter {
  title: string;
  slug: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  tags: string[];
  featured: boolean;
  relatedCalculator?: string;
  image?: string;
  /** Custom alt text for the header image. Falls back to title + brand context. */
  imageAlt?: string;
  seoKeyword?: string;
  searchVolume?: number;
  tier?: number;
  publishWeek?: number;
  author?: string;
  reviewedBy?: string;
  lastReviewed?: string;
  sources?: string[];
  faqs?: Array<{ q: string; a: string }>;
}

export interface BlogPost extends BlogPostFrontmatter {
  content: string;
}
