import { ArrowUpRight, BookOpenText } from "lucide-react";
import Link from "next/link";

import { guides } from "@/data/guides";

import { SectionHeading } from "@/components/ui/SectionHeading";

export function GuidesSection() {
  return (
    <section
      id="guias"
      aria-labelledby="guides-title"
      className="py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col items-center gap-7 text-center">
          <SectionHeading
            id="guides-title"
            eyebrow="Guias Direção Segura"
            title="Informação para tomar o próximo passo com clareza."
            description="Conteúdos diretos para entender processos e encontrar o treinamento adequado ao seu momento."
            align="center"
          />
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 text-gold">
            <BookOpenText size={26} aria-hidden="true" />
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:mt-14 lg:grid-cols-3">
          {guides.map((guide, index) => (
            <Link
              key={guide.id}
              href={guide.href}
              className="group relative flex min-h-80 flex-col items-center overflow-hidden rounded-[2rem] border border-white/10 bg-surface p-7 text-center transition duration-300 hover:-translate-y-1 hover:border-gold/40 sm:p-8"
            >
              <span
                aria-hidden="true"
                className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] font-display text-xl font-extrabold text-white/65"
              >
                0{index + 1}
              </span>
              <h3 className="mt-6 text-balance font-display text-3xl font-extrabold uppercase leading-[0.95] text-white">
                {guide.title}
              </h3>
              <p className="mt-5 text-sm leading-6 text-white/50">
                {guide.description}
              </p>
              <span className="mt-auto flex items-center justify-center gap-2 pt-8 text-xs font-extrabold uppercase tracking-[0.17em] text-gold">
                Ler guia
                <ArrowUpRight
                  size={18}
                  aria-hidden="true"
                  className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
