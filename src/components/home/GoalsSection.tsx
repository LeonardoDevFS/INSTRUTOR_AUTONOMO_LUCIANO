import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  BookOpen,
  Car,
  IdCard,
  Motorbike,
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
  motorcycle: Motorbike,
  licensed: Car,
  mentorship: BookOpen,
  addition: IdCard,
} satisfies Record<HomeGoalIcon, LucideIcon>;

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
          eyebrow="Qual é o seu objetivo?"
          title="Cada fase pede um caminho diferente."
          description="Escolha o ponto que mais combina com o seu momento e veja como Luciano pode ajudar."
          align="center"
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-5">
          {homeGoals.map((goal, index) => {
            const Icon = goalIcons[goal.icon];

            return (
              <Link
                key={goal.title}
                href={goal.href}
                className="group relative flex min-h-64 flex-col items-center overflow-hidden rounded-3xl border border-white/10 bg-black/45 p-6 text-center transition duration-300 hover:-translate-y-1 hover:border-gold/45 hover:bg-black/70"
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
                <h3 className="mt-7 font-display text-2xl font-bold uppercase leading-none text-white">
                  {goal.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/55">
                  {goal.description}
                </p>
                <span className="mt-auto flex items-center justify-center gap-2 pt-6 text-xs font-extrabold uppercase tracking-[0.16em] text-gold">
                  Ver caminho
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
