import { ArrowRight, BadgeCheck, MessageSquareQuote, ShieldCheck } from "lucide-react";

import { ActionLink } from "@/components/ui/ActionLink";
import { SectionHeading } from "@/components/ui/SectionHeading";

const resultPrinciples = [
  {
    icon: BadgeCheck,
    title: "Conquistas reais",
    description: "Somente resultados e materiais autorizados fazem parte da comunicação.",
  },
  {
    icon: MessageSquareQuote,
    title: "Relatos autênticos",
    description: "Depoimentos só são publicados quando vêm de experiências reais.",
  },
  {
    icon: ShieldCheck,
    title: "Comunicação responsável",
    description: "Sem percentuais, quantidades ou promessas que não possam ser comprovados.",
  },
] as const;

export function ResultsTeaser() {
  return (
    <section
      id="resultados"
      aria-labelledby="results-title"
      className="py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-surface to-black">
          <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16 lg:p-14">
            <div>
              <SectionHeading
                id="results-title"
                eyebrow="Resultados reais"
                title="Cada conquista merece ser contada do jeito certo."
                description="Resultados e relatos só entram na comunicação quando são reais e autorizados, sem percentuais inventados ou promessas de aprovação."
              />
              <ActionLink
                href="/resultados"
                variant="text"
                icon={<ArrowRight size={17} aria-hidden="true" />}
                className="mt-7"
              >
                Entender nosso compromisso
              </ActionLink>
            </div>

            <div className="divide-y divide-white/10 border-y border-white/10">
              {resultPrinciples.map(({ icon: Icon, title, description }, index) => (
                <div key={title} className="grid gap-4 py-6 sm:grid-cols-[auto_1fr] sm:items-start sm:gap-5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/10 text-gold">
                    <Icon size={21} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/30">
                      0{index + 1}
                    </p>
                    <h3 className="mt-1 font-display text-2xl font-extrabold uppercase text-white">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-white/50">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        </div>
      </div>
    </section>
  );
}
