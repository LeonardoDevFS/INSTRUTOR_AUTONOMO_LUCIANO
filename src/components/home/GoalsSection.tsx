import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  Car,
  IdCard,
  Route,
} from "lucide-react";
import Link from "next/link";

import {
  homeGoals,
  type HomeGoalIcon,
} from "@/data/home";

import { SectionHeading } from "@/components/ui/SectionHeading";

const goalIcons = {
  "first-license": Route,
  licensed: Car,
  addition: IdCard,
} satisfies Record<HomeGoalIcon, LucideIcon>;

const goalLabels = [
  "Conhecer todas as etapas",
  "Ver como funciona",
  "Conhecer o treinamento",
] as const;

export function GoalsSection() {
  return (
    <section
      id="objetivos"
      aria-labelledby="goals-title"
      className="bg-surface py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          id="goals-title"
          eyebrow="Escolha seu caminho"
          title="Qual é o seu próximo passo na direção?"
          description="Seja para conquistar sua primeira CNH, adicionar uma nova categoria ou voltar a dirigir com confiança, conheça cada etapa e descubra como o Instrutor Luciano pode ajudar."
          align="center"
        />

        <div className="mt-10 grid gap-5 lg:mt-14 lg:grid-cols-3">
          {homeGoals.map((goal, index) => {
            const Icon = goalIcons[goal.icon];

            return (
              <Link
                key={goal.title}
                href={goal.href}
                className="group relative flex min-h-80 flex-col items-center overflow-hidden rounded-[2rem] border border-white/10 bg-black/45 p-7 text-center transition duration-300 hover:-translate-y-1 hover:border-gold/45 hover:bg-black/70 sm:p-8"
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10 text-gold">
                    <Icon size={23} aria-hidden="true" />
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex h-12 min-w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-3 font-display text-xl font-extrabold text-white/65"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-8 text-balance font-display text-3xl font-bold uppercase leading-none text-white">
                  {goal.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/55">
                  {goal.description}
                </p>
                <span className="mt-auto flex items-center justify-center gap-2 pt-6 text-xs font-extrabold uppercase tracking-[0.16em] text-gold">
                  {goalLabels[index]}
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
  );
}
