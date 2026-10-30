import {
  ArrowRight,
  CalendarDays,
  Car,
  Check,
  Motorbike,
} from "lucide-react";

import { ActionLink } from "@/components/ui/ActionLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  trainingVehicles,
  type TrainingVehicle,
} from "@/data/vehicles";

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
              index={index}
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
  index,
}: {
  vehicle: TrainingVehicle;
  index: number;
}) {
  const Icon = vehicle.id === "car" ? Car : Motorbike;

  return (
    <article className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/35 p-6 sm:p-8 lg:p-10">
      <span className="pointer-events-none absolute -right-2 -top-9 font-display text-[10rem] font-extrabold leading-none text-white/[0.025]" aria-hidden="true">
        0{index + 1}
      </span>
      <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.72fr)] lg:gap-16">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 text-gold">
              <Icon size={24} aria-hidden="true" />
            </span>
            <span className="rounded-full border border-gold/25 bg-gold/[0.06] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-gold">
              Categoria {vehicle.category}
            </span>
          </div>

          <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-white/55">
            Veículo utilizado nas aulas
          </p>
          <h3 className="mt-3 font-display text-5xl font-extrabold uppercase leading-[0.9] text-white sm:text-6xl">
            {vehicle.name}
          </h3>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
            {vehicle.description}
          </p>

          <dl className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3">
            {vehicle.specifications.map((specification) => (
              <div
                key={specification.label}
                className="bg-[#0a0a0a] p-4 sm:p-5"
              >
                <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/55">
                  {specification.label}
                </dt>
                <dd className="mt-2 text-sm font-extrabold text-white sm:text-base">
                  {specification.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex min-w-0 flex-col border-t border-white/10 pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-gold">
              Durante o treinamento
            </p>
            <ul className="mt-5 grid gap-4">
              {vehicle.learningGoals.map((goal) => (
                <li
                  key={goal}
                  className="flex items-start gap-3 border-b border-white/10 pb-4 text-sm leading-6 text-white/60 last:border-0"
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
