import { ArrowRight, MessageCircle } from "lucide-react";

import { ActionLink } from "@/components/ui/ActionLink";
import { createWhatsAppUrl } from "@/lib/whatsapp";

type JourneyCTAProps = {
  eyebrow?: string;
  title: string;
  description: string;
  whatsappMessage: string;
  bookingLabel?: string;
};

export function JourneyCTA({ eyebrow = "Seu próximo passo", title, description, whatsappMessage, bookingLabel = "Agendar aula com Luciano" }: JourneyCTAProps) {
  return (
    <section className="pb-20 sm:pb-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-gold/25 bg-surface p-7 sm:p-10 lg:p-14">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
          <div className="relative max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-gold">{eyebrow}</p>
            <h2 className="mt-4 text-balance font-display text-4xl font-extrabold uppercase leading-[0.95] text-white sm:text-5xl">{title}</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/60">{description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ActionLink href="/agendar" icon={<ArrowRight size={18} aria-hidden="true" />}>{bookingLabel}</ActionLink>
              <ActionLink href={createWhatsAppUrl(whatsappMessage)} external variant="secondary" icon={<MessageCircle size={18} aria-hidden="true" />} ariaLabel="Falar com Luciano pelo WhatsApp">Tirar uma dúvida</ActionLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
