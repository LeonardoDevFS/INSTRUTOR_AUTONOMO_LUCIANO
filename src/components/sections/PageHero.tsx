import { MessageCircle } from "lucide-react";

import { Breadcrumbs, type BreadcrumbItem } from "@/components/seo/Breadcrumbs";
import { ActionLink } from "@/components/ui/ActionLink";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { createWhatsAppUrl } from "@/lib/whatsapp";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
  whatsappMessage: string;
  placeholderTitle: string;
  placeholderDescription: string;
  badge?: string;
};

export function PageHero({
  eyebrow,
  title,
  description,
  backHref,
  backLabel,
  whatsappMessage,
  placeholderTitle,
  placeholderDescription,
  badge,
}: PageHeroProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Início", href: "/" },
    ...(backHref === "/" ? [] : [{ label: backLabel, href: backHref }]),
    { label: eyebrow },
  ];

  return (
    <section className="relative isolate overflow-hidden border-b border-white/10 pt-20">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_28%,rgba(229,185,63,0.16),transparent_28%)]" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:py-24">
        <div>
          <Breadcrumbs items={breadcrumbs} />
          <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.3em] text-gold">
            {eyebrow}
          </p>
          {badge && (
            <span className="mt-5 inline-flex rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-gold">
              {badge}
            </span>
          )}
          <h1 className="mt-5 text-balance font-display text-5xl font-extrabold uppercase leading-[0.9] text-white sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-white/55 sm:text-lg sm:leading-8">
            {description}
          </p>
          <ActionLink
            href={createWhatsAppUrl(whatsappMessage)}
            external
            icon={<MessageCircle size={18} aria-hidden="true" />}
            ariaLabel="Conversar com Luciano pelo WhatsApp"
            className="mt-9"
          >
            Conversar com Luciano
          </ActionLink>
        </div>

        <MediaPlaceholder
          title={placeholderTitle}
          description={placeholderDescription}
          className="min-h-[27rem] lg:min-h-[35rem]"
        />
      </div>
    </section>
  );
}
