import { ArrowRight, MessageCircle, Route } from "lucide-react";

import { siteConfig } from "@/config/site";
import { createWhatsAppUrl, whatsappMessages } from "@/lib/whatsapp";

import { ActionLink } from "@/components/ui/ActionLink";

export function FinalCta() {
  return (
    <section
      aria-labelledby="final-cta-title"
      className="relative isolate overflow-hidden py-24 sm:py-28 lg:py-36"
    >
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(to_bottom,#070707,rgba(229,185,63,0.08),#070707)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 mx-auto h-64 max-w-5xl [clip-path:polygon(46%_0,54%_0,78%_100%,22%_100%)] bg-gradient-to-b from-gold/20 to-gold/[0.02]" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-48 w-px -translate-x-1/2 bg-gradient-to-b from-gold/80 to-transparent" />

      <div className="mx-auto max-w-5xl px-5 text-center lg:px-8">
        <Route className="mx-auto text-gold" size={34} aria-hidden="true" />
        <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.32em] text-gold">
          Seu próximo passo
        </p>
        <h2
          id="final-cta-title"
          className="mt-5 text-balance font-display text-5xl font-extrabold uppercase leading-[0.9] text-white sm:text-6xl lg:text-8xl"
        >
          A evolução começa quando você decide seguir.
        </h2>
        <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-white/55 sm:text-lg">
          Conte seu objetivo para {siteConfig.name} e encontre o treinamento
          mais adequado para o seu momento.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <ActionLink
            href="/agendar"
            icon={<ArrowRight size={18} aria-hidden="true" />}
            className="sm:px-8"
          >
            Agendar minha aula
          </ActionLink>
          <ActionLink
            href={createWhatsAppUrl(whatsappMessages.general)}
            external
            variant="secondary"
            icon={<MessageCircle size={18} aria-hidden="true" />}
            ariaLabel="Chamar no WhatsApp e falar com Luciano"
            className="sm:px-8"
          >
            Chamar no WhatsApp
          </ActionLink>
        </div>
      </div>
    </section>
  );
}
