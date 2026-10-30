import { MessageCircle, ShieldCheck } from "lucide-react";

import { Breadcrumbs, type BreadcrumbItem } from "@/components/seo/Breadcrumbs";
import { ActionLink } from "@/components/ui/ActionLink";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { createWhatsAppUrl } from "@/lib/whatsapp";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
  whatsappMessage: string;
  badge?: string;
  layout?: "default" | "centered";
};

export function PageHero({
  eyebrow,
  title,
  description,
  backHref,
  backLabel,
  whatsappMessage,
  badge,
  layout = "default",
}: PageHeroProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Início", href: "/" },
    ...(backHref === "/" ? [] : [{ label: backLabel, href: backHref }]),
    { label: eyebrow },
  ];

  return (
    <section className="relative isolate overflow-hidden border-b border-white/10 pt-20">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 -z-10",
          layout === "centered"
            ? "bg-[radial-gradient(circle_at_50%_20%,rgba(229,185,63,0.12),transparent_34%)]"
            : "bg-[radial-gradient(circle_at_82%_18%,rgba(229,185,63,0.12),transparent_30%)]",
        )}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-5 py-14 sm:py-18 lg:px-8 lg:py-22">
        <Breadcrumbs items={breadcrumbs} />

        <div
          className={cn(
            "mt-10",
            layout === "centered"
              ? "mx-auto max-w-5xl text-center"
              : "grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.55fr)] lg:items-end lg:gap-16",
          )}
        >
          <div className={cn("min-w-0", layout === "centered" && "flex flex-col items-center")}>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-gold sm:tracking-[0.3em]">
                {eyebrow}
              </p>
              {badge && (
                <span className="inline-flex rounded-full border border-gold/25 bg-gold/[0.07] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-gold">
                  {badge}
                </span>
              )}
            </div>
            <h1 className="mt-5 max-w-5xl break-words text-balance font-display text-[clamp(3rem,9vw,5rem)] font-extrabold uppercase leading-[0.88] tracking-[-0.025em] text-white">
              {title}
            </h1>
          </div>

          <div
            className={cn(
              "min-w-0",
              layout === "centered"
                ? "mx-auto mt-8 max-w-3xl border-t border-white/10 pt-8"
                : "border-l border-gold/35 pl-5 lg:pl-8",
            )}
          >
            <p className="text-base leading-7 text-white/60 sm:text-lg sm:leading-8">
              {description}
            </p>
            <ActionLink
              href={createWhatsAppUrl(whatsappMessage)}
              external
              icon={<MessageCircle size={18} aria-hidden="true" />}
              ariaLabel="Conversar com Luciano pelo WhatsApp"
              className={cn("mt-7", layout === "centered" && "mx-auto")}
            >
              Conversar com Luciano
            </ActionLink>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2 text-white/50">
            <ShieldCheck size={15} className="text-gold" aria-hidden="true" />
            {siteConfig.name} — {siteConfig.brand}
          </span>
          <span>{siteConfig.location.serviceArea}</span>
        </div>
      </div>
    </section>
  );
}
