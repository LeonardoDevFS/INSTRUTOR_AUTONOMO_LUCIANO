import Link from "next/link";
import { AtSign, MessageCircle } from "lucide-react";

import { siteConfig } from "@/config/site";
import { formatScheduleRange } from "@/lib/utils";
import { createWhatsAppUrl } from "@/lib/whatsapp";

export function Footer() {
  const [brandLead, ...brandTail] = siteConfig.brand.split(" ");

  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="font-display text-2xl font-extrabold text-white">
              {brandLead}{" "}
              <span className="text-gold">{brandTail.join(" ")}</span>
            </div>

            <p className="mt-2 text-sm text-white/45">
              {siteConfig.slogan}
            </p>

            <p className="mt-5 max-w-sm text-sm leading-6 text-white/55">
              {siteConfig.name}, {siteConfig.profession.toLowerCase()} de carro e
              moto em {siteConfig.location.serviceArea}.
            </p>
          </div>

          <div>
            <p className="font-bold text-white">Contato</p>

            <div className="mt-5 flex flex-col gap-4 text-sm text-white/60">
              <a
                href={createWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-gold"
              >
                <MessageCircle size={17} />

                {siteConfig.contact.phoneDisplay}
              </a>

              <a
                href={siteConfig.contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-gold"
              >
                <AtSign size={17} />

                {siteConfig.contact.instagramUsername}
              </a>
            </div>
          </div>

          <div>
            <p className="font-bold text-white">Atendimento</p>

            <div className="mt-5 space-y-2 text-sm text-white/55">
              <p>
                {siteConfig.schedule.weekdays.label}:{" "}
                {formatScheduleRange(
                  siteConfig.schedule.weekdays.opening,
                  siteConfig.schedule.weekdays.closing,
                )}
              </p>
              <p>
                {siteConfig.schedule.saturday.label}:{" "}
                {formatScheduleRange(
                  siteConfig.schedule.saturday.opening,
                  siteConfig.schedule.saturday.closing,
                )}
              </p>
              <p>{siteConfig.schedule.sunday.label}: sob consulta</p>
              <p className="pt-2">{siteConfig.location.serviceArea}</p>
            </div>
          </div>
        </div>

        <div
          className="
            mt-12 flex flex-col gap-4
            border-t border-white/10 pt-7
            text-xs text-white/35
            sm:flex-row sm:items-center sm:justify-between
          "
        >
          <p>
            © {new Date().getFullYear()} {siteConfig.name} — {siteConfig.brand}.
          </p>

          <Link
            href="/politica-de-privacidade"
            className="hover:text-white"
          >
            Política de Privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
}
