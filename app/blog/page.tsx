import { getAllPosts } from "@/lib/blog/utils";
import { BlogCard } from "@/components/blog/BlogCard";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Blog — EMI, Loans & Debt Freedom Tips",
  description:
    "Practical guides on home loans, EMI management, tax benefits, and becoming debt-free. Written by finance experts, backed by real math.",
  path: "/blog",
  keywords: [
    "loan blog India",
    "EMI tips",
    "debt freedom guide",
  ],
});

export default function BlogListPage() {
  const posts = getAllPosts();

  return (
    <div className="bg-background min-h-screen">
      <main className="max-w-4xl mx-auto py-8 px-3 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          LastEMI Blog
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base mb-8">
          Honest, math-backed guides to help you pay off your loans faster.
        </p>

        {posts.length === 0 ? (
          <div className="bg-card border border-border rounded-xl shadow-sm p-8 text-center">
            <p className="text-muted-foreground text-sm">
              Blog posts coming soon. Check back shortly!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
