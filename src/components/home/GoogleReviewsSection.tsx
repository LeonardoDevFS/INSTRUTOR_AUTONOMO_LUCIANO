import { ExternalLink, MapPinned, MessageSquareHeart } from "lucide-react";

import { ActionLink } from "@/components/ui/ActionLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/config/site";

export function GoogleReviewsSection() {
  const hasDirectReviewUrl = Boolean(siteConfig.contact.googleReviewUrl);
  const reviewUrl =
    siteConfig.contact.googleReviewUrl ?? siteConfig.contact.googleMapsUrl;

  return (
    <section
      id="avaliacoes-google"
      aria-labelledby="google-reviews-title"
      className="border-y border-white/10 bg-surface py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="relative isolate overflow-hidden rounded-[2rem] border border-gold/25 bg-black p-7 sm:p-10 lg:p-14">
          <div
            className="pointer-events-none absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-gold/15 blur-3xl"
            aria-hidden="true"
          />

          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.72fr)] lg:gap-16">
            <div>
              <SectionHeading
                id="google-reviews-title"
                eyebrow="Avaliações no Google"
                title="Sua experiência faz a diferença."
                description={`Já teve aulas com ${siteConfig.name}? Compartilhe sua experiência no Google. Sua avaliação ajuda outras pessoas de ${siteConfig.location.serviceArea} a conhecerem o trabalho da Direção Segura.`}
              />

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ActionLink
                  href={reviewUrl}
                  external
                  icon={<ExternalLink size={17} aria-hidden="true" />}
                  ariaLabel="Avaliar Luciano no Google (abre em nova guia)"
                >
                  Avaliar Luciano no Google
                </ActionLink>
                <ActionLink
                  href={siteConfig.contact.googleMapsUrl}
                  external
                  variant="secondary"
                  icon={<MapPinned size={17} aria-hidden="true" />}
                  ariaLabel="Ver perfil de Luciano no Google Maps (abre em nova guia)"
                >
                  Ver perfil no Google Maps
                </ActionLink>
              </div>

              {!hasDirectReviewUrl && (
                <p className="mt-4 max-w-2xl text-xs leading-6 text-white/45">
                  O perfil será aberto no Google Maps. Para compartilhar seu
                  relato, acesse a seção “Avaliações”.
                </p>
              )}
            </div>

            <aside className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
              <MessageSquareHeart
                size={30}
                className="text-gold"
                aria-hidden="true"
              />
              <h3 className="mt-6 font-display text-3xl font-extrabold uppercase leading-none text-white">
                Um relato verdadeiro ajuda quem está começando.
              </h3>
              <p className="mt-4 text-sm leading-7 text-white/55">
                Conte como foi sua experiência com clareza e autenticidade. Não
                é necessário publicar dados pessoais ou informações sensíveis.
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-6 text-sm font-bold text-white/70">
                <MapPinned size={18} className="text-gold" aria-hidden="true" />
                Perfil oficial de Luciano Oliveira no Google Maps
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
