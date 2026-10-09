import type { Metadata } from "next";
import { Check, MapPin, ShieldCheck } from "lucide-react";

import { ContactCta } from "@/components/sections/ContactCta";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/config/site";
import { siteMedia } from "@/data/media";
import { whatsappMessages } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Sobre Luciano Oliveira",
  description:
    "Conheça Luciano Oliveira, instrutor autônomo da Direção Segura, com 27 anos de experiência e atendimento em Itajubá/MG e região.",
  alternates: { canonical: "/sobre" },
};

const principles = [
  "Atendimento individual e adaptado ao aluno",
  "Orientação clara entre teoria e prática",
  "Treinamento de carro e moto",
  "Evolução gradual, sem promessas enganosas",
] as const;

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Sobre Luciano Oliveira"
        title="Experiência para orientar cada etapa da sua evolução."
        description={`${siteConfig.experienceYears} anos de experiência entre sala de aula e prática, com atendimento individual em ${siteConfig.location.serviceArea}.`}
        backHref="/"
        backLabel="Voltar ao início"
        whatsappMessage={whatsappMessages.general}
        placeholderTitle="Luciano Oliveira"
        placeholderDescription="Instrutor Autônomo da Direção Segura em Itajubá/MG."
        imageSrc={siteMedia.hero.src}
        imageAlt={siteMedia.hero.alt}
        imagePosition={siteMedia.hero.objectPosition}
        photoEffect="portrait"
        photoReveal
        badge={siteConfig.brand}
      />

      <section className="py-20 sm:py-24 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-20 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-surface p-7 text-center sm:p-9">
            <ShieldCheck size={30} className="mx-auto text-gold" aria-hidden="true" />
            <p className="mt-8 font-display text-8xl font-extrabold leading-none text-gold">
              {siteConfig.experienceYears}
            </p>
            <p className="mt-2 font-display text-3xl font-bold uppercase leading-none text-white">
              anos de experiência
            </p>
            <div className="mt-8 flex items-center justify-center gap-3 border-t border-white/10 pt-6 text-sm leading-6 text-white/55">
              <MapPin size={18} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
              {siteConfig.location.serviceArea}
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="Direção Segura"
              title="Mais do que ensinar comandos, acompanhar o processo."
              description="Luciano trabalha com candidatos e pessoas habilitadas em momentos diferentes da direção. A proposta é entender a necessidade real do aluno e organizar o treinamento com clareza."
            />
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/55">
              A experiência em sala de aula também apoia a mentoria teórica,
              enquanto a atuação prática atende carro, moto, preparação para
              exame e retomada de quem já possui CNH.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {principles.map((principle) => (
                <li
                  key={principle}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm leading-6 text-white/65"
                >
                  <Check size={17} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
                  {principle}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <ContactCta
        title="Conte a Luciano em que momento você está."
        description="Uma conversa direta ajuda a entender o serviço mais adequado e verificar a disponibilidade."
        whatsappMessage={whatsappMessages.general}
        secondaryHref="/aulas"
        secondaryLabel="Conhecer as aulas"
      />
    </>
  );
}
