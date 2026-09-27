import { CalendarClock, MessageCircle } from "lucide-react";

import { bookingSteps } from "@/data/home";
import { createWhatsAppUrl, whatsappMessages } from "@/lib/whatsapp";

import { ActionLink } from "./ActionLink";
import { SectionHeading } from "./SectionHeading";

export function BookingTeaser() {
  return (
    <section
      id="agenda"
      aria-labelledby="booking-title"
      className="border-y border-white/10 bg-surface py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-20">
          <div className="max-w-2xl">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold text-black">
              <CalendarClock size={27} aria-hidden="true" />
            </div>
            <SectionHeading
              id="booking-title"
              eyebrow="Agendamento"
              title="Seu próximo horário começa com uma conversa simples."
              description="A agenda online será disponibilizada em uma próxima etapa. Enquanto isso, Luciano confirma os horários diretamente pelo WhatsApp."
            />
            <ActionLink
              href={createWhatsAppUrl(whatsappMessages.booking)}
              external
              icon={<MessageCircle size={18} aria-hidden="true" />}
              ariaLabel="Consultar horários disponíveis com Luciano pelo WhatsApp"
              className="mt-8"
            >
              Consultar horários
            </ActionLink>
          </div>
          <p className="max-w-xl border-l border-gold/40 pl-6 text-sm leading-7 text-white/45 lg:justify-self-end">
            O fluxo planejado será direto, pensado para funcionar bem no
            celular e sem expor informações privadas da agenda.
          </p>
        </div>

        <ol className="mt-12 grid gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-5">
          {bookingSteps.map((step, index) => (
            <li
              key={step}
              className="min-h-40 bg-black p-5 sm:min-h-44 lg:min-h-52"
            >
              <span className="font-display text-4xl font-extrabold text-gold/45">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-8 font-display text-xl font-bold uppercase leading-none text-white">
                {step}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
