import type { Metadata } from "next";
import { AtSign, Clock3, CreditCard, MapPin, MessageCircle } from "lucide-react";
import type { ReactNode } from "react";

import { PageHero } from "@/components/sections/PageHero";
import { ActionLink } from "@/components/ui/ActionLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/config/site";
import { siteMedia } from "@/data/media";
import { formatScheduleRange } from "@/lib/utils";
import { createWhatsAppUrl, whatsappMessages } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Fale com Luciano Oliveira pelo WhatsApp ou Instagram e consulte horários para aulas de direção em Itajubá/MG e região.",
  alternates: { canonical: "/contato" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contato"
        title="Fale diretamente com Luciano."
        description="Explique seu objetivo, tire dúvidas e consulte a disponibilidade de horários para o treinamento."
        backHref="/"
        backLabel="Voltar ao início"
        whatsappMessage={whatsappMessages.general}
        placeholderTitle="Luciano Oliveira"
        placeholderDescription="Atendimento direto com o Instrutor Autônomo da Direção Segura."
        imageSrc={siteMedia.hero.src}
        imageAlt={siteMedia.hero.alt}
        imagePosition={siteMedia.hero.objectPosition}
      />

      <section className="py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="Canais e informações"
            title="Tudo o que você precisa para começar a conversa."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4 lg:mt-14">
            <ContactCard
              icon={<MessageCircle aria-hidden="true" />}
              title="WhatsApp"
              description={siteConfig.contact.phoneDisplay}
            >
              <ActionLink
                href={createWhatsAppUrl(whatsappMessages.general)}
                external
                variant="text"
                ariaLabel="Falar com Luciano pelo WhatsApp"
              >
                Iniciar conversa
              </ActionLink>
            </ContactCard>
            <ContactCard
              icon={<AtSign aria-hidden="true" />}
              title="Instagram"
              description={siteConfig.contact.instagramUsername}
            >
              <ActionLink
                href={siteConfig.contact.instagramUrl}
                external
                variant="text"
                ariaLabel="Abrir Instagram de Luciano"
              >
                Ver perfil
              </ActionLink>
            </ContactCard>
            <ContactCard
              icon={<Clock3 aria-hidden="true" />}
              title="Horários"
              description={`${formatScheduleRange(
                siteConfig.schedule.weekdays.opening,
                siteConfig.schedule.weekdays.closing,
              )} nos dias úteis`}
            />
            <ContactCard
              icon={<MapPin aria-hidden="true" />}
              title="Atendimento"
              description={siteConfig.location.serviceArea}
            />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-surface p-7 sm:p-8">
              <h2 className="font-display text-3xl font-extrabold uppercase text-white">
                Agenda de atendimento
              </h2>
              <dl className="mt-7 space-y-4 text-sm">
                <ScheduleRow
                  label={siteConfig.schedule.weekdays.label}
                  value={formatScheduleRange(
                    siteConfig.schedule.weekdays.opening,
                    siteConfig.schedule.weekdays.closing,
                  )}
                />
                <ScheduleRow
                  label={siteConfig.schedule.saturday.label}
                  value={formatScheduleRange(
                    siteConfig.schedule.saturday.opening,
                    siteConfig.schedule.saturday.closing,
                  )}
                />
                <ScheduleRow label="Domingo" value="Mediante consulta" />
              </dl>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-surface p-7 sm:p-8">
              <CreditCard size={27} className="text-gold" aria-hidden="true" />
              <h2 className="mt-6 font-display text-3xl font-extrabold uppercase text-white">
                Formas de pagamento
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/50">
                Dinheiro, PIX, débito e crédito. Parcelamento em até{" "}
                {siteConfig.payment.interestFreeInstallments}x sem juros ou até{" "}
                {siteConfig.payment.maxInstallmentsWithInterest}x com juros.
                Os valores das aulas são informados diretamente no contato.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ContactCard({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <article className="flex min-h-64 flex-col rounded-[2rem] border border-white/10 bg-surface p-6">
      <div className="text-gold">{icon}</div>
      <h2 className="mt-7 font-display text-2xl font-extrabold uppercase text-white">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-white/50">{description}</p>
      {children && <div className="mt-auto pt-5">{children}</div>}
    </article>
  );
}

function ScheduleRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0">
      <dt className="text-white/45">{label}</dt>
      <dd className="font-bold text-white/75">{value}</dd>
    </div>
  );
}
