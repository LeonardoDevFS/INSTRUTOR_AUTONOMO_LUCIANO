import { ArrowRight, MessageCircle } from "lucide-react";

import { ActionLink } from "@/components/ui/ActionLink";
import { createWhatsAppUrl } from "@/lib/whatsapp";

type ContactCtaProps = {
  eyebrow?: string;
  title: string;
  description: string;
  whatsappMessage: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  secondaryExternal?: boolean;
};

export function ContactCta({
  eyebrow = "Próximo passo",
  title,
  description,
  whatsappMessage,
  secondaryHref,
  secondaryLabel,
  secondaryExternal = false,
}: ContactCtaProps) {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-surface p-7 sm:p-10 lg:p-14">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
          <div className="relative max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-gold">
              {eyebrow}
            </p>
            <h2 className="mt-4 text-balance font-display text-4xl font-extrabold uppercase leading-[0.95] text-white sm:text-5xl">
              {title}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/55">
              {description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ActionLink
                href={createWhatsAppUrl(whatsappMessage)}
                external
                icon={<MessageCircle size={18} aria-hidden="true" />}
                ariaLabel="Falar com Luciano pelo WhatsApp"
              >
                Falar pelo WhatsApp
              </ActionLink>
              {secondaryHref && secondaryLabel && (
                <ActionLink
                  href={secondaryHref}
                  external={secondaryExternal}
                  variant="secondary"
                  icon={<ArrowRight size={17} aria-hidden="true" />}
                >
                  {secondaryLabel}
                </ActionLink>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
