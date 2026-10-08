import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { getAbsoluteUrl } from "@/lib/seo/site-url";

import { JsonLd } from "./JsonLd";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: readonly BreadcrumbItem[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: getAbsoluteUrl(item.href) } : {}),
    })),
  };

  return (
    <>
      <JsonLd data={schema} />
      <nav aria-label="Navegação estrutural">
        <ol className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-white/40">
          {items.map((item, index) => (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 && (
                <ChevronRight size={13} aria-hidden="true" className="text-white/20" />
              )}
              {item.href ? (
                <Link href={item.href} className="transition hover:text-gold">
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-gold">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
