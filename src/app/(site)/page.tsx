import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Car,
  CheckCircle2,
  Clock,
  MapPin,
  Motorbike,
} from "lucide-react";

import { guides } from "@/data/guides";
import { services } from "@/data/services";

export default function HomePage() {
  return (
    <>
      <section
        className="
          relative flex min-h-screen items-center
          overflow-hidden pt-20
        "
      >
        <div
          className="
            pointer-events-none absolute inset-0
            bg-[radial-gradient(circle_at_75%_40%,rgba(229,185,63,0.16),transparent_30%)]
          "
        />

        <div className="relative mx-auto w-full max-w-7xl px-5 py-24 lg:px-8">
          <div className="max-w-4xl">
            <p
              className="
                mb-5 text-sm font-bold uppercase
                tracking-[0.35em] text-gold
              "
            >
              Instrutor Autônomo • Itajubá/MG
            </p>

            <h1
              className="
                font-display text-6xl font-extrabold
                uppercase leading-[0.9]
                tracking-tight text-white
                sm:text-7xl lg:text-8xl
              "
            >
              Mais que
              <br />
              dirigir,
              <br />
              <span className="text-gold">é evoluir.</span>
            </h1>

            <p
              className="
                mt-8 max-w-2xl
                text-base leading-7 text-white/60
                sm:text-lg
              "
            >
              Aulas de carro e moto, preparação para habilitação,
              treinamento para habilitados e mentoria teórica com
              Luciano Oliveira.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/agendar"
                className="
                  inline-flex items-center justify-center gap-2
                  rounded-full bg-gold
                  px-8 py-4
                  font-extrabold text-black
                  transition
                  hover:-translate-y-1 hover:bg-gold-light
                "
              >
                Agendar minha aula

                <ArrowRight size={19} />
              </Link>

              <Link
                href="#servicos"
                className="
                  inline-flex items-center justify-center
                  rounded-full border border-white/15
                  px-8 py-4
                  font-bold text-white
                  transition hover:bg-white/5
                "
              >
                Conhecer os serviços
              </Link>
            </div>

            <div
              className="
                mt-14 grid max-w-3xl
                grid-cols-2 gap-5
                sm:grid-cols-4
              "
            >
              <HeroDetail
                value="27+"
                label="Anos de experiência"
              />

              <HeroDetail
                value="A + B"
                label="Carro e moto"
              />

              <HeroDetail
                value="50 min"
                label="Por hora/aula"
              />

              <HeroDetail
                value="Itajubá"
                label="e região"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        id="servicos"
        className="border-y border-white/10 bg-surface py-24"
      >
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionIntro
            eyebrow="Como o Luciano pode ajudar"
            title="Seu objetivo define o caminho."
            description="Da primeira habilitação ao aperfeiçoamento de quem já possui CNH."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.id}
                href={service.href}
                className="
                  group rounded-3xl border border-white/10
                  bg-black/40 p-7
                  transition duration-300
                  hover:-translate-y-1
                  hover:border-gold/50
                "
              >
                <div
                  className="
                    mb-6 flex h-11 w-11
                    items-center justify-center
                    rounded-xl bg-gold/10
                    text-gold
                  "
                >
                  {service.id === "moto" ? (
                    <Motorbike size={23} />
                  ) : service.id === "mentoria" ? (
                    <BookOpen size={23} />
                  ) : (
                    <Car size={23} />
                  )}
                </div>

                <h3 className="font-display text-2xl font-bold uppercase text-white">
                  {service.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-white/50">
                  {service.description}
                </p>

                <span
                  className="
                    mt-6 inline-flex items-center gap-2
                    text-sm font-bold text-gold
                  "
                >
                  Saiba mais

                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionIntro
            eyebrow="Não sabe por onde começar?"
            title="Encontre o seu caminho."
            description="Criamos guias completos para explicar cada etapa de forma simples."
          />

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {guides.map((guide, index) => (
              <Link
                key={guide.id}
                href={guide.href}
                className="
                  group relative overflow-hidden
                  rounded-3xl border border-white/10
                  bg-surface p-8
                  transition
                  hover:border-gold/40
                "
              >
                <span
                  className="
                    font-display text-6xl
                    font-extrabold text-white/5
                  "
                >
                  0{index + 1}
                </span>

                <h3
                  className="
                    mt-5 font-display
                    text-3xl font-bold uppercase
                    leading-none text-white
                  "
                >
                  {guide.title}
                </h3>

                <p className="mt-5 text-sm leading-6 text-white/50">
                  {guide.description}
                </p>

                <span
                  className="
                    mt-7 inline-flex items-center gap-2
                    text-sm font-bold text-gold
                  "
                >
                  Ver guia

                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-surface py-20">
        <div
          className="
            mx-auto grid max-w-7xl gap-8
            px-5 lg:grid-cols-3 lg:px-8
          "
        >
          <InfoItem
            icon={<Clock />}
            title="Horários flexíveis"
            description="Segunda a sexta das 07h às 20h, sábado das 07h às 13h e domingo sob consulta."
          />

          <InfoItem
            icon={<MapPin />}
            title="Itajubá e região"
            description="O ponto de encontro é combinado de acordo com o nível e a necessidade do aluno."
          />

          <InfoItem
            icon={<CheckCircle2 />}
            title="Atendimento individual"
            description="Treinamento adaptado ao objetivo, experiência e dificuldade de cada aluno."
          />
        </div>
      </section>
    </>
  );
}

function HeroDetail({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div>
      <strong
        className="
          font-display text-2xl
          font-extrabold text-white
        "
      >
        {value}
      </strong>

      <p className="mt-1 text-xs text-white/40">
        {label}
      </p>
    </div>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <p
        className="
          text-xs font-extrabold
          uppercase tracking-[0.3em]
          text-gold
        "
      >
        {eyebrow}
      </p>

      <h2
        className="
          mt-4 font-display
          text-4xl font-extrabold
          uppercase leading-none
          text-white sm:text-5xl
        "
      >
        {title}
      </h2>

      <p
        className="
          mt-5 max-w-2xl
          leading-7 text-white/50
        "
      >
        {description}
      </p>
    </div>
  );
}

function InfoItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-5">
      <div
        className="
          flex h-12 w-12 shrink-0
          items-center justify-center
          rounded-2xl bg-gold/10
          text-gold
        "
      >
        {icon}
      </div>

      <div>
        <h3 className="font-bold text-white">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-white/45">
          {description}
        </p>
      </div>
    </div>
  );
}