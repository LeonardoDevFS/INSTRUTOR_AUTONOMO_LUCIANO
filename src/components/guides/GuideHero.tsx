import { BookOpenText, CalendarDays, ExternalLink } from "lucide-react";

import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

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
  parentHref?: string;
  parentLabel?: string;
};

export function GuideHero({
  eyebrow,
  title,
  description,
  reviewedAt,
  source,
  parentHref = "/guias",
  parentLabel = "Guias",
}: GuideHeroProps) {
  return (
    <header className="relative isolate overflow-hidden border-b border-white/10 pt-20">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_88%_18%,rgba(229,185,63,0.13),transparent_28%)]" />
      <div className="pointer-events-none absolute bottom-0 right-[8%] -z-10 h-64 w-64 rounded-full border border-gold/10 opacity-60" />

      <div className="mx-auto max-w-7xl px-5 py-14 sm:py-18 lg:px-8 lg:py-22">
        <Breadcrumbs
          items={[
            { label: "Início", href: "/" },
            { label: parentLabel, href: parentHref },
            { label: eyebrow },
          ]}
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.55fr)] lg:items-end lg:gap-16">
          <div className="min-w-0">
          <p className="mt-9 max-w-full break-words text-xs font-extrabold uppercase leading-5 tracking-[0.2em] text-gold sm:tracking-[0.3em]">
            {eyebrow}
          </p>
          <h1 className="mt-5 max-w-5xl text-balance font-display text-[clamp(2.75rem,8vw,5rem)] font-extrabold uppercase leading-[0.88] tracking-[-0.02em] text-white [overflow-wrap:anywhere]">
            {title}
          </h1>
          <p className="mt-7 max-w-4xl text-base leading-8 text-white/60 sm:text-lg">
            {description}
          </p>
        </div>

        <aside className="border-l border-gold/35 pl-5 lg:pl-8" aria-label="Informações editoriais do guia">
          <BookOpenText size={25} className="text-gold" aria-hidden="true" />
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.2em] text-white/40">
            Informação revisada
          </p>
          <div className="mt-5 flex flex-col gap-4 text-sm text-white/55">
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
            <p className="mt-5 border-t border-white/10 pt-5 text-xs leading-5 text-white/35">
              Página oficial atualizada em {source.officialUpdatedAt}.
            </p>
          )}
        </aside>
        </div>
      </div>
    </header>
  );
}
