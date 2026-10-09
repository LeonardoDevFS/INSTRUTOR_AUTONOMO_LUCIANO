import type { Metadata } from "next";
import { Check, HeartHandshake, Route, ShieldCheck } from "lucide-react";

import { GuideHero } from "@/components/guides/GuideHero";
import { JourneyCTA } from "@/components/guides/JourneyCTA";
import { JourneyFAQ } from "@/components/guides/JourneyFAQ";
import { JourneyStepper } from "@/components/guides/JourneyStepper";
import {
  fearOfDrivingSituations,
  guideReviewDate,
  licensedTrainingFaq,
  licensedTrainingSteps,
} from "@/data/guide-pages";
import { siteMedia } from "@/data/media";
import { whatsappMessages } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Treinamento para Habilitados em Itajubá",
  description: "Treinamento personalizado para habilitados em Itajubá/MG: retomada da prática, estacionamento, subidas, trânsito urbano e direção preventiva.",
  alternates: { canonical: "/aulas/habilitados" },
  openGraph: {
    title: "Treinamento para Habilitados: volte a dirigir com confiança",
    description: "Aperfeiçoamento prático e progressivo para pessoas já habilitadas em Itajubá e região.",
  },
};

export default function LicensedDriversPage() {
  return (
    <article>
      <GuideHero
        eyebrow="Aulas para habilitados em Itajubá"
        title="Treinamento para Habilitados: volte a dirigir com confiança"
        description="Aperfeiçoe sua direção e desenvolva habilidades práticas com acompanhamento individual, sem transformar sua dificuldade em julgamento ou promessa de resultado rápido."
        reviewedAt={guideReviewDate}
        imageSrc={siteMedia.licensedTraining.src}
        imageAlt={siteMedia.licensedTraining.alt}
        imagePosition={siteMedia.licensedTraining.objectPosition}
        parentHref="/aulas"
        parentLabel="Aulas"
      />

      <section className="py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-gold">Para quem é</p>
            <h2 className="mt-4 text-balance font-display text-4xl font-extrabold uppercase leading-[0.95] text-white sm:text-5xl">Sua CNH já existe. A prática pode ser reconstruída.</h2>
            <p className="mt-6 text-base leading-8 text-white/60">Este não é um novo processo administrativo de habilitação. É um serviço de aperfeiçoamento para quem possui CNH válida e deseja trabalhar necessidades específicas com supervisão.</p>
            <div className="mt-7 flex items-start gap-4 rounded-2xl border border-gold/20 bg-gold/[0.06] p-5">
              <ShieldCheck size={22} className="shrink-0 text-gold" aria-hidden="true" />
              <p className="text-sm leading-7 text-white/65">O progresso é individual. Atividades, locais e complexidade dependem da avaliação do instrutor, da categoria da CNH e das condições legais e de segurança.</p>
            </div>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {fearOfDrivingSituations.map((situation) => (
              <li key={situation} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-surface p-5 text-sm leading-6 text-white/70">
                <Check size={17} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
                {situation}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <JourneyStepper journeyKey="treinamento-habilitados" title="Um treinamento construído ao redor da sua necessidade." steps={licensedTrainingSteps} />

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <div className="grid gap-8 rounded-[2rem] border border-white/10 bg-surface p-7 md:grid-cols-[auto_1fr] sm:p-10">
            <HeartHandshake size={34} className="text-gold" aria-hidden="true" />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-gold">Medo ou insegurança para dirigir</p>
              <h2 className="mt-3 text-balance font-display text-4xl font-extrabold uppercase leading-none text-white">Você não precisa começar pela situação mais difícil.</h2>
              <p className="mt-5 text-base leading-8 text-white/60">Ter habilitação não significa necessariamente se sentir confortável ao volante. Algumas pessoas passam muito tempo sem dirigir, enquanto outras enfrentam dificuldades em determinadas situações do trânsito. O treinamento personalizado respeita o ritmo de cada aluno e trabalha suas necessidades de forma progressiva.</p>
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/10 bg-black/30 p-5">
                <Route size={20} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
                <p className="text-sm leading-7 text-white/60">O trabalho é pedagógico e prático. Não substitui acompanhamento médico ou psicológico quando a pessoa precisar desse tipo de suporte.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <JourneyFAQ items={licensedTrainingFaq} />
      <JourneyCTA title="Quer voltar a dirigir no seu ritmo?" description="Agende uma aula ou conte a Luciano quais situações você deseja trabalhar no treinamento." whatsappMessage={whatsappMessages.licensed} bookingLabel="Quero voltar a dirigir" />
    </article>
  );
}
