import Link from "next/link";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";

export interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const schemaItems = items.map((item) => ({
    name: item.name,
    url: item.href.startsWith("http") ? item.href : `https://lastemi.com${item.href}`,
  }));

  return (
    <>
      <BreadcrumbSchema items={schemaItems} />
      <nav
        aria-label="Breadcrumb"
        className="text-xs sm:text-sm text-muted-foreground mb-4"
      >
        <ol className="flex flex-wrap items-center gap-1.5">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-1.5">
                {isLast ? (
                  <span
                    aria-current="page"
                    className="text-foreground font-medium"
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                )}
                {!isLast && <span className="text-muted-foreground/60">›</span>}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
