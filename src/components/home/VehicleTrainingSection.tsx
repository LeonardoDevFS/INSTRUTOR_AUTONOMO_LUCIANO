import { ArrowRight, Car, MessageCircle, Motorbike } from "lucide-react";

import { services } from "@/data/services";
import { createWhatsAppUrl, whatsappMessages } from "@/lib/whatsapp";

import { ActionLink } from "./ActionLink";
import { MediaPlaceholder } from "./MediaPlaceholder";
import { SectionHeading } from "./SectionHeading";

const vehicleServices = services.filter(
  (service) => service.id === "carro" || service.id === "moto",
);

export function VehicleTrainingSection() {
  return (
    <section
      aria-labelledby="vehicle-training-title"
      className="py-20 sm:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          id="vehicle-training-title"
          eyebrow="Carro e moto"
          title="Duas categorias. O mesmo compromisso com a evolução."
          description="Treinamentos práticos pensados para o seu momento, seja na categoria B ou na categoria A."
        />

        <div className="mt-10 grid gap-5 lg:mt-14 lg:grid-cols-2">
          {vehicleServices.map((service) => {
            const isMotorcycle = service.id === "moto";
            const Icon = isMotorcycle ? Motorbike : Car;
            const message = isMotorcycle
              ? whatsappMessages.motorcycle
              : whatsappMessages.car;

            return (
              <article
                key={service.id}
                className="overflow-hidden rounded-[2rem] border border-white/10 bg-surface"
              >
                <MediaPlaceholder
                  title={`Foto original — ${service.shortTitle}`}
                  description={`Espaço preparado para uma foto real das aulas de ${service.shortTitle.toLowerCase()}.`}
                  className="min-h-72 rounded-none border-0 border-b border-white/10"
                />

                <div className="p-6 sm:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                      <Icon size={24} aria-hidden="true" />
                    </span>
                    <span className="font-display text-lg font-extrabold uppercase tracking-[0.15em] text-gold">
                      Categoria {service.category}
                    </span>
                  </div>

                  <h3 className="mt-6 font-display text-4xl font-extrabold uppercase leading-none text-white">
                    {service.title}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-white/50 sm:text-base sm:leading-7">
                    {service.description}
                  </p>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <ActionLink
                      href={service.href}
                      variant="secondary"
                      icon={<ArrowRight size={17} aria-hidden="true" />}
                    >
                      Conhecer as aulas
                    </ActionLink>
                    <ActionLink
                      href={createWhatsAppUrl(message)}
                      external
                      variant="text"
                      icon={<MessageCircle size={17} aria-hidden="true" />}
                      ariaLabel={`Falar com Luciano sobre ${service.title.toLowerCase()} pelo WhatsApp`}
                    >
                      Tirar uma dúvida
                    </ActionLink>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
