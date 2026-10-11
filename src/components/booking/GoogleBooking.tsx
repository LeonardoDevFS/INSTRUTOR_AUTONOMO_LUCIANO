import { CalendarDays, ExternalLink, MessageCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { ActionLink } from "@/components/ui/ActionLink";
import type { GoogleBookingConfig } from "@/config/booking";
import { createWhatsAppUrl, whatsappMessages } from "@/lib/whatsapp";

export function GoogleBooking({ config }: { config: GoogleBookingConfig }) {
  const ready = config.status === "ready";

  return (
    <section className="mt-8 rounded-[2rem] border border-white/10 bg-surface p-6 sm:p-8 lg:p-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-gold/25 bg-gold/10 text-gold">
            {ready ? (
              <ShieldCheck size={23} aria-hidden="true" />
            ) : (
              <CalendarDays size={23} aria-hidden="true" />
            )}
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-gold">
              Caso prefira
            </p>
            <h2 className="mt-2 font-display text-3xl font-extrabold uppercase text-white">
              Agende pelo Google
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">
              {ready
                ? "Você também pode consultar os horários e concluir seu agendamento pela página oficial do Google."
                : "A página oficial do Google ainda não foi configurada. Consulte a disponibilidade diretamente com Luciano."}
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
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          {ready && (
            <ActionLink
              href={config.url}
              external
              variant="primary"
              icon={<ExternalLink size={17} aria-hidden="true" />}
              ariaLabel="Agendar pela página oficial do Google"
              className="w-full lg:w-auto"
            >
              Agendar pelo Google
            </ActionLink>
          )}
          <ActionLink
            href={createWhatsAppUrl(whatsappMessages.booking)}
            external
            variant={ready ? "secondary" : "primary"}
            icon={<MessageCircle size={17} aria-hidden="true" />}
            ariaLabel="Consultar um horário com Luciano pelo WhatsApp"
            className="w-full lg:w-auto"
          >
            Falar com Luciano
          </ActionLink>
        </div>
      </div>
    </section>
  );
}
