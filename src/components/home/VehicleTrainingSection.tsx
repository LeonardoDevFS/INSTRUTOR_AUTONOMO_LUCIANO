import {
  ArrowRight,
  CalendarDays,
  Car,
  Check,
  Motorbike,
} from "lucide-react";
import Image from "next/image";

import { ActionLink } from "@/components/ui/ActionLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  trainingVehicles,
  type TrainingVehicle,
} from "@/data/vehicles";
import { cn } from "@/lib/utils";

export function VehicleTrainingSection() {
  return (
    <section
      aria-labelledby="vehicles-title"
      className="border-y border-white/10 bg-surface py-20 sm:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          id="vehicles-title"
          eyebrow="Conheça os veículos"
          title="Carro e moto para acompanhar sua evolução."
          description="Veja os veículos utilizados nos treinamentos práticos das categorias A e B e o que pode ser trabalhado em cada um."
        />

        <div className="mt-12 space-y-8 lg:mt-16 lg:space-y-10">
          {trainingVehicles.map((vehicle, index) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              reverse={index % 2 === 1}
            />
          ))}
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-6 rounded-[2rem] border border-gold/25 bg-[radial-gradient(circle_at_85%_20%,rgba(229,185,63,0.14),transparent_35%),#090909] p-7 sm:flex-row sm:items-center sm:p-9">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-gold">
              Seu próximo passo
            </p>
            <h3 className="mt-3 max-w-2xl font-display text-3xl font-extrabold uppercase leading-none text-white sm:text-4xl">
              Escolha a categoria e consulte os horários disponíveis.
            </h3>
          </div>
          <ActionLink
            href="/agendar"
            icon={<CalendarDays size={18} aria-hidden="true" />}
            className="w-full shrink-0 sm:w-auto"
          >
            Solicitar agendamento
          </ActionLink>
        </div>
      </div>
    </section>
  );
}

function VehicleCard({
  vehicle,
  reverse,
}: {
  vehicle: TrainingVehicle;
  reverse: boolean;
}) {
  const Icon = vehicle.id === "car" ? Car : Motorbike;

  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/40 shadow-[0_28px_90px_rgba(0,0,0,0.24)]">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
        <VehicleGallery
          vehicle={vehicle}
          className={cn(reverse && "lg:order-2")}
        />

        <div
          className={cn(
            "flex flex-col p-6 sm:p-8 lg:p-10",
            reverse && "lg:order-1",
          )}
        >
          <div className="flex items-center justify-between gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 text-gold">
              <Icon size={24} aria-hidden="true" />
            </span>
            <span className="rounded-full border border-gold/25 bg-gold/[0.06] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-gold">
              Categoria {vehicle.category}
            </span>
          </div>

          <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-white/40">
            Veículo utilizado nas aulas
          </p>
          <h3 className="mt-3 font-display text-4xl font-extrabold uppercase leading-none text-white sm:text-5xl">
            {vehicle.name}
          </h3>
          <p className="mt-5 text-sm leading-7 text-white/55 sm:text-base">
            {vehicle.description}
          </p>

          <dl className="mt-7 grid grid-cols-3 gap-2">
            {vehicle.specifications.map((specification) => (
              <div
                key={specification.label}
                className="rounded-2xl border border-white/10 bg-white/[0.025] p-3 sm:p-4"
              >
                <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">
                  {specification.label}
                </dt>
                <dd className="mt-2 text-sm font-extrabold text-white sm:text-base">
                  {specification.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-7 border-t border-white/10 pt-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-gold">
              Durante o treinamento
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {vehicle.learningGoals.map((goal) => (
                <li
                  key={goal}
                  className="flex items-start gap-2.5 text-sm leading-6 text-white/55"
                >
                  <Check
                    size={16}
                    className="mt-1 shrink-0 text-gold"
                    aria-hidden="true"
                  />
                  {goal}
                </li>
              ))}
            </ul>
          </div>

          <ActionLink
            href={vehicle.href}
            variant="secondary"
            icon={<ArrowRight size={17} aria-hidden="true" />}
            className="mt-8 w-full sm:w-fit"
          >
            {vehicle.linkLabel}
          </ActionLink>
        </div>
      </div>
    </article>
  );
}

function VehicleGallery({
  vehicle,
  className,
}: {
  vehicle: TrainingVehicle;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-px bg-white/10 p-px lg:grid-rows-2 lg:self-stretch",
        className,
      )}
      role="group"
      aria-label={`Quatro imagens do ${vehicle.name}`}
    >
      {vehicle.images.map((image) => (
        <figure
          key={image.src}
          className="group relative aspect-[4/3] overflow-hidden bg-black lg:aspect-auto lg:min-h-0"
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 29vw, 50vw"
            className="object-cover transition duration-500 group-hover:scale-[1.025]"
            style={{ objectPosition: image.objectPosition }}
          />
        </figure>
      ))}
    </div>
  );
}
