import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "./MdxComponents";

interface MdxRendererProps {
  /** Raw MDX string (after frontmatter has been stripped by gray-matter) */
  source: string;
}

/**
 * Server component that compiles and renders MDX content.
 * Uses next-mdx-remote/rsc v6 — the source is compiled on the server
 * and custom components (including client components) are injected.
 */
export async function MdxRenderer({ source }: MdxRendererProps) {
  return (
    <div className="mdx-content">
      <MDXRemote
        source={source}
        options={{ blockJS: false, mdxOptions: { development: false } }}
        components={mdxComponents}
      />
    </div>
  );
}
