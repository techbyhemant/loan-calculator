import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPostBySlug, getAllPosts } from "@/lib/blog/utils";
import {
  getArticleSchema,
  getFAQSchema,
  getBreadcrumbSchema,
} from "@/lib/seo/schema";
import { MdxRenderer } from "@/components/blog/MdxRenderer";
import { BlogCard } from "@/components/blog/BlogCard";
import { ShareButton } from "@/components/blog/ShareButton";
import { CalculatorIcon } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  const imageUrl = post.image
    ? `https://lastemi.com${post.image}`
    : `https://lastemi.com/blog/${post.slug}/opengraph-image`;

  return {
    title: `${post.title} | LastEMI Blog`,
    description: post.description,
    keywords: post.tags,
    metadataBase: new URL("https://lastemi.com"),
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      siteName: "LastEMI",
      locale: "en_IN",
      type: "article",
      publishedTime: post.publishedAt,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [imageUrl],
      creator: "@lastemi",
      site: "@lastemi",
    },
    robots: { index: true, follow: true },
  };
}

// ---------------------------------------------------------------------------
// Static params
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

/** Smart tag capitalization:
 *  - "EMI" "SIP" "RBI" "GST" "CC" "PL" "CIBIL" → UPPERCASE
 *  - "home loan" → "Home Loan"
 *  - "reduce EMI" → "Reduce EMI"
 */
const UPPERCASE_TAGS = new Set(["emi", "sip", "rbi", "gst", "cc", "pl", "cibil", "foir", "nps", "ppf", "elss", "lic", "dsa", "nbfc", "lap"]);

function formatTag(tag: string): string {
  return tag
    .split(/\s+/)
    .map((word) => {
      const lower = word.toLowerCase();
      if (UPPERCASE_TAGS.has(lower)) return word.toUpperCase();
      // Capitalize first letter
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function getRelatedPosts(
  currentSlug: string,
  currentTags: string[],
  currentCategory: string,
  limit = 3,
) {
  const allPosts = getAllPosts();
  const tagSet = new Set(currentTags.map((t) => t.toLowerCase()));

  return allPosts
    .filter((p) => p.slug !== currentSlug)
    .map((p) => {
      let score = 0;
      // Same category = strong signal
      if (p.category === currentCategory) score += 3;
      // Overlapping tags
      p.tags.forEach((t) => {
        if (tagSet.has(t.toLowerCase())) score += 1;
      });
      return { post: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .filter((r) => r.score > 0)
    .map((r) => r.post);
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const readingTime = getReadingTime(post.content);
  const relatedPosts = getRelatedPosts(
    post.slug,
    post.tags,
    post.category,
  );

  return (
    <div className="bg-background min-h-screen">
      {/* Schema: Article + Breadcrumb + FAQ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getArticleSchema({
              title: post.title,
              description: post.description,
              slug: post.slug,
              publishedAt: post.publishedAt,
              image: post.image
                ? `https://lastemi.com${post.image}`
                : "https://lastemi.com/images/og-default.png",
              keywords: post.tags,
            }),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getBreadcrumbSchema([
              { name: "LastEMI", url: "https://lastemi.com" },
              { name: "Blog", url: "https://lastemi.com/blog" },
              {
                name: post.title,
                url: `https://lastemi.com/blog/${post.slug}`,
              },
            ]),
          ),
        }}
      />
      {post.faqs && post.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              getFAQSchema(
                post.faqs.map((f) => ({ question: f.q, answer: f.a })),
              ),
            ),
          }}
        />
      )}

      <article className="max-w-3xl mx-auto py-8 px-3 sm:px-6">
        {/* ── Header meta ── */}
        <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
          <span className="font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full text-xs">
            {post.category}
          </span>
          <span className="text-muted-foreground text-xs">
            {new Date(post.publishedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <span className="text-muted-foreground text-xs">
            {readingTime} min read
          </span>
        </div>

        {/* ── Title ── */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 leading-tight">
          {post.title}
        </h1>

        {/* ── Description ── */}
        <p className="text-muted-foreground text-base sm:text-lg mb-4 leading-relaxed">
          {post.description}
        </p>

        {/* ── Tags ── */}
        <div className="flex flex-wrap gap-2 mb-6">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full"
            >
              {formatTag(tag)}
            </span>
          ))}
        </div>

        {/* ── Author + Share ── */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              L
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {post.author || "LastEMI Editorial Team"}
              </p>
              {post.reviewedBy && (
                <p className="text-xs text-muted-foreground">
                  Reviewed by {post.reviewedBy}
                </p>
              )}
            </div>
          </div>
          <ShareButton title={post.title} description={post.description} />
        </div>

        {/* ── Hero Image with Text Overlay ── */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-8 border border-border">
          {/* Background: AI image or gradient fallback */}
          {post.image ? (
            <Image
              src={post.image}
              alt={
                post.imageAlt ??
                `${post.title} — editorial illustration for LastEMI, India's honest debt freedom platform`
              }
              width={1200}
              height={630}
              priority
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#0D1526] via-[#0B2A3C] to-[#0D1526]" />
          )}

          {/* Subtle gradient overlay at bottom for branding */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Logo + category badge — bottom left */}
          <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5 flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full pl-1.5 pr-3 py-1">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#0B7A8C] to-[#26C49A] flex items-center justify-center text-white text-[9px] font-bold">
                %
              </div>
              <span className="text-white/70 text-xs font-medium">LastEMI</span>
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
              {post.category}
            </span>
          </div>
        </div>

        {/* ── MDX Content ── */}
        <div className="text-sm sm:text-base">
          <MdxRenderer source={post.content} />
        </div>

        {/* ── Related Calculator CTA ── */}
        {post.relatedCalculator && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mt-10">
            <p className="text-primary text-sm font-medium flex items-center gap-2">
            <CalculatorIcon className="w-5 h-5 text-primary" />
              Try the calculator mentioned in this post:{" "}
              <Link
                href={post.relatedCalculator}
                className="underline font-semibold hover:text-primary/80 transition-colors"
              >
                Open Calculator →
              </Link>
            </p>
          </div>
        )}

        {/* ── FAQs ── */}
        {post.faqs && post.faqs.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {post.faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group bg-card border border-border rounded-lg"
                >
                  <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-foreground hover:bg-accent/50 rounded-lg transition-colors list-none flex items-center justify-between">
                    {faq.q}
                    <span className="text-muted-foreground group-open:rotate-180 transition-transform ml-2">
                      ▼
                    </span>
                  </summary>
                  <p className="px-4 pb-3 text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* ── Related Posts ── */}
        {relatedPosts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedPosts.map((rp) => (
                <BlogCard key={rp.slug} post={rp} />
              ))}
            </div>
          </section>
        )}

        {/* ── Back to blog ── */}
        <div className="mt-10 pt-6 border-t border-border">
          <Link
            href="/blog"
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            ← Back to all posts
          </Link>
        </div>
      </article>
    </div>
  );
}
