import { ArrowRight, Check, HeartHandshake, MessageCircle } from "lucide-react";

import { licensedTrainingTopics } from "@/data/home";
import { createWhatsAppUrl, whatsappMessages } from "@/lib/whatsapp";

import { ActionLink } from "@/components/ui/ActionLink";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function LicensedDriversSection() {
  return (
    <section
      aria-labelledby="licensed-title"
      className="relative overflow-hidden border-y border-white/10 bg-surface py-20 sm:py-24 lg:py-28"
    >
      <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_70%_50%,rgba(229,185,63,0.1),transparent_45%)]" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-20 lg:px-8">
        <div>
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 text-gold">
            <HeartHandshake size={27} aria-hidden="true" />
          </div>
          <SectionHeading
            id="licensed-title"
            eyebrow="Para quem já tem CNH"
            title="Insegurança não precisa ser motivo para desistir de dirigir."
            description="Sem julgamentos e sem promessas de prazo. O treinamento é gradual, personalizado e construído a partir das situações que você precisa enfrentar no dia a dia."
          />

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ActionLink
              href={createWhatsAppUrl(whatsappMessages.licensed)}
              external
              icon={<MessageCircle size={18} aria-hidden="true" />}
              ariaLabel="Conversar sem compromisso sobre treinamento para habilitados pelo WhatsApp"
            >
              Conversar sem compromisso
            </ActionLink>
            <ActionLink
              href="/guias/medo-de-dirigir"
              variant="text"
              icon={<ArrowRight size={17} aria-hidden="true" />}
            >
              Ler o guia
            </ActionLink>
          </div>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {licensedTrainingTopics.map((topic) => (
            <li
              key={topic}
              className="flex min-h-20 items-center gap-4 rounded-2xl border border-white/10 bg-black/35 p-5 text-sm font-semibold text-white/70"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold text-black">
                <Check size={16} strokeWidth={3} aria-hidden="true" />
              </span>
              {topic}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
