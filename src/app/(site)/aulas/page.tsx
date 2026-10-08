import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, Car, ClipboardCheck, Motorbike, RefreshCw } from "lucide-react";
import Link from "next/link";

import { ContactCta } from "@/components/sections/ContactCta";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { services } from "@/data/services";
import { siteMedia } from "@/data/media";
import { whatsappMessages } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Aulas de Direção em Itajubá",
  description:
    "Conheça as aulas de carro, moto, preparação para prova prática e treinamento para habilitados com Luciano Oliveira em Itajubá/MG.",
  alternates: { canonical: "/aulas" },
};

const lessonServices = services.filter((service) =>
  ["carro", "moto", "habilitados", "prova-pratica"].includes(service.id),
);

const serviceIcons: Record<string, LucideIcon> = {
  carro: Car,
  moto: Motorbike,
  habilitados: RefreshCw,
  "prova-pratica": ClipboardCheck,
};

export default function LessonsPage() {
  return (
    <>
      <PageHero
        eyebrow="Aulas práticas"
        title="Treinamento individual para cada etapa da direção."
        description="Carro, moto, preparação para exame e retomada da prática com atendimento em Itajubá/MG e região."
        backHref="/"
        backLabel="Voltar ao início"
        whatsappMessage={whatsappMessages.general}
        placeholderTitle="Carro e moto"
        placeholderDescription="Composição visual das categorias A e B da Direção Segura."
        imageSrc={siteMedia.vehicles.src}
        imageAlt={siteMedia.vehicles.alt}
        imagePosition={siteMedia.vehicles.objectPosition}
      />

      <section className="py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="Escolha seu treinamento"
            title="O ponto de partida muda. A atenção individual permanece."
            description="Veja qual opção corresponde ao seu momento e acesse os detalhes do treinamento."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:mt-14">
            {lessonServices.map((service) => {
              const Icon = serviceIcons[service.id] ?? Car;

              return (
                <Link
                  key={service.id}
                  href={service.href}
                  className="group flex min-h-72 flex-col rounded-[2rem] border border-white/10 bg-surface p-7 transition hover:-translate-y-1 hover:border-gold/45 sm:p-8"
                >
                  <div className="flex items-start justify-between gap-5">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                      <Icon size={24} aria-hidden="true" />
                    </span>
                    {service.category && (
                      <span className="rounded-full border border-gold/20 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-gold">
                        Categoria {service.category}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-8 font-display text-4xl font-extrabold uppercase leading-none text-white">
                    {service.title}
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-white/50">
                    {service.description}
                  </p>
                  <span className="mt-auto flex items-center gap-2 pt-8 text-sm font-extrabold text-gold">
                    Ver detalhes
                    <ArrowUpRight
                      size={17}
                      aria-hidden="true"
                      className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <ContactCta
        title="Não sabe qual treinamento escolher?"
        description="Conte em que etapa você está e quais dificuldades deseja trabalhar. Luciano pode orientar o caminho mais adequado."
        whatsappMessage={whatsappMessages.general}
        secondaryHref="/contato"
        secondaryLabel="Ver horários e contato"
      />
    </>
  );
}
