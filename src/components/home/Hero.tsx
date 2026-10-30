import {
  ArrowRight,
  CalendarDays,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

import { siteConfig } from "@/config/site";
import { createWhatsAppUrl, whatsappMessages } from "@/lib/whatsapp";

import { ActionLink } from "@/components/ui/ActionLink";

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
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden border-b border-white/10 pt-20"
    >
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[#070707]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_18%,rgba(229,185,63,0.14),transparent_27%),radial-gradient(circle_at_8%_82%,rgba(229,185,63,0.07),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="pointer-events-none absolute -bottom-36 left-[62%] -z-10 h-[34rem] w-40 rotate-[18deg] border-x border-gold/10 bg-gold/[0.025]" />

      <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:py-18 lg:px-8 lg:py-20">
        <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-gold/25 bg-gold/[0.07] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-gold sm:text-xs sm:tracking-[0.22em]">
          <ShieldCheck size={16} aria-hidden="true" />
          <span className="min-w-0 text-balance">
            {siteConfig.name} — {siteConfig.brand}
          </span>
        </div>

        <div className="mt-8 grid min-w-0 gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)] lg:items-end lg:gap-16">
          <div className="min-w-0">
          <h1
            id="hero-title"
            className="max-w-4xl font-display text-[clamp(3rem,14vw,5.5rem)] font-extrabold uppercase leading-[0.86] tracking-[-0.04em] text-white lg:text-[7rem]"
          >
            <span className="block">Instrutor</span>{" "}
            <span className="block">Autônomo</span>{" "}
            <span className="mt-2 block text-gold">em Itajubá MG</span>
          </h1>
          </div>

          <div className="min-w-0 border-l-2 border-gold pl-5 sm:pl-7">
            <p className="font-display text-2xl font-bold italic leading-tight tracking-wide text-gold-light sm:text-3xl">
              {siteConfig.slogan}
            </p>

            <p className="mt-6 max-w-xl text-base leading-7 text-white/60 sm:text-lg sm:leading-8">
              Aulas de carro e moto, preparação para habilitação, treinamento
              para habilitados e mentoria teórica em {siteConfig.location.city}/MG.
            </p>

            <div className="mt-8 flex flex-col gap-3 2xl:flex-row">
              <ActionLink
                href="/agendar"
                icon={<CalendarDays size={18} aria-hidden="true" />}
                className="2xl:px-7"
              >
                Agendar minha aula
              </ActionLink>
              <ActionLink
                href={createWhatsAppUrl(whatsappMessages.general)}
                external
                variant="secondary"
                icon={<MessageCircle size={18} aria-hidden="true" />}
                ariaLabel="Falar com Luciano pelo WhatsApp"
                className="2xl:px-7"
              >
                Falar com Luciano
              </ActionLink>
            </div>

            <a
              href="#objetivos"
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-white/55 transition hover:text-gold"
            >
              Encontre o treinamento ideal
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>

        <dl className="mt-12 grid grid-cols-2 gap-x-5 gap-y-7 border-t border-white/10 pt-7 sm:grid-cols-4 lg:mt-14">
          {heroStats.map((stat) => (
            <div key={stat.label} className="border-l border-white/10 pl-4 sm:pl-6">
              <dd className="font-display text-3xl font-extrabold uppercase text-white sm:text-4xl">
                {stat.value}
              </dd>
              <dt className="mt-1 text-xs leading-5 text-white/45">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
