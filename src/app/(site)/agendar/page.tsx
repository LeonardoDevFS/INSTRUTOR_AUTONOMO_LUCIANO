import type { Metadata } from "next";

import { BookingFlow } from "@/components/booking/BookingFlow";
import { PageHero } from "@/components/sections/PageHero";
import { whatsappMessages } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Solicitar Horário de Aula",
  description:
    "Escolha o serviço, indique dia e horário de preferência e envie uma solicitação de aula para Luciano Oliveira pelo WhatsApp.",
  alternates: { canonical: "/agendar" },
};

export default function BookingPage() {
  return (
    <>
      <PageHero
        eyebrow="Solicitação de horário"
        title="Escolha sua preferência e confirme pelo WhatsApp."
        description="O fluxo abaixo organiza as informações da sua solicitação. O horário só é reservado depois da confirmação direta de Luciano."
        backHref="/"
        backLabel="Voltar ao início"
        whatsappMessage={whatsappMessages.booking}
        placeholderTitle="Agenda Direção Segura"
        placeholderDescription="A integração operacional com o calendário será conectada em uma etapa posterior."
      />

      <section className="py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <BookingFlow />
        </div>
      </section>
    </>
  );
}
