import Link from "next/link";
import Image from "next/image";
import type { BlogPostFrontmatter } from "@/lib/blog/types";

interface BlogCardProps {
  post: BlogPostFrontmatter;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="block bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Thumbnail */}
      {post.image ? (
        <div className="relative w-full aspect-video">
          <Image
            src={post.image}
            alt={post.title}
            width={600}
            height={315}
            className="object-cover w-full h-full"
          />
        </div>
      ) : (
        <div className="w-full aspect-video bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
          <span className="text-3xl opacity-50">📝</span>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            {post.category}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(post.publishedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
          {post.title}
        </h3>
        <p className="text-xs text-gray-600 line-clamp-2">{post.description}</p>
      </div>
    </Link>
  );
}
