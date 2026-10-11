import type { Metadata } from "next";

import { CustomBooking } from "@/components/booking/CustomBooking";
import { GoogleBooking } from "@/components/booking/GoogleBooking";
import { PageHero } from "@/components/sections/PageHero";
import { getGoogleBookingConfig } from "@/config/booking";
import {
  bookingServices,
  getPublicBookingRuntimeConfig,
} from "@/config/public-booking";
import { whatsappMessages } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Agendar Aula",
  description:
    "Escolha um horário disponível e reserve sua aula com Luciano Oliveira. Aulas de carro, moto e treinamentos personalizados em Itajubá/MG.",
  alternates: { canonical: "/agendar" },
};

// A liberação depende de variáveis disponíveis no runtime da Netlify. Não
// congele `ready` durante o build, pois isso manteria a interface desativada
// mesmo depois de configurar as Functions e fazer um novo deploy.
export const dynamic = "force-dynamic";

export default function BookingPage() {
  const googleBookingConfig = getGoogleBookingConfig();
  const customBookingConfig = getPublicBookingRuntimeConfig();

  return (
    <>
      <PageHero
        eyebrow="Agendamento online"
        title="Agende sua próxima aula."
        description="Escolha um horário disponível e reserve sua aula com Luciano Oliveira. Aulas de carro, moto e treinamentos personalizados em Itajubá/MG."
        backHref="/"
        backLabel="Voltar ao início"
        whatsappMessage={whatsappMessages.booking}
        layout="centered"
      />

      <section className="py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <CustomBooking
            services={bookingServices}
            ready={customBookingConfig.ready}
          />
          <GoogleBooking config={googleBookingConfig} />
        </div>
      </section>
    </>
  );
}
