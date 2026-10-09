import type { Metadata } from "next";
import { Camera, MessageSquareQuote, ShieldCheck } from "lucide-react";
import Image from "next/image";

import { ContactCta } from "@/components/sections/ContactCta";
import { PageHero } from "@/components/sections/PageHero";
import { PhotoEffects } from "@/components/ui/PhotoEffects";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteMedia } from "@/data/media";
import { whatsappMessages } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Resultados Reais",
  description:
    "Veja registros de conquistas e um depoimento compartilhado pela Direção Segura em Itajubá/MG.",
  alternates: { canonical: "/resultados" },
};

const resultTypes = [
  {
    icon: Camera,
    title: "Fotos autorizadas",
    description: "A galeria utiliza os registros que foram enviados para publicação no projeto.",
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
        placeholderTitle="Conquistas reais"
        placeholderDescription="Registros de alunos compartilhados pela Direção Segura."
        imageSrc={siteMedia.results[0].src}
        imageAlt={siteMedia.results[0].alt}
        imagePosition="center center"
        imageFit="contain"
      />

      <section className="py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="Galeria de conquistas"
            title="Pessoas diferentes. Objetivos conquistados com dedicação."
            description="Os materiais abaixo foram adicionados ao projeto para apresentar momentos da trajetória da Direção Segura."
            align="center"
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
            {siteMedia.results.map((result, index) => (
              <figure
                key={result.src}
                className="relative aspect-[4/5] rounded-[2rem]"
              >
                <PhotoEffects
                  variant="card"
                  reveal
                  revealDelay={index * 75}
                  className="h-full rounded-[2rem] bg-black"
                >
                  <Image
                    src={result.src}
                    alt={result.alt}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 48vw, 100vw"
                    className="photo-effects__media object-contain"
                  />
                </PhotoEffects>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-surface py-20 sm:py-24 lg:py-28">
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
