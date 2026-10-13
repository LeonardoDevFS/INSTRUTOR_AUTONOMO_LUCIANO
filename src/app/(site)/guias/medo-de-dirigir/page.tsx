import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Check, ExternalLink, HeartHandshake, MessageCircle, Route, ShieldCheck } from "lucide-react";

import { GuideHero } from "@/components/guides/GuideHero";
import { ContactCta } from "@/components/sections/ContactCta";
import { ActionLink } from "@/components/ui/ActionLink";
import { guideReviewDate, fearOfDrivingSituations, officialGuideSources } from "@/data/guide-pages";
import { whatsappMessages } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Medo ou Insegurança para Dirigir",
  description:
    "Orientações para pessoas habilitadas que sentem insegurança para dirigir e desejam retomar a prática gradualmente em Itajubá/MG.",
  alternates: { canonical: "/guias/medo-de-dirigir" },
};

export default function FearOfDrivingGuidePage() {
  return (
    <article>
      <GuideHero
        eyebrow="Para quem já possui CNH"
        title="Sente insegurança para dirigir? Você pode recomeçar no seu ritmo."
        description="Um guia acolhedor para entender como o treinamento prático pode apoiar a retomada, sem julgamentos ou promessas de prazo."
        reviewedAt={guideReviewDate}
      />

      <section className="py-20 sm:py-24">
        <div className="mx-auto grid max-w-5xl gap-12 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <HeartHandshake size={30} className="text-gold" aria-hidden="true" />
            <h2 className="mt-7 text-balance font-display text-4xl font-extrabold uppercase leading-none text-white sm:text-5xl">
              Insegurança não apaga o que você já aprendeu.
            </h2>
            <p className="mt-6 text-base leading-8 text-white/55">
              Ficar muito tempo sem dirigir ou ter dificuldade em uma situação
              específica pode tornar a retomada desconfortável. Isso não exige
              comparação com outras pessoas: o treinamento pode começar pelo
              ponto que faz sentido para você.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {fearOfDrivingSituations.map((situation) => (
              <li
                key={situation}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-surface p-4 text-sm leading-6 text-white/65"
              >
                <Check size={17} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
                {situation}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="pb-20 sm:pb-24" aria-labelledby="driver-status-title">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <div className="grid gap-5 rounded-3xl border border-white/10 bg-surface p-6 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10 text-gold">
              <ShieldCheck size={23} aria-hidden="true" />
            </span>
            <div>
              <h2 id="driver-status-title" className="text-lg font-extrabold text-white">Quer conferir a situação da sua CNH?</h2>
              <p className="mt-2 text-sm leading-6 text-white/55">Esta consulta é apenas uma verificação administrativa opcional antes de retomar as aulas. Ela não explica nem define a causa da insegurança para dirigir.</p>
            </div>
            <ActionLink
              href={officialGuideSources.driverStatus.url}
              external
              variant="secondary"
              icon={<ExternalLink size={16} aria-hidden="true" />}
              ariaLabel="Consultar situação do condutor no portal oficial do Detran-MG (abre em nova guia)"
              className="sm:justify-self-end"
            >
              Consultar no Detran-MG
            </ActionLink>
          </div>
          <p className="mt-3 text-xs text-white/35">O botão abre um site governamental em uma nova guia.</p>
        </div>
      </section>

      <section className="border-y border-white/10 bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-gold">
            Como funciona
          </p>
          <h2 className="mt-4 font-display text-4xl font-extrabold uppercase leading-none text-white sm:text-5xl">
            Um processo gradual e personalizado.
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <ProcessCard
              icon={<MessageCircle aria-hidden="true" />}
              number="01"
              title="Conversa inicial"
              description="Você explica o que evita, o que precisa fazer e onde sente mais dificuldade."
            />
            <ProcessCard
              icon={<Route aria-hidden="true" />}
              number="02"
              title="Prática direcionada"
              description="As situações são escolhidas de acordo com sua necessidade e experiência atual."
            />
            <ProcessCard
              icon={<HeartHandshake aria-hidden="true" />}
              number="03"
              title="Evolução no seu ritmo"
              description="O avanço é combinado aula a aula, sem garantia de prazo ou resultado."
            />
          </div>
        </div>
      </section>

      <ContactCta
        title="Quer conversar sobre a situação que mais incomoda?"
        description="Conte sua dificuldade para Luciano e entenda como um treinamento individual pode ser organizado."
        whatsappMessage={whatsappMessages.licensed}
        secondaryHref="/aulas/habilitados"
        secondaryLabel="Ver treinamento para habilitados"
      />
    </article>
  );
}

function ProcessCard({
  icon,
  number,
  title,
  description,
}: {
  icon: ReactNode;
  number: string;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-black/35 p-6 text-center">
      <div className="flex items-center justify-center gap-3 text-gold">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10">
          {icon}
        </span>
        <span className="flex h-12 min-w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-3 font-display text-xl font-extrabold text-white/65" aria-hidden="true">
          {number}
        </span>
      </div>
      <h3 className="mt-6 font-display text-2xl font-bold uppercase text-white">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-white/50">{description}</p>
    </article>
  );
}
