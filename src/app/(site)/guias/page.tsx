import type { Metadata } from "next";
import { ArrowUpRight, BookOpenText } from "lucide-react";
import Link from "next/link";

import { PageHero } from "@/components/sections/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { guides } from "@/data/guides";
import { whatsappMessages } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Guias sobre CNH e Direção",
  description:
    "Guias da Direção Segura sobre primeira CNH em Minas Gerais, adição de categoria e retomada da direção para habilitados.",
  alternates: { canonical: "/guias" },
};

export default function GuidesPage() {
  return (
    <>
      <PageHero
        eyebrow="Guias Direção Segura"
        title="Informação clara para entender o próximo passo."
        description="Conteúdos para quem está começando a habilitação, adicionando uma categoria ou retomando a prática depois da CNH."
        backHref="/"
        backLabel="Voltar ao início"
        whatsappMessage={whatsappMessages.general}
        placeholderTitle="Conteúdo Direção Segura"
        placeholderDescription="Espaço reservado para uma imagem original dos guias e materiais educativos."
      />

      <section className="py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="Escolha seu guia"
            title="Comece pelo assunto que corresponde ao seu momento."
            description="Os conteúdos burocráticos informam a data de revisão e apontam diretamente para as fontes oficiais utilizadas."
            align="center"
          />
          <div className="mt-10 grid gap-5 lg:mt-14 lg:grid-cols-3">
            {guides.map((guide, index) => (
              <Link
                key={guide.id}
                href={guide.href}
                className="group flex min-h-80 flex-col items-center rounded-[2rem] border border-white/10 bg-surface p-7 text-center transition hover:-translate-y-1 hover:border-gold/45"
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10 text-gold">
                    <BookOpenText size={24} aria-hidden="true" />
                  </span>
                  <span className="flex h-12 min-w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-3 font-display text-xl font-extrabold text-white/65" aria-hidden="true">
                    0{index + 1}
                  </span>
                </div>
                <h2 className="mt-8 text-balance font-display text-3xl font-extrabold uppercase leading-none text-white">
                  {guide.title}
                </h2>
                <p className="mt-5 text-sm leading-7 text-white/50">
                  {guide.description}
                </p>
                <span className="mt-auto flex items-center justify-center gap-2 pt-8 text-sm font-extrabold text-gold">
                  Ler guia
                  <ArrowUpRight
                    size={17}
                    aria-hidden="true"
                    className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
