"use client";

import { useState } from "react";

// Visible, inline share row rendered at the end of every blog post.
// SE Ranking flagged "Add social media buttons to the page" — this satisfies
// it (icons are in the DOM at render time, not behind a click). Pairs with
// the existing dropdown ShareButton at the article header for two surfaces.

interface InlineShareRowProps {
  title: string;
  description?: string;
  pathname: string;
}

export function InlineShareRow({ title, description, pathname }: InlineShareRowProps) {
  const [copied, setCopied] = useState(false);
  const url = `https://lastemi.com${pathname}`;
  const text = `${title} ${url}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available — silently no-op */
    }
  };

  // Each link is a real <a href> with a public share intent — no SDK,
  // no tracking, no JS dependency. Crawlers see them as ordinary links.
  const items: { name: string; href: string; bg: string; svg: React.ReactNode }[] = [
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(text)}`,
      bg: "bg-[#25D366] hover:bg-[#1da851]",
      svg: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
          <path d="M12.05 0a11.815 11.815 0 00-8.413 3.479 11.821 11.821 0 00-3.48 8.413c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413A11.815 11.815 0 0012.05 0zm0 21.785a9.86 9.86 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884z" />
        </svg>
      ),
    },
    {
      name: "Twitter",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      bg: "bg-black hover:bg-neutral-800",
      svg: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      bg: "bg-[#0A66C2] hover:bg-[#084d92]",
      svg: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      bg: "bg-[#1877F2] hover:bg-[#125ec1]",
      svg: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 1.092.044 1.545.132v3.273a8 8 0 0 0-.882-.042c-1.253 0-1.736.474-1.736 1.71v2.49h3.435l-.59 3.663h-2.845v8.318A12.002 12.002 0 0 0 24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.628 3.874 10.35 9.101 11.691" />
        </svg>
      ),
    },
    {
      name: "Email",
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent((description ?? title) + "\n\n" + url)}`,
      bg: "bg-muted hover:bg-accent text-foreground",
      svg: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      ),
    },
  ];

  return (
    <section
      aria-label="Share this article"
      className="mt-10 pt-6 border-t border-border"
    >
      <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-3">
        Found this useful? Share it
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {items.map((it) => (
          <a
            key={it.name}
            href={it.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${it.name}`}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white transition-colors ${it.bg}`}
          >
            {it.svg}
            <span className="hidden sm:inline">{it.name}</span>
          </a>
        ))}
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy link to clipboard"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-accent transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
          <span className="hidden sm:inline">{copied ? "Copied!" : "Copy link"}</span>
        </button>
      </div>
    </section>
  );
}
