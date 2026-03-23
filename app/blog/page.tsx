import { Metadata } from "next";
import { getAllPosts } from "@/lib/blog/utils";
import { BlogCard } from "@/components/blog/BlogCard";

export const metadata: Metadata = {
  title: "Blog — EMI, Loans & Debt Freedom Tips | EMIPartPay",
  description:
    "Practical guides on home loans, EMI management, tax benefits, and becoming debt-free. Written by finance experts, backed by real math.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "EMIPartPay Blog",
    url: "/blog",
    siteName: "EMIPartPay",
    locale: "en_IN",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function BlogListPage() {
  const posts = getAllPosts();

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-4xl mx-auto py-8 px-3 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          EMIPartPay Blog
        </h1>
        <p className="text-gray-600 text-sm sm:text-base mb-8">
          Honest, math-backed guides to help you pay off your loans faster.
        </p>

        {posts.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-500 text-sm">
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
