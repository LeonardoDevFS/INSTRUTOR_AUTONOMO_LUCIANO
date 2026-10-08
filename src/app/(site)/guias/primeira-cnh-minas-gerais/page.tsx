import type { Metadata } from "next";
import { Check, FileText, ShieldCheck } from "lucide-react";

import { GuideHero } from "@/components/guides/GuideHero";
import { GuideSteps } from "@/components/guides/GuideSteps";
import { OfficialNotice } from "@/components/guides/OfficialNotice";
import { ContactCta } from "@/components/sections/ContactCta";
import { siteConfig } from "@/config/site";
import {
  firstLicenseSteps,
  guideReviewDate,
  officialGuideSources,
} from "@/data/guide-pages";
import { whatsappMessages } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Como Tirar a Primeira CNH em Minas Gerais",
  description:
    "Guia atualizado sobre as etapas da primeira habilitação em Minas Gerais: cadastro, exames, curso teórico, provas, aulas práticas e PPD.",
  alternates: { canonical: "/guias/primeira-cnh-minas-gerais" },
};

const requirements = [
  "Ter 18 anos completos",
  "Saber ler e escrever",
  "Possuir documento de identificação aceito legalmente",
  "Estar inscrito no CPF",
] as const;

export default function FirstLicenseGuidePage() {
  const source = officialGuideSources.firstLicense;

  return (
    <article>
      <GuideHero
        eyebrow="Primeira habilitação em Minas Gerais"
        title="Como tirar a primeira CNH em MG."
        description="Um roteiro em linguagem simples para entender o processo oficial antes de iniciar as aulas práticas."
        reviewedAt={guideReviewDate}
        source={source}
      />

      <section className="py-20 sm:py-24">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 lg:grid-cols-[1fr_0.8fr] lg:px-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-gold">
              Quem pode iniciar
            </p>
            <h2 className="mt-4 font-display text-4xl font-extrabold uppercase leading-none text-white sm:text-5xl">
              Requisitos básicos informados pelo Portal MG.
            </h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {requirements.map((requirement) => (
                <li
                  key={requirement}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-surface p-4 text-sm leading-6 text-white/65"
                >
                  <Check size={17} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
                  {requirement}
                </li>
              ))}
            </ul>
          </div>
          <OfficialNotice source={source} />
        </div>
      </section>

      <GuideSteps
        title="Da abertura do processo até a Permissão para Dirigir."
        steps={firstLicenseSteps}
      />

      <section className="py-20 sm:py-24">
        <div className="mx-auto grid max-w-5xl gap-6 px-5 lg:grid-cols-2 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-surface p-7">
            <FileText size={25} className="text-gold" aria-hidden="true" />
            <h2 className="mt-7 font-display text-3xl font-extrabold uppercase leading-none text-white">
              PPD e CNH definitiva
            </h2>
            <p className="mt-5 text-sm leading-7 text-white/55">
              A PPD vale por 12 meses. Segundo o Portal MG, nesse período a
              pessoa não pode cometer infração grave ou gravíssima nem mais de
              uma infração média para solicitar a CNH definitiva. Confira a
              redação oficial antes da solicitação.
            </p>
          </div>

          <div className="rounded-[2rem] border border-gold/20 bg-gold/[0.06] p-7">
            <ShieldCheck size={25} className="text-gold" aria-hidden="true" />
            <h2 className="mt-7 font-display text-3xl font-extrabold uppercase leading-none text-white">
              Onde Luciano entra
            </h2>
            <p className="mt-5 text-sm leading-7 text-white/60">
              Luciano não substitui cadastro, exames ou provas oficiais. Após
              a liberação para a etapa prática, o próprio Portal MG permite a
              escolha de CFC ou instrutor autônomo habilitado. É nessa fase que
              ele pode oferecer treinamento de carro ou moto em{" "}
              {siteConfig.location.serviceArea}.
            </p>
          </div>
        </div>
      </section>

      <ContactCta
        eyebrow="Etapa prática"
        title="Já foi liberado para começar as aulas?"
        description="Fale com Luciano, informe a categoria desejada e consulte como iniciar o treinamento prático."
        whatsappMessage={whatsappMessages.general}
        secondaryHref={source.url}
        secondaryLabel="Consultar Portal MG"
        secondaryExternal
      />
    </article>
  );
}
