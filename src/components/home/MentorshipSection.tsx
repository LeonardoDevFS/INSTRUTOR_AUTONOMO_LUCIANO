import {
  ArrowRight,
  BookOpenCheck,
  MessageCircle,
  MonitorPlay,
  Users,
} from "lucide-react";

import { siteConfig } from "@/config/site";
import { mentorshipTopics } from "@/data/home";
import { createWhatsAppUrl, whatsappMessages } from "@/lib/whatsapp";

import { ActionLink } from "./ActionLink";
import { SectionHeading } from "./SectionHeading";

export function MentorshipSection() {
  return (
    <section
      id="mentoria"
      aria-labelledby="mentorship-title"
      className="border-y border-white/10 bg-surface py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-20 lg:px-8">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-gold">
            <BookOpenCheck size={16} aria-hidden="true" />
            Atualmente gratuita
          </div>
          <SectionHeading
            id="mentorship-title"
            eyebrow="Mentoria teórica"
            title="Entenda a matéria, não apenas decore."
            description="Com experiência anterior como instrutor de sala, Luciano ajuda você a organizar os estudos, esclarecer dúvidas e chegar mais preparado à etapa teórica."
          />

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-sm text-white/65">
              <MonitorPlay size={16} className="text-gold" aria-hidden="true" />
              Atendimento online
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-sm text-white/65">
              <Users size={16} className="text-gold" aria-hidden="true" />
              Presencial sob disponibilidade
            </span>
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ActionLink
              href={createWhatsAppUrl(whatsappMessages.mentorship)}
              external
              icon={<MessageCircle size={18} aria-hidden="true" />}
              ariaLabel="Conversar com Luciano sobre a mentoria pelo WhatsApp"
            >
              Quero saber mais
            </ActionLink>
            <ActionLink
              href="/mentoria"
              variant="text"
              icon={<ArrowRight size={17} aria-hidden="true" />}
            >
              Conhecer a mentoria
            </ActionLink>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/45 p-6 sm:p-8">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-gold/10 blur-3xl" />
          <p className="relative text-xs font-extrabold uppercase tracking-[0.24em] text-white/40">
            Temas que podem ser trabalhados
          </p>
          <ul className="relative mt-6 grid gap-3 sm:grid-cols-2">
            {mentorshipTopics.map((topic, index) => (
              <li
                key={topic}
                className="flex min-h-20 items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4"
              >
                <span className="font-display text-xl font-extrabold text-gold/55">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-semibold text-white/75">{topic}</span>
              </li>
            ))}
          </ul>
          <p className="relative mt-6 text-xs leading-5 text-white/35">
            Formato e disponibilidade são confirmados diretamente com{" "}
            {siteConfig.name}.
          </p>
        </div>
      </div>
    </section>
  );
}
