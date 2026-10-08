import type { Metadata } from "next";
import { Camera, MessageSquareQuote, ShieldCheck } from "lucide-react";

import { ContactCta } from "@/components/sections/ContactCta";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { whatsappMessages } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Resultados Reais",
  description:
    "Espaço da Direção Segura destinado a fotos autorizadas, depoimentos reais e avaliações verificáveis de alunos.",
  alternates: { canonical: "/resultados" },
};

const resultTypes = [
  {
    icon: Camera,
    title: "Fotos autorizadas",
    description: "Registros reais de alunos serão publicados somente com autorização apropriada.",
  },
  {
    icon: MessageSquareQuote,
    title: "Depoimentos reais",
    description: "Relatos serão incluídos quando houver conteúdo confirmado e consentimento para publicação.",
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
        title="Conquistas apresentadas com autorização e transparência."
        description="Esta página está preparada para receber histórias, fotos e avaliações reais da Direção Segura."
        backHref="/"
        backLabel="Voltar ao início"
        whatsappMessage={whatsappMessages.general}
        placeholderTitle="Resultados Direção Segura"
        placeholderDescription="O material de alunos será inserido somente após seleção e autorização."
      />

      <section className="py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="Compromisso editorial"
            title="Prova social só tem valor quando é verdadeira."
            description="Enquanto o material autorizado não está disponível, esta página permanece transparente sobre o que ainda será adicionado."
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
