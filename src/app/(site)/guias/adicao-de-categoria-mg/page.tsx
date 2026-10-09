import type { Metadata } from "next";
import { ArrowRight, BookOpenCheck, Car, Motorbike, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { GuideHero } from "@/components/guides/GuideHero";
import { JourneyCTA } from "@/components/guides/JourneyCTA";
import { JourneyFAQ } from "@/components/guides/JourneyFAQ";
import { JourneyGlossary } from "@/components/guides/JourneyGlossary";
import { JourneyStepper } from "@/components/guides/JourneyStepper";
import { OfficialSources } from "@/components/guides/OfficialSources";
import {
  categoryAdditionFaq,
  categoryAdditionSteps,
  categoryAdditionVariants,
  guideGlossary,
  guideReviewDate,
  officialGuideSources,
} from "@/data/guide-pages";
import { whatsappMessages } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Adição de Categoria A ou B em Itajubá e MG",
  description: "Guia atualizado para adicionar categoria A ou B em Minas Gerais: requisitos, exames, licença, aulas práticas e exame de direção.",
  alternates: { canonical: "/guias/adicao-de-categoria-mg" },
  openGraph: {
    title: "Adição de Categoria: amplie suas possibilidades",
    description: "Entenda como adicionar categoria A ou B à habilitação em Minas Gerais.",
  },
};

export default function CategoryAdditionGuidePage() {
  return (
    <article>
      <GuideHero
        eyebrow="Adição de categoria em Minas Gerais"
        title="Adição de Categoria: amplie suas possibilidades"
        description="Você já possui habilitação, mas deseja conduzir outro tipo de veículo? Entenda os requisitos, as etapas e como se preparar para a nova experiência."
        reviewedAt={guideReviewDate}
        source={officialGuideSources.categoryAddition}
      />

      <section className="py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:px-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-gold">Dois caminhos</p>
            <h2 className="mt-4 text-balance font-display text-4xl font-extrabold uppercase leading-[0.95] text-white sm:text-5xl">A categoria atual define seu ponto de partida.</h2>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/60">A adição não apaga a categoria que você já possui. Ela acrescenta uma nova autorização depois das etapas e da aprovação correspondentes ao novo veículo.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <PathCard icon={<Motorbike aria-hidden="true" />} current="Tenho categoria B" destination="Quero adicionar A" description="Nova aprendizagem para condução de motocicleta." />
              <PathCard icon={<Car aria-hidden="true" />} current="Tenho categoria A" destination="Quero adicionar B" description="Nova aprendizagem para condução de automóvel." />
            </div>
            <div className="mt-5 flex items-start gap-4 rounded-2xl border border-white/10 bg-surface p-5">
              <BookOpenCheck size={22} className="shrink-0 text-gold" aria-hidden="true" />
              <p className="text-sm leading-7 text-white/60"><strong className="text-white">Adição não é mudança de categoria.</strong> A passagem para C, D ou E usa outro serviço e possui requisitos específicos. Este guia trata somente de A e B.</p>
            </div>
          </div>
          <OfficialSources sources={[officialGuideSources.categoryAddition, officialGuideSources.resolution1020, officialGuideSources.autonomousInstructor]} />
        </div>
      </section>

      <JourneyStepper journeyKey="adicao-categoria-mg" title="Escolha seu caminho e acompanhe cada etapa." steps={categoryAdditionSteps} variants={categoryAdditionVariants} />

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <div className="grid gap-7 rounded-[2rem] border border-gold/20 bg-gold/[0.06] p-7 md:grid-cols-[auto_1fr] sm:p-9">
            <ShieldCheck size={30} className="text-gold" aria-hidden="true" />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-gold">Como Luciano pode ajudar</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold uppercase leading-none text-white">Treinamento para a nova categoria.</h2>
              <p className="mt-5 text-sm leading-7 text-white/65">Depois da liberação oficial, Luciano pode conversar sobre o planejamento prático, as habilidades da categoria pretendida e a frequência das aulas. A atuação no processo depende da autorização profissional e da possibilidade de registro no fluxo vigente do Detran-MG.</p>
            </div>
          </div>
        </div>
      </section>

      <JourneyGlossary items={guideGlossary} />
      <JourneyFAQ items={categoryAdditionFaq} />
      <JourneyCTA title="Sua nova categoria pode começar com um plano claro." description="Agende um horário ou conte a Luciano qual categoria você já possui e qual deseja adicionar." whatsappMessage={whatsappMessages.addition} />
    </article>
  );
}

function PathCard({ icon, current, destination, description }: { icon: ReactNode; current: string; destination: string; description: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-surface p-6">
      <div className="text-gold">{icon}</div>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-white/40">{current}</p>
      <h3 className="mt-2 flex items-center gap-2 font-display text-2xl font-extrabold uppercase text-white"><ArrowRight size={18} className="text-gold" aria-hidden="true" />{destination}</h3>
      <p className="mt-3 text-sm leading-6 text-white/50">{description}</p>
    </div>
  );
}
