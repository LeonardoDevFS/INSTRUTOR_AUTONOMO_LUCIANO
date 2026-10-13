import { Accessibility, ExternalLink, MessageCircle, ShieldCheck } from "lucide-react";

import { ActionLink } from "@/components/ui/ActionLink";
import { officialGuideSources } from "@/data/guide-pages";
import { createWhatsAppUrl, whatsappMessages } from "@/lib/whatsapp";

const guidanceSteps = [
  {
    title: "Consulte o fluxo específico",
    description: "O Portal MG reúne documentos, avaliações e orientações próprias da primeira habilitação para PcD.",
  },
  {
    title: "Aguarde a avaliação oficial",
    description: "Conforme o caso, podem ser solicitados laudo e avaliação complementar para definir restrições ou recursos necessários.",
  },
  {
    title: "Confira o veículo antes das aulas",
    description: "Se houver indicação de adaptação, confirme as características exigidas antes de contratar ou iniciar o treinamento.",
  },
] as const;

export function PcdGuidance() {
  return (
    <section aria-labelledby="pcd-guidance-title" className="pb-16 sm:pb-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-gold/25 bg-gold/[0.055] p-6 sm:p-9 lg:p-10">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3 text-gold">
              <Accessibility size={28} aria-hidden="true" />
              <span className="text-xs font-extrabold uppercase tracking-[0.22em]">Orientação específica e acolhedora</span>
            </div>
            <h2 id="pcd-guidance-title" className="mt-5 max-w-4xl text-balance font-display text-3xl font-extrabold uppercase leading-tight text-white sm:text-4xl lg:text-5xl">
              Primeira habilitação para pessoa com deficiência (PcD)
            </h2>
            <p className="mt-5 max-w-4xl text-sm leading-7 text-white/65 sm:text-base">
              O processo pode incluir avaliações específicas e documentos ou laudos adicionais, conforme a condição apresentada e a análise do órgão competente. Consulte o procedimento oficial antes de iniciar para saber quais etapas se aplicam ao seu caso.
            </p>

            <ol className="mt-8 grid gap-4 md:grid-cols-3">
              {guidanceSteps.map((item, index) => (
                <li key={item.title} className="rounded-2xl border border-white/10 bg-black/30 p-5">
                  <span className="text-xs font-extrabold text-gold">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 text-base font-extrabold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">{item.description}</p>
                </li>
              ))}
            </ol>

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/10 bg-black/25 p-5">
              <ShieldCheck size={20} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
              <p className="text-sm leading-7 text-white/60">
                <strong className="text-white">Nem toda pessoa com deficiência precisa de veículo adaptado.</strong> A necessidade e as características de uma adaptação dependem da avaliação oficial. Luciano pode conversar para entender a necessidade e verificar a possibilidade de atendimento, mas o contato não confirma veículo adaptado nem garante disponibilidade.
              </p>
            </div>

            <p className="mt-5 text-xs leading-6 text-white/45">
              Para preservar sua privacidade, não envie laudos nem detalhes médicos pelo site. Apresente documentos sensíveis somente nos canais oficiais responsáveis.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ActionLink
                href={officialGuideSources.firstLicensePcd.url}
                external
                icon={<ExternalLink size={17} aria-hidden="true" />}
                ariaLabel="Ver procedimento oficial de primeira habilitação para pessoa com deficiência no Portal MG (abre em nova guia)"
              >
                Ver procedimento PcD
              </ActionLink>
              <ActionLink
                href={createWhatsAppUrl(whatsappMessages.pcdGuidance)}
                external
                variant="secondary"
                icon={<MessageCircle size={17} aria-hidden="true" />}
                ariaLabel="Conversar com Luciano pelo WhatsApp sobre veículo adequado ou adaptado (abre em nova guia)"
              >
                Precisa de um veículo adaptado? Converse com Luciano
              </ActionLink>
            </div>
            <p className="mt-3 text-xs text-white/40">O primeiro botão abre um site governamental em uma nova guia.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
