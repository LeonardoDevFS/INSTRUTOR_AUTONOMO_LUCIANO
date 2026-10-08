import { Check, ShieldCheck } from "lucide-react";

import { siteConfig } from "@/config/site";
import { authorityHighlights } from "@/data/home";

import { SectionHeading } from "@/components/ui/SectionHeading";

export function AuthoritySection() {
  return (
    <section
      aria-labelledby="authority-title"
      className="relative overflow-hidden py-20 sm:py-24 lg:py-32"
    >
      <div className="pointer-events-none absolute -left-36 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-gold/[0.06] blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-surface p-8 text-center sm:p-10">
          <div className="pointer-events-none absolute inset-x-12 top-0 h-32 rounded-full bg-gold/[0.08] blur-3xl" />
          <ShieldCheck className="relative mx-auto text-gold" size={32} aria-hidden="true" />
          <p className="relative mt-8 font-display text-[7rem] font-extrabold leading-[0.72] tracking-[-0.06em] text-gold sm:text-[9rem]">
            {siteConfig.experienceYears}
          </p>
          <p className="relative mx-auto mt-7 max-w-xs font-display text-3xl font-bold uppercase leading-none text-white sm:text-4xl">
            anos de experiência
          </p>
          <p className="relative mx-auto mt-5 max-w-sm text-sm leading-6 text-white/55">
            Conhecimento construído entre sala de aula, treinamento prático e
            atenção individual.
          </p>
        </div>

        <div>
          <SectionHeading
            id="authority-title"
            eyebrow="Experiência que orienta"
            title="Clareza para aprender. Confiança para evoluir."
            description="Luciano une experiência teórica e prática para entender o momento de cada aluno e construir um treinamento compatível com seus objetivos."
          />

          <ul className="mt-9 grid gap-4 sm:grid-cols-2">
            {authorityHighlights.map((highlight) => (
              <li
                key={highlight}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm leading-6 text-white/65"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                  <Check size={14} aria-hidden="true" />
                </span>
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
