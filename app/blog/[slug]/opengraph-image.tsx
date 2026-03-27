import { getPostBySlug } from "@/lib/blog/utils";
import { generateOGImage, OG_SIZE } from "@/lib/og-image";

export const runtime = "nodejs";
export const alt = "LastEMI Blog Post";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const post = getPostBySlug(slug);
  if (!post) {
    return generateOGImage({
      title: "LastEMI Blog",
      subtitle: "Math-backed guides for Indian borrowers",
      badge: "Blog",
    });
  }

  return generateOGImage({
    title: post.title,
    subtitle: post.description.slice(0, 100),
    badge: post.category,
  });
}
