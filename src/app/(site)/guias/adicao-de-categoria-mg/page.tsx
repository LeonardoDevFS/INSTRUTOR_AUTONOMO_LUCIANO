import type { Metadata } from "next";
import { ArrowRight, Car, Motorbike, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";

import { GuideHero } from "@/components/guides/GuideHero";
import { GuideSteps } from "@/components/guides/GuideSteps";
import { OfficialNotice } from "@/components/guides/OfficialNotice";
import { ContactCta } from "@/components/sections/ContactCta";
import {
  categoryAdditionSteps,
  guideReviewDate,
  officialGuideSources,
} from "@/data/guide-pages";
import { whatsappMessages } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Adição de Categoria A ou B em Minas Gerais",
  description:
    "Entenda o processo oficial para adicionar categoria A ou B à CNH em Minas Gerais, incluindo exames, LADV, aulas e prova prática.",
  alternates: { canonical: "/guias/adicao-de-categoria-mg" },
};

export default function CategoryAdditionGuidePage() {
  const source = officialGuideSources.categoryAddition;

  return (
    <article>
      <GuideHero
        eyebrow="Adição de categoria em Minas Gerais"
        title="Tenho A e quero B. Tenho B e quero A."
        description="Veja como funciona o processo administrativo e prático para incluir uma nova categoria na sua CNH."
        reviewedAt={guideReviewDate}
        source={source}
      />

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <PathCard
              icon={<Motorbike aria-hidden="true" />}
              current="Já tenho B"
              destination="Quero adicionar A"
              description="Processo para incluir a categoria de motocicleta na CNH."
            />
            <PathCard
              icon={<Car aria-hidden="true" />}
              current="Já tenho A"
              destination="Quero adicionar B"
              description="Processo para incluir a categoria de automóvel na CNH."
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
            <div className="rounded-3xl border border-white/10 bg-surface p-6 sm:p-7">
              <ShieldAlert size={24} className="text-gold" aria-hidden="true" />
              <h2 className="mt-6 font-display text-3xl font-extrabold uppercase text-white">
                Antes de abrir o processo
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/55">
                O Portal MG informa que não pode haver bloqueio no prontuário
                nem mais de uma infração gravíssima nos últimos 12 meses. A
                pessoa também deve residir em Minas Gerais e manter seu
                endereço atualizado.
              </p>
            </div>
            <OfficialNotice source={source} />
          </div>
        </div>
      </section>

      <GuideSteps
        title="Etapas atuais para adicionar A ou B."
        steps={categoryAdditionSteps}
      />

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <div className="rounded-[2rem] border border-gold/20 bg-gold/[0.06] p-7 sm:p-9">
            <h2 className="font-display text-4xl font-extrabold uppercase leading-none text-white">
              Onde Luciano pode orientar
            </h2>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-white/60">
              Luciano pode esclarecer dúvidas sobre a preparação e conversar
              sobre o treinamento depois da liberação oficial. A página do
              Portal MG consultada atualmente direciona o cadastro formal da
              etapa prática por um CFC; por isso, confirme com o Detran-MG e
              com Luciano qual formato está autorizado para o seu processo
              antes de contratar as aulas.
            </p>
          </div>
        </div>
      </section>

      <ContactCta
        title="Já iniciou a adição de categoria?"
        description="Conte qual categoria você possui e qual deseja adicionar. Luciano pode orientar sobre o momento adequado para conversar sobre as aulas."
        whatsappMessage={whatsappMessages.addition}
      />
    </article>
  );
}

function PathCard({
  icon,
  current,
  destination,
  description,
}: {
  icon: ReactNode;
  current: string;
  destination: string;
  description: string;
}) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-surface p-7">
      <div className="text-gold">{icon}</div>
      <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-white/40">
        {current}
      </p>
      <h2 className="mt-3 flex items-center gap-3 font-display text-3xl font-extrabold uppercase text-white">
        <ArrowRight size={22} className="text-gold" aria-hidden="true" />
        {destination}
      </h2>
      <p className="mt-4 text-sm leading-6 text-white/50">{description}</p>
    </article>
  );
}
