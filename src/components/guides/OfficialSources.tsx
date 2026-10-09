import { ExternalLink, Info } from "lucide-react";

import type { OfficialSource } from "@/data/guide-pages";

export function OfficialSources({ sources }: { sources: readonly OfficialSource[] }) {
  return (
    <aside className="rounded-[2rem] border border-gold/25 bg-gold/[0.07] p-6 sm:p-7">
      <Info size={22} className="text-gold" aria-hidden="true" />
      <h2 className="mt-5 font-display text-2xl font-bold uppercase text-white">Conteúdo informativo</h2>
      <p className="mt-3 text-sm leading-7 text-white/60">Procedimentos, taxas e canais podem mudar. Confirme o seu caso nos órgãos responsáveis. Este site não possui vínculo institucional com o Detran-MG, o Contran ou o Governo Federal.</p>
      <ul className="mt-5 space-y-3">
        {sources.map((source) => (
          <li key={source.id}>
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 text-sm font-extrabold leading-6 text-gold hover:text-gold-light">
              <ExternalLink size={15} className="mt-1 shrink-0" aria-hidden="true" />
              <span>{source.shortTitle}{source.officialUpdatedAt ? <small className="block font-normal text-white/40">Página oficial atualizada em {source.officialUpdatedAt}</small> : null}</span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
