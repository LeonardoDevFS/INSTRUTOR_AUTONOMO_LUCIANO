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

import { SectionHeading } from "./SectionHeading";

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
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-5">
          {homeGoals.map((goal, index) => {
            const Icon = goalIcons[goal.icon];

            return (
              <Link
                key={goal.title}
                href={goal.href}
                className="group relative flex min-h-64 flex-col overflow-hidden rounded-3xl border border-white/10 bg-black/45 p-6 transition duration-300 hover:-translate-y-1 hover:border-gold/45 hover:bg-black/70"
              >
                <span
                  aria-hidden="true"
                  className="absolute right-5 top-4 font-display text-5xl font-extrabold text-white/[0.035]"
                >
                  0{index + 1}
                </span>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10 text-gold">
                  <Icon size={23} aria-hidden="true" />
                </span>
                <h3 className="mt-7 font-display text-2xl font-bold uppercase leading-none text-white">
                  {goal.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/45">
                  {goal.description}
                </p>
                <span className="mt-auto flex items-center justify-between pt-6 text-xs font-extrabold uppercase tracking-[0.16em] text-gold">
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
