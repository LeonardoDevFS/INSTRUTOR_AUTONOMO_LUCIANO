import { ArrowRight, Camera, Quote, ShieldCheck } from "lucide-react";

import { ActionLink } from "@/components/ui/ActionLink";
import { SectionHeading } from "@/components/ui/SectionHeading";

const resultCommitments = [
  {
    icon: Camera,
    title: "Fotos autorizadas",
    description: "Registros reais serão publicados somente com autorização.",
  },
  {
    icon: Quote,
    title: "Depoimentos reais",
    description: "Relatos serão apresentados sem fabricar histórias ou resultados.",
  },
  {
    icon: ShieldCheck,
    title: "Transparência",
    description: "Nada de números de aprovação ou promessas sem comprovação.",
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
        <div className="grid gap-10 rounded-[2rem] border border-white/10 bg-gradient-to-br from-surface to-black p-6 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:p-14">
          <div>
            <SectionHeading
              id="results-title"
              eyebrow="Resultados reais"
              title="Cada conquista merece ser contada do jeito certo."
              description="Esta área receberá fotos, depoimentos e avaliações reais assim que os materiais autorizados estiverem disponíveis."
            />
            <ActionLink
              href="/resultados"
              variant="text"
              icon={<ArrowRight size={17} aria-hidden="true" />}
              className="mt-7"
            >
              Conhecer a proposta
            </ActionLink>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {resultCommitments.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-dashed border-white/15 bg-white/[0.025] p-5"
              >
                <Icon size={22} className="text-gold" aria-hidden="true" />
                <h3 className="mt-6 font-display text-xl font-bold uppercase leading-none text-white">
                  {title}
                </h3>
                <p className="mt-3 text-xs leading-5 text-white/55">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
