import { BadgeCheck, ExternalLink, MessageSquareQuote, ShieldCheck } from "lucide-react";
import Image from "next/image";

import { ContactCta } from "@/components/sections/ContactCta";
import { PageHero } from "@/components/sections/PageHero";
import { ActionLink } from "@/components/ui/ActionLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/config/site";
import { siteMedia } from "@/data/media";
import { createPageMetadata } from "@/lib/seo/metadata";
import { whatsappMessages } from "@/lib/whatsapp";

export const metadata = createPageMetadata({
  title: "Resultados Reais",
  description:
    "Veja registros de conquistas e um depoimento compartilhado pela Direção Segura em Itajubá/MG.",
  canonical: "/resultados",
});

const resultTypes = [
  {
    icon: BadgeCheck,
    title: "Conquistas autorizadas",
    description: "Resultados só entram na comunicação quando existe material real e autorização para publicação.",
  },
  {
    icon: MessageSquareQuote,
    title: "Depoimentos reais",
    description: "Relatos só serão apresentados a partir de materiais reais fornecidos à Direção Segura.",
  },
  {
    icon: ShieldCheck,
    title: "Sem números inventados",
    description: "A página não utiliza percentuais de aprovação ou quantidades de alunos sem comprovação.",
  },
] as const;

export default function ResultsPage() {
  return (
    <>
      <PageHero
        eyebrow="Resultados reais"
        title="Conquistas que fazem parte da história da Direção Segura."
        description="Registros compartilhados por Luciano para celebrar alunos e mostrar o trabalho sem recorrer a números ou avaliações inventadas."
        backHref="/"
        backLabel="Voltar ao início"
        whatsappMessage={whatsappMessages.general}
      />

      <section className="py-20 sm:py-24 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-end lg:gap-20 lg:px-8">
          <SectionHeading
            eyebrow="Conquistas com contexto"
            title="Cada evolução pertence primeiro ao aluno."
            description="A Direção Segura trata resultados com respeito: sem transformar histórias individuais em garantia de aprovação e sem usar números que não possam ser comprovados."
          />
          <div className="border-l-2 border-gold pl-6 sm:pl-8">
            <p className="font-display text-4xl font-extrabold uppercase leading-[0.95] text-white sm:text-5xl">
              Trabalho sério, acompanhamento individual e comunicação responsável.
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
              Avaliações públicas e relatos autorizados ajudam a conhecer o trabalho sem substituir uma conversa sobre o seu próprio objetivo.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-surface py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="Galeria de conquistas"
            title="Pessoas diferentes. Objetivos conquistados com dedicação."
            description="Registros reais compartilhados pela Direção Segura e autorizados para apresentação no projeto."
            align="center"
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
            {siteMedia.results.map((result) => (
              <figure
                key={result.src}
                className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 bg-black"
              >
                <Image
                  src={result.src}
                  alt={result.alt}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 48vw, 100vw"
                  className="object-contain transition duration-500 hover:scale-[1.015]"
                />
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="Compromisso editorial"
            title="Resultados apresentados com responsabilidade."
            description="A página utiliza somente os materiais recebidos e não publica taxas de aprovação ou quantidades sem comprovação."
            align="center"
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3 lg:mt-14">
            {resultTypes.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-[2rem] border border-dashed border-white/15 bg-surface p-7"
              >
                <Icon size={26} className="text-gold" aria-hidden="true" />
                <h2 className="mt-8 font-display text-2xl font-extrabold uppercase leading-none text-white">
                  {title}
                </h2>
                <p className="mt-4 text-sm leading-6 text-white/50">
                  {description}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <ActionLink
              href={siteConfig.contact.googleMapsUrl}
              external
              variant="secondary"
              icon={<ExternalLink size={16} aria-hidden="true" />}
              ariaLabel="Confira as avaliações de Luciano no Google Maps (abre em nova guia)"
            >
              Confira nossas avaliações no Google
            </ActionLink>
          </div>
        </div>
      </section>

      <ContactCta
        title="Quer conhecer o trabalho antes de marcar?"
        description="Fale diretamente com Luciano para explicar seu objetivo e tirar dúvidas sobre o treinamento."
        whatsappMessage={whatsappMessages.general}
        secondaryHref="/aulas"
        secondaryLabel="Conhecer as aulas"
      />
    </>
  );
}
