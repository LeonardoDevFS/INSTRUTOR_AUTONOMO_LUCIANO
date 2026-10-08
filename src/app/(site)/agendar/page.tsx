import type { Metadata } from "next";

import { GoogleBooking } from "@/components/booking/GoogleBooking";
import { PageHero } from "@/components/sections/PageHero";
import { getGoogleBookingConfig } from "@/config/booking";
import { siteMedia } from "@/data/media";
import { whatsappMessages } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Agendar Aula",
  description:
    "Escolha um horário disponível e reserve sua aula com Luciano Oliveira. Aulas de carro, moto e treinamentos personalizados em Itajubá/MG.",
  alternates: { canonical: "/agendar" },
};

export default function BookingPage() {
  const googleBookingConfig = getGoogleBookingConfig();

  return (
    <>
      <PageHero
        eyebrow="Agendamento online"
        title="Agende sua próxima aula."
        description="Escolha um horário disponível e reserve sua aula com Luciano Oliveira. Aulas de carro, moto e treinamentos personalizados em Itajubá/MG."
        backHref="/"
        backLabel="Voltar ao início"
        whatsappMessage={whatsappMessages.booking}
        placeholderTitle="Agenda Direção Segura"
        placeholderDescription="Uma única agenda para todos os treinamentos da Direção Segura."
        imageSrc={siteMedia.vehicles.src}
        imageAlt={siteMedia.vehicles.alt}
        imagePosition={siteMedia.vehicles.objectPosition}
      />

      <section className="py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <GoogleBooking config={googleBookingConfig} />
        </div>
      </section>
    </>
  );
}
