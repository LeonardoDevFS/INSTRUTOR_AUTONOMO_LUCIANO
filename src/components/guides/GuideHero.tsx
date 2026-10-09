import { CalendarDays, ExternalLink } from "lucide-react";

import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { cn } from "@/lib/utils";

type GuideHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  reviewedAt: string;
  source?: {
    title: string;
    url: string;
    officialUpdatedAt: string;
  };
  imageSrc?: string;
  imageAlt?: string;
  imagePosition?: string;
  imageFit?: "cover" | "contain";
  parentHref?: string;
  parentLabel?: string;
};

export function GuideHero({
  eyebrow,
  title,
  description,
  reviewedAt,
  source,
  imageSrc,
  imageAlt,
  imagePosition,
  imageFit,
  parentHref = "/guias",
  parentLabel = "Guias",
}: GuideHeroProps) {
  return (
    <header className="relative isolate overflow-hidden border-b border-white/10 pt-20">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_75%_35%,rgba(229,185,63,0.15),transparent_30%)]" />
      <div
        className={cn(
          "mx-auto px-5 py-16 sm:py-20 lg:px-8 lg:py-24",
          imageSrc
            ? "grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16"
            : "max-w-5xl",
        )}
      >
        <div>
          <Breadcrumbs
            items={[
              { label: "Início", href: "/" },
              { label: parentLabel, href: parentHref },
              { label: eyebrow },
            ]}
          />
          <p className="mt-9 text-xs font-extrabold uppercase tracking-[0.3em] text-gold">
            {eyebrow}
          </p>
          <h1 className="mt-5 break-words text-balance font-display text-5xl font-extrabold uppercase leading-[0.9] text-white sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="mt-7 max-w-3xl text-base leading-8 text-white/60 sm:text-lg">
            {description}
          </p>
          <div className="mt-8 flex flex-col gap-3 text-xs text-white/45 sm:flex-row sm:items-center sm:gap-6">
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={15} className="text-gold" aria-hidden="true" />
              Revisado em {reviewedAt}
            </span>
            {source && (
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-bold text-gold transition hover:text-gold-light"
              >
                Fonte oficial: Portal MG
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            )}
          </div>
          {source && (
            <p className="mt-3 text-xs text-white/35">
              Página oficial atualizada em {source.officialUpdatedAt}.
            </p>
          )}
        </div>

        {imageSrc && (
          <MediaPlaceholder
            title={eyebrow}
            description={description}
            src={imageSrc}
            alt={imageAlt}
            objectPosition={imagePosition}
            objectFit={imageFit}
            priority
            className="min-h-[28rem] lg:min-h-[38rem]"
          />
        )}
      </div>
    </header>
  );
}
