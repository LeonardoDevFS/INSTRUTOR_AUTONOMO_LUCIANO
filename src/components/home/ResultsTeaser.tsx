import { ArrowRight } from "lucide-react";
import Image from "next/image";

import { ActionLink } from "@/components/ui/ActionLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteMedia } from "@/data/media";

export function ResultsTeaser() {
  return (
    <section
      id="resultados"
      aria-labelledby="results-title"
      className="py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-surface to-black">
          <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-16 lg:p-14">
            <div>
              <SectionHeading
                id="results-title"
                eyebrow="Resultados reais"
                title="Cada conquista merece ser contada do jeito certo."
                description="Resultados e relatos só entram na comunicação quando são reais e autorizados, sem percentuais inventados ou promessas de aprovação."
              />
              <ActionLink
                href="/resultados"
                variant="text"
                icon={<ArrowRight size={17} aria-hidden="true" />}
                className="mt-7"
              >
                Ver mais conquistas
              </ActionLink>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {siteMedia.results.map((result) => (
                <div
                  key={result.src}
                  className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-black"
                >
                  <Image
                    src={result.src}
                    alt={result.alt}
                    fill
                    sizes="(min-width: 1280px) 14vw, (min-width: 640px) 30vw, 31vw"
                    className="object-contain transition duration-500 hover:scale-[1.02]"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        </div>
      </div>
    </section>
  );
}
