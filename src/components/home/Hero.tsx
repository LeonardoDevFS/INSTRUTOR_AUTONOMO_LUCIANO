import {
  ArrowRight,
  CalendarDays,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

import { siteConfig } from "@/config/site";
import { createWhatsAppUrl, whatsappMessages } from "@/lib/whatsapp";

import { ActionLink } from "./ActionLink";
import { MediaPlaceholder } from "./MediaPlaceholder";

const heroStats = [
  {
    value: `${siteConfig.experienceYears}+`,
    label: "anos de experiência",
  },
  {
    value: siteConfig.categories.join(" + "),
    label: "categorias",
  },
  {
    value: `${siteConfig.lesson.durationMinutes} min`,
    label: "por hora/aula",
  },
  {
    value: siteConfig.location.city,
    label: "e região",
  },
] as const;

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-screen items-center overflow-hidden border-b border-white/10 pt-20"
    >
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[#070707]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_75%_32%,rgba(229,185,63,0.18),transparent_30%),radial-gradient(circle_at_10%_80%,rgba(229,185,63,0.08),transparent_25%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-black/70 to-transparent" />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:py-24">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/[0.07] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-gold sm:tracking-[0.28em]">
            <ShieldCheck size={16} aria-hidden="true" />
            {siteConfig.profession} em {siteConfig.location.city}/
            {siteConfig.location.state}
          </div>

          <h1
            id="hero-title"
            className="mt-7 text-balance font-display text-6xl font-extrabold uppercase leading-[0.86] tracking-[-0.03em] text-white sm:text-7xl lg:text-[6.6rem]"
          >
            Mais que dirigir,
            <span className="mt-2 block text-gold">é evoluir.</span>
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-7 text-white/60 sm:text-lg sm:leading-8">
            Aulas de carro e moto, preparação para habilitação, treinamento
            para habilitados e mentoria teórica com {siteConfig.name} em{" "}
            {siteConfig.location.city}/MG.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ActionLink
              href="/agendar"
              icon={<CalendarDays size={18} aria-hidden="true" />}
              className="sm:px-8"
            >
              Agendar minha aula
            </ActionLink>
            <ActionLink
              href={createWhatsAppUrl(whatsappMessages.general)}
              external
              variant="secondary"
              icon={<MessageCircle size={18} aria-hidden="true" />}
              ariaLabel="Falar com Luciano pelo WhatsApp"
              className="sm:px-8"
            >
              Falar com Luciano
            </ActionLink>
          </div>

          <a
            href="#objetivos"
            className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-white/45 transition hover:text-gold"
          >
            Encontre o treinamento ideal
            <ArrowRight size={16} aria-hidden="true" />
          </a>

          <dl className="mt-12 grid grid-cols-2 gap-x-5 gap-y-7 border-t border-white/10 pt-7 sm:grid-cols-4">
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-xs leading-5 text-white/40">{stat.label}</dt>
                <dd className="order-first font-display text-2xl font-extrabold uppercase text-white sm:text-3xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <MediaPlaceholder
          title="Luciano, carro e moto"
          description="Espaço reservado para a foto principal original da Direção Segura."
          className="min-h-[29rem] lg:min-h-[39rem]"
        />
      </div>
    </section>
  );
}
