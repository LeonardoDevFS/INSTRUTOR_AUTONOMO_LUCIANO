import { CalendarClock, MessageCircle } from "lucide-react";

import { bookingSteps } from "@/data/home";

import { ActionLink } from "@/components/ui/ActionLink";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function BookingTeaser() {
  return (
    <section
      id="agenda"
      aria-labelledby="booking-title"
      className="border-y border-white/10 bg-surface py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div>
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold text-black">
              <CalendarClock size={27} aria-hidden="true" />
            </div>
            <SectionHeading
              id="booking-title"
              eyebrow="Agendamento"
              title="Seu próximo horário começa com uma conversa simples."
              description="Escolha serviço, dia e horário de preferência. A solicitação é organizada pelo site e confirmada diretamente com Luciano pelo WhatsApp."
              align="center"
            />
            <ActionLink
              href="/agendar"
              icon={<MessageCircle size={18} aria-hidden="true" />}
              className="mt-8"
            >
              Solicitar um horário
            </ActionLink>
          </div>
          <p className="mx-auto mt-8 max-w-2xl border-t border-gold/40 pt-5 text-sm leading-7 text-white/55">
            O fluxo planejado será direto, pensado para funcionar bem no
            celular e sem expor informações privadas da agenda.
          </p>
        </div>

        <ol className="mt-12 grid gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-5">
          {bookingSteps.map((step, index) => (
            <li
              key={step}
              className="flex min-h-40 flex-col items-center justify-center bg-black p-5 text-center sm:min-h-44 lg:min-h-52"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/25 bg-gold/10 font-display text-xl font-extrabold text-gold">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-5 font-display text-xl font-bold uppercase leading-none text-white">
                {step}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
