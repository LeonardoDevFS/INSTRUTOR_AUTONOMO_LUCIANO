import {
  CalendarDays,
  Check,
  Clock3,
  ExternalLink,
  FileCheck2,
  Info,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import { ActionLink } from "@/components/ui/ActionLink";
import { siteConfig } from "@/config/site";
import { type GoogleBookingConfig } from "@/config/booking";
import { createWhatsAppUrl, whatsappMessages } from "@/lib/whatsapp";

const bookingServices = [
  "Carro — Categoria B",
  "Moto — Categoria A",
  "Preparação para prova prática",
  "Adição de categoria",
  "Primeira habilitação",
  "Orientação sobre taxas e exames",
  "Orientação sobre documentação da CNH",
  "Atendimento para quem tem medo de dirigir",
] as const;

export function GoogleBooking({ config }: { config: GoogleBookingConfig }) {
  const isReady = config.status === "ready";

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <BookingFact
          icon={<Clock3 aria-hidden="true" />}
          title={`${siteConfig.lesson.durationMinutes} minutos`}
          description="Duração padrão de cada hora/aula."
        />
        <BookingFact
          icon={<CalendarDays aria-hidden="true" />}
          title="Uma única agenda"
          description="Todos os serviços compartilham os mesmos horários."
        />
        <BookingFact
          icon={<ShieldCheck aria-hidden="true" />}
          title="Reserva pelo Google"
          description="Horários ocupados deixam de aparecer como disponíveis."
        />
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-surface">
        <div className="grid gap-8 border-b border-white/10 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-gold">
              Escolha seu atendimento
            </p>
            <h2 className="mt-4 font-display text-4xl font-extrabold uppercase leading-none text-white sm:text-5xl">
              Escolha seu atendimento com o Luciano.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/55 sm:text-base">
              Consulte as opções abaixo e, depois de escolher um horário, informe
              a modalidade no campo correspondente do formulário do Google.
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2" aria-label="Serviços disponíveis">
            {bookingServices.map((service) => (
              <li
                key={service}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-6 text-white/65"
              >
                <Check size={16} className="mt-1 shrink-0 text-gold" aria-hidden="true" />
                {service}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-6 border-b border-white/10 bg-gold/[0.045] p-6 sm:p-8 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:p-10">
          <div className="grid size-12 place-items-center rounded-2xl border border-gold/25 bg-gold/10 text-gold">
            <FileCheck2 size={23} aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-extrabold uppercase text-white sm:text-3xl">
              Precisa de ajuda com exames, taxas ou documentação?
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/55">
              Luciano pode orientar sobre as etapas da habilitação, documentação,
              emissão de taxas pelos canais oficiais e agendamento de exames.
              Informe sua necessidade durante a reserva para conversar sobre os
              próximos passos.
            </p>
          </div>
          <ActionLink
            href={createWhatsAppUrl(whatsappMessages.cnhGuidance)}
            external
            variant="secondary"
            icon={<MessageCircle size={17} aria-hidden="true" />}
            ariaLabel="Pedir orientação sobre a CNH pelo WhatsApp"
            className="w-full lg:w-auto"
          >
            Preciso de orientação sobre minha CNH
          </ActionLink>
        </div>

        <div className="border-b border-white/10 p-6 sm:p-8">
          <div className="flex items-start gap-3 text-sm leading-6 text-white/45">
            <Info size={18} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
            <p>
              Este site agenda atendimento ou aula com o instrutor. Ele não agenda
              procedimentos governamentais nem confirma datas de exame no órgão de
              trânsito. Taxas oficiais são emitidas e pagas nos canais públicos, e
              cada etapa depende das regras vigentes e da situação do aluno. Consulte
              também os guias de{" "}
              <Link href="/guias/primeira-cnh-minas-gerais" className="font-bold text-gold hover:text-gold-light">
                primeira habilitação
              </Link>{" "}
              e{" "}
              <Link href="/guias/adicao-de-categoria-mg" className="font-bold text-gold hover:text-gold-light">
                adição de categoria
              </Link>
              .
            </p>
          </div>
        </div>

        {config.status === "ready" && config.canEmbed ? (
          <div className="bg-white p-2 sm:p-4">
            <iframe
              src={config.url}
              title="Agenda de horários de Luciano Oliveira no Google Agenda"
              loading="lazy"
              className="h-[720px] w-full border-0 sm:h-[760px]"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        ) : (
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="rounded-3xl border border-dashed border-gold/30 bg-gold/[0.06] p-6 text-center sm:p-10">
              <CalendarDays size={34} className="mx-auto text-gold" aria-hidden="true" />
              <h2 className="mt-6 font-display text-3xl font-extrabold uppercase text-white">
                {config.status === "invalid"
                  ? "Link de agendamento inválido"
                  : "Agenda online em configuração"}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
                {config.status === "invalid"
                  ? "A configuração atual não aponta para uma página oficial de agendamento do Google. Enquanto ela é corrigida, consulte a disponibilidade pelo WhatsApp."
                  : "A página oficial de reservas do Google ainda não foi conectada. Enquanto a configuração é concluída, consulte a disponibilidade diretamente com Luciano."}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-5 border-t border-white/10 bg-black/25 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="max-w-2xl text-sm leading-6 text-white/45">
            <p>
              O agendamento é processado pelo Google. Consulte também nossa{" "}
              <Link href="/politica-de-privacidade" className="font-bold text-gold hover:text-gold-light">
                Política de Privacidade
              </Link>
              .
            </p>
            <p className="mt-2">
              Domingo permanece disponível somente mediante consulta direta.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:items-end">
            {isReady && (
              <ActionLink
                href={config.url}
                external
                variant="secondary"
                icon={<ExternalLink size={17} aria-hidden="true" />}
                ariaLabel="Abrir a agenda oficial de horários do Google"
                className="w-full sm:w-auto"
              >
                Abrir agenda de horários
              </ActionLink>
            )}
            <ActionLink
              href={createWhatsAppUrl(whatsappMessages.booking)}
              external
              variant={isReady ? "text" : "primary"}
              icon={<MessageCircle size={17} aria-hidden="true" />}
              ariaLabel="Consultar um horário com Luciano pelo WhatsApp"
              className="w-full sm:w-auto"
            >
              Falar com Luciano
            </ActionLink>
          </div>
        </div>
      </section>
    </div>
  );
}

function BookingFact({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-surface p-6">
      <div className="text-gold">{icon}</div>
      <h2 className="mt-5 font-display text-2xl font-extrabold uppercase text-white">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-white/50">{description}</p>
    </article>
  );
}
