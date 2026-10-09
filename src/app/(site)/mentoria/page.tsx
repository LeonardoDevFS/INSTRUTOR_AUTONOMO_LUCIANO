import type { Metadata } from "next";
import { Check, MonitorPlay, Users } from "lucide-react";
import type { ReactNode } from "react";

import { ContactCta } from "@/components/sections/ContactCta";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { mentorshipTopics } from "@/data/home";
import { siteMedia } from "@/data/media";
import { whatsappMessages } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Mentoria Teórica para CNH",
  description:
    "Mentoria teórica online com Luciano Oliveira para candidatos à habilitação. Atendimento atualmente gratuito e presencial sob disponibilidade.",
  alternates: { canonical: "/mentoria" },
};

export default function MentorshipPage() {
  return (
    <>
      <PageHero
        eyebrow="Mentoria teórica"
        title="Orientação para entender a teoria e estudar com mais clareza."
        description="Apoio online para organizar os estudos, esclarecer dúvidas e revisar os temas da etapa teórica da habilitação."
        backHref="/"
        backLabel="Voltar ao início"
        whatsappMessage={whatsappMessages.mentorship}
        placeholderTitle="Mentoria com Luciano"
        placeholderDescription="Espaço reservado para uma fotografia original ou registro autorizado da mentoria."
        imageSrc={siteMedia.mentorship.src}
        imageAlt={siteMedia.mentorship.alt}
        imagePosition={siteMedia.mentorship.objectPosition}
        badge="Atualmente gratuita"
      />

      <section className="py-20 sm:py-24 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-8">
          <div>
            <SectionHeading
              eyebrow="Experiência em sala"
              title="Dúvidas explicadas de forma direta e organizada."
              description="A experiência anterior de Luciano como instrutor de sala ajuda a transformar temas teóricos em explicações mais claras para cada candidato."
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <FormatCard
                icon={<MonitorPlay aria-hidden="true" />}
                title="Online"
                description="Formato principal da mentoria atual."
              />
              <FormatCard
                icon={<Users aria-hidden="true" />}
                title="Presencial"
                description="Pode ser combinado conforme disponibilidade."
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-surface p-6 sm:p-8">
            <h2 className="font-display text-3xl font-extrabold uppercase text-white">
              Temas que podem ser trabalhados
            </h2>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {mentorshipTopics.map((topic) => (
                <li
                  key={topic}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm font-semibold text-white/65"
                >
                  <Check size={16} className="shrink-0 text-gold" aria-hidden="true" />
                  {topic}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <ContactCta
        title="Precisa de ajuda para organizar seus estudos?"
        description="Explique sua dúvida e combine diretamente com Luciano o formato e a disponibilidade da mentoria."
        whatsappMessage={whatsappMessages.mentorship}
      />
    </>
  );
}

function FormatCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <div className="text-gold">{icon}</div>
      <h3 className="mt-5 font-display text-2xl font-bold uppercase text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-white/45">{description}</p>
    </article>
  );
}
