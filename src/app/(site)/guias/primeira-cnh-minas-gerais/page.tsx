import type { Metadata } from "next";
import { Bike, Car, Check, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { GuideHero } from "@/components/guides/GuideHero";
import { JourneyCTA } from "@/components/guides/JourneyCTA";
import { JourneyFAQ } from "@/components/guides/JourneyFAQ";
import { JourneyGlossary } from "@/components/guides/JourneyGlossary";
import { JourneyStepper } from "@/components/guides/JourneyStepper";
import { OfficialSources } from "@/components/guides/OfficialSources";
import { siteConfig } from "@/config/site";
import {
  firstLicenseFaq,
  firstLicenseSteps,
  guideGlossary,
  guideReviewDate,
  officialGuideSources,
} from "@/data/guide-pages";
import { whatsappMessages } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Primeira Habilitação: Caminho até a CNH em MG",
  description: "Guia didático atualizado para tirar a primeira CNH em Minas Gerais: requisitos, curso gratuito, exames, aulas práticas, PPD e CNH definitiva.",
  alternates: { canonical: "/guias/primeira-cnh-minas-gerais" },
  openGraph: {
    title: "Primeira Habilitação: seu caminho até a CNH",
    description: "Entenda todas as etapas da primeira habilitação em Minas Gerais com linguagem simples e fontes oficiais.",
  },
};

const requirements = ["18 anos completos", "Saber ler e escrever", "Documento oficial reconhecido", "Inscrição no CPF"] as const;

export default function FirstLicenseGuidePage() {
  const source = officialGuideSources.firstLicense;

  return (
    <article>
      <GuideHero
        eyebrow="Primeira habilitação em Minas Gerais"
        title="Primeira Habilitação: seu caminho até a CNH"
        description="Conquistar a primeira habilitação é um passo importante para a independência e a mobilidade. Entenda cada etapa para saber exatamente por onde começar."
        reviewedAt={guideReviewDate}
        source={source}
      />

      <section className="py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:px-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-gold">Antes de começar</p>
            <h2 className="mt-4 text-balance font-display text-4xl font-extrabold uppercase leading-[0.95] text-white sm:text-5xl">Quem pode iniciar e qual categoria escolher?</h2>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/60">O processo atende quem ainda não possui habilitação e cumpre os requisitos legais. Antes de abrir o cadastro, confira seus documentos e pense no tipo de veículo que fará parte da sua rotina.</p>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {requirements.map((item) => <li key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-surface p-4 text-sm text-white/70"><Check size={17} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />{item}</li>)}
            </ul>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <CategoryCard icon={<Bike aria-hidden="true" />} category="A" title="Motocicleta" description="Veículos motorizados de duas ou três rodas, conforme a definição legal." />
              <CategoryCard icon={<Car aria-hidden="true" />} category="B" title="Automóvel" description="Veículos de até 3.500 kg e oito passageiros além do motorista." />
              <CategoryCard icon={<><Bike aria-hidden="true" /><Car aria-hidden="true" /></>} category="AB" title="As duas" description="Formação e exame prático realizados para cada categoria." />
            </div>
          </div>
          <OfficialSources sources={[officialGuideSources.firstLicense, officialGuideSources.cnhBrasil, officialGuideSources.resolution1020, officialGuideSources.autonomousInstructor]} />
        </div>
      </section>

      <JourneyStepper journeyKey="primeira-cnh-mg" title="Da primeira dúvida à CNH definitiva." steps={firstLicenseSteps} />

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <div className="grid gap-7 rounded-[2rem] border border-gold/20 bg-gold/[0.06] p-7 md:grid-cols-[auto_1fr] sm:p-9">
            <ShieldCheck size={30} className="text-gold" aria-hidden="true" />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-gold">Onde Luciano entra no processo</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold uppercase leading-none text-white">Orientação e aprendizagem prática.</h2>
              <p className="mt-5 text-sm leading-7 text-white/65">Luciano não realiza exames médicos, não aplica provas e não emite documentos. Após a liberação oficial da etapa prática, um instrutor autônomo autorizado pode orientar as aulas e registrar a formação dentro das regras vigentes. O atendimento da Direção Segura acontece em {siteConfig.location.serviceArea}.</p>
              <p className="mt-4 text-sm font-bold leading-7 text-white">Chegou a hora de aprender na prática? O Instrutor Luciano oferece acompanhamento personalizado para ajudar você a desenvolver as habilidades necessárias para dirigir com segurança.</p>
            </div>
          </div>
        </div>
      </section>

      <JourneyGlossary items={guideGlossary} />
      <JourneyFAQ items={firstLicenseFaq} />
      <JourneyCTA title="Seu processo já foi liberado para as aulas?" description="Agende um horário ou fale com Luciano para organizar o treinamento prático da categoria A ou B." whatsappMessage={whatsappMessages.general} />
    </article>
  );
}

function CategoryCard({ icon, category, title, description }: { icon: ReactNode; category: string; title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-surface p-5">
      <div className="flex items-center justify-between text-gold"><span className="flex gap-1">{icon}</span><span className="font-display text-2xl font-extrabold">{category}</span></div>
      <h3 className="mt-5 font-display text-2xl font-extrabold uppercase text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/50">{description}</p>
    </div>
  );
}
