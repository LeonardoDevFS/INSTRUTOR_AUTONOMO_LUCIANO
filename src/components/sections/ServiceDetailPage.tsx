import { Check, Clock3, MapPin } from "lucide-react";
import type { ReactNode } from "react";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/config/site";
import type { ServicePageContent } from "@/data/service-pages";
import { formatScheduleRange } from "@/lib/utils";

import { ContactCta } from "./ContactCta";
import { PageHero } from "./PageHero";

type ServiceDetailPageProps = {
  content: ServicePageContent;
};

export function ServiceDetailPage({ content }: ServiceDetailPageProps) {
  const meetingPoint =
    content.meetingType === "exam"
      ? siteConfig.location.examMeeting
      : siteConfig.location.beginnerMeeting;

  return (
    <>
      <PageHero
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.description}
        backHref="/aulas"
        backLabel="Todas as aulas"
        whatsappMessage={content.whatsappMessage}
        placeholderTitle={content.placeholderTitle}
        placeholderDescription={content.placeholderDescription}
        imageSrc={content.imageSrc}
        imageAlt={content.imageAlt}
        imagePosition={content.imagePosition}
        badge={content.category ? `Categoria ${content.category}` : undefined}
      />

      <section className="py-20 sm:py-24 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-8">
          <SectionHeading
            eyebrow="Atendimento individual"
            title={content.introTitle}
          />
          <div className="space-y-5 text-base leading-8 text-white/60">
            {content.introParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-surface py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 lg:grid-cols-2 lg:px-8">
          <ListCard title={content.idealForTitle} items={content.idealFor} />
          <ListCard title={content.trainingTitle} items={content.trainingItems} />
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="Informações práticas"
            title="Tudo combinado com clareza antes da aula."
            description="Horários, ponto de encontro e frequência são alinhados diretamente com o aluno."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <InfoCard
              icon={<Clock3 aria-hidden="true" />}
              title={`${siteConfig.lesson.durationMinutes} minutos`}
              description="Duração de cada hora/aula."
            />
            <InfoCard
              icon={<Clock3 aria-hidden="true" />}
              title={formatScheduleRange(
                siteConfig.schedule.weekdays.opening,
                siteConfig.schedule.weekdays.closing,
              )}
              description="Atendimento de segunda a sexta; sábado até 13h e domingo sob consulta."
            />
            <InfoCard
              icon={<MapPin aria-hidden="true" />}
              title="Ponto combinado"
              description={meetingPoint}
            />
          </div>
        </div>
      </section>

      <ContactCta
        title="Conte seu objetivo e verifique a disponibilidade."
        description="Luciano pode entender sua necessidade e orientar o próximo passo antes de confirmar a aula."
        whatsappMessage={content.whatsappMessage}
        secondaryHref="/contato"
        secondaryLabel="Ver contato e horários"
      />
    </>
  );
}

function ListCard({
  title,
  items,
}: {
  title: string;
  items: readonly string[];
}) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-black/35 p-6 sm:p-8">
      <h2 className="font-display text-3xl font-extrabold uppercase leading-none text-white">
        {title}
      </h2>
      <ul className="mt-7 space-y-4">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm leading-6 text-white/60">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
              <Check size={14} aria-hidden="true" />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-surface p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/10 text-gold">
        {icon}
      </div>
      <h3 className="mt-6 font-display text-2xl font-bold uppercase text-white">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-white/50">{description}</p>
    </article>
  );
}
