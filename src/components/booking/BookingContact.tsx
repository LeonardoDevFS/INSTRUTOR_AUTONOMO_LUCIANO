import { MessageCircle } from "lucide-react";
import Link from "next/link";

import { ActionLink } from "@/components/ui/ActionLink";
import { createWhatsAppUrl, whatsappMessages } from "@/lib/whatsapp";

// Somente o formulário do site oferece reservas automáticas. WhatsApp é manual.
export function BookingContact() {
  return (
    <section className="mt-8 rounded-[2rem] border border-white/10 bg-surface p-6 sm:p-8 lg:p-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-gold/25 bg-gold/10 text-gold">
            <MessageCircle size={23} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-gold">
              Atendimento direto
            </p>
            <h2 className="mt-2 font-display text-3xl font-extrabold uppercase text-white">
              Prefere falar com Luciano?
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">
              Para consultar horários especiais, tirar dúvidas ou combinar
              remarcações, entre em contato pelo WhatsApp. As reservas online
              são feitas pelo formulário acima, com verificação de disponibilidade
              na agenda de Luciano.
            </p>
            <p className="mt-2 text-xs leading-5 text-white/35">
              Domingo permanece somente sob consulta. Consulte também nossa{" "}
              <Link
                href="/politica-de-privacidade"
                className="font-bold text-gold hover:text-gold-light"
              >
                Política de Privacidade
              </Link>
              .
            </p>
          </div>
        </div>
        <ActionLink
          href={createWhatsAppUrl(whatsappMessages.booking)}
          external
          variant="primary"
          icon={<MessageCircle size={17} aria-hidden="true" />}
          ariaLabel="Consultar um horário com Luciano pelo WhatsApp"
          className="w-full lg:w-auto"
        >
          Falar com Luciano
        </ActionLink>
      </div>
    </section>
  );
}
