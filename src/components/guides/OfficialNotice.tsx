import { ExternalLink, Info } from "lucide-react";

type OfficialNoticeProps = {
  source: {
    title: string;
    url: string;
    officialUpdatedAt: string;
  };
};

export function OfficialNotice({ source }: OfficialNoticeProps) {
  return (
    <aside className="rounded-3xl border border-gold/25 bg-gold/[0.07] p-6 sm:p-7">
      <Info size={22} className="text-gold" aria-hidden="true" />
      <h2 className="mt-5 font-display text-2xl font-bold uppercase text-white">
        Confirme antes de iniciar
      </h2>
      <p className="mt-3 text-sm leading-7 text-white/60">
        Regras, formulários, taxas e procedimentos podem mudar. Este guia
        resume a página oficial consultada, mas o Portal MG deve prevalecer no
        momento da solicitação.
      </p>
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-gold hover:text-gold-light"
      >
        Abrir {source.title}
        <ExternalLink size={15} aria-hidden="true" />
      </a>
    </aside>
  );
}
