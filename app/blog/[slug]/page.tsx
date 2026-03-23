import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPostBySlug, getAllPosts } from "@/lib/blog/utils";
import { getArticleSchema, getFAQSchema, getBreadcrumbSchema } from "@/lib/seo/schema";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: `${post.title} | EMIPartPay Blog`,
    description: post.description,
    keywords: post.tags,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      siteName: "EMIPartPay",
      locale: "en_IN",
      type: "article",
      publishedTime: post.publishedAt,
      ...(post.image ? { images: [{ url: post.image, width: 1200, height: 630 }] } : {}),
    },
    robots: { index: true, follow: true },
  };
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="bg-gray-50 min-h-screen">
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
              image: post.image ? `https://lastemi.com${post.image}` : "https://lastemi.com/images/og-default.png",
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
              { name: post.title, url: `https://lastemi.com/blog/${post.slug}` },
            ]),
          ),
        }}
      />
      {post.faqs && post.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              getFAQSchema(post.faqs.map((f) => ({ question: f.q, answer: f.a }))),
            ),
          }}
        />
      )}
      <article className="max-w-3xl mx-auto py-8 px-3 sm:px-6">
        {/* Header Image */}
        {post.image && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-6">
            <Image
              src={post.image}
              alt={post.title}
              width={1200}
              height={630}
              priority={true}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            {post.category}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(post.publishedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Content — rendered as raw HTML/text for now */}
        {/* TODO: Use MDX renderer (next-mdx-remote) for full component support */}
        <div className="prose prose-gray max-w-none text-sm sm:text-base leading-relaxed">
          <div dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(post.content) }} />
        </div>

        {/* Related Calculator CTA */}
        {post.relatedCalculator && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-8">
            <p className="text-blue-800 text-sm font-medium">
              Try the calculator mentioned in this post:{" "}
              <Link
                href={post.relatedCalculator}
                className="underline font-semibold"
              >
                Open Calculator →
              </Link>
            </p>
          </div>
        )}

        {/* Back to blog */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link
            href="/blog"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to all posts
          </Link>
        </div>
      </article>
    </div>
  );
}

/**
 * Simple markdown-to-HTML converter for blog content.
 * Handles: headings, bold, italic, links, lists, paragraphs.
 * For full MDX component support, switch to next-mdx-remote later.
 */
function simpleMarkdownToHtml(md: string): string {
  return md
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold text-gray-900 mt-8 mb-3">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-2">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 underline">$1</a>')
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul class="list-disc list-inside space-y-1 my-3">${match}</ul>`)
    .replace(/^(\d+)\. (.+)$/gm, "<li>$2</li>")
    .replace(/^(?!<[hulo])(.*\S.*)$/gm, '<p class="mb-3">$1</p>')
    .replace(/<Callout type="tip">([\s\S]*?)<\/Callout>/g,
      '<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4 text-sm text-blue-800">$1</div>')
    .replace(/<EmiCalculator\s*\/>/g,
      '<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6 text-center text-sm text-gray-600">📊 <a href="/" class="text-blue-600 underline font-medium">Open EMI Calculator</a></div>')
    .replace(/<SipVsPrepaymentCalc\s*\/>/g,
      '<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6 text-center text-sm text-gray-600">📊 <a href="/calculators/sip-vs-prepayment" class="text-blue-600 underline font-medium">Open SIP vs Prepayment Calculator</a></div>')
    .replace(/<EligibilityCalc\s*\/>/g,
      '<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6 text-center text-sm text-gray-600">📊 <a href="/calculators/home-loan-eligibility" class="text-blue-600 underline font-medium">Open Eligibility Calculator</a></div>')
    .replace(/<ComparisonTable[\s\S]*?\/>/g,
      '<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 my-4 text-sm text-gray-600 italic">Comparison table — view in full article</div>');
}
