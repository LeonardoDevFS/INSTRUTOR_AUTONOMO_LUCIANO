import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";

import { siteConfig } from "@/config/site";
import { createWhatsAppUrl, whatsappMessages } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Saiba como o site Direção Segura trata informações enviadas durante contatos e solicitações de horário.",
  alternates: { canonical: "/politica-de-privacidade" },
};

export default function PrivacyPolicyPage() {
  return (
    <article className="pt-20">
      <header className="border-b border-white/10 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-5 lg:px-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-gold">
            Transparência
          </p>
          <h1 className="mt-5 font-display text-5xl font-extrabold uppercase leading-none text-white sm:text-6xl">
            Política de Privacidade
          </h1>
          <p className="mt-6 text-sm text-white/40">
            Última atualização: 8 de outubro de 2026.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-12 px-5 py-16 lg:px-8 lg:py-20">
        <PolicySection title="1. Quem é responsável pelo atendimento">
          <p>
            Este site apresenta os serviços de {siteConfig.name},{" "}
            {siteConfig.profession.toLowerCase()}, responsável pela marca{" "}
            {siteConfig.brand} e pelo contato realizado pelos canais indicados
            nesta página.
          </p>
        </PolicySection>

        <PolicySection title="2. Quais informações podem ser utilizadas">
          <p>
            Ao utilizar a página oficial de agendamento do Google, você pode
            informar nome, sobrenome, e-mail, telefone, serviço desejado, data e
            horário. Esses dados são enviados diretamente ao Google e usados
            para registrar a reserva na agenda de Luciano.
          </p>
          <p>
            Quando você opta pelo contato via WhatsApp, as informações são
            enviadas somente depois que decide abrir a conversa nessa
            plataforma.
          </p>
        </PolicySection>

        <PolicySection title="3. Para que as informações são usadas">
          <p>
            As informações enviadas por você são utilizadas para responder ao
            contato, entender o serviço desejado, consultar disponibilidade e
            combinar detalhes do atendimento.
          </p>
        </PolicySection>

        <PolicySection title="4. Serviços de terceiros">
          <p>
            A página de agendamento pode incorporar o serviço oficial de
            Agendamento de Horários do Google Agenda. O Google processa os dados
            necessários para exibir disponibilidade, concluir a reserva e enviar
            as comunicações relacionadas ao compromisso, conforme suas próprias
            políticas.
          </p>
          <p>
            Links para WhatsApp e Instagram também direcionam você a plataformas
            externas, que possuem políticas próprias. Este site não utiliza
            sistema próprio de pagamento para as reservas.
          </p>
          <p>
            Consulte a{" "}
            <a
              href="https://policies.google.com/privacy?hl=pt-BR"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-gold hover:text-gold-light"
            >
              Política de Privacidade do Google
            </a>
            .
          </p>
        </PolicySection>

        <PolicySection title="5. Cookies e analytics">
          <p>
            Não há, nesta versão, ferramenta de analytics ou publicidade
            configurada pelo projeto. Caso esses recursos sejam ativados, esta
            política e os mecanismos de consentimento serão revistos quando
            necessários.
          </p>
        </PolicySection>

        <PolicySection title="6. Seus direitos e contato">
          <p>
            Você pode solicitar informações, correção ou eliminação dos dados
            mantidos no atendimento, quando aplicável, entrando em contato pelo
            WhatsApp {siteConfig.contact.phoneDisplay}.
          </p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <a
              href={createWhatsAppUrl(whatsappMessages.general)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-extrabold text-black"
            >
              Falar com Luciano
            </a>
            <a
              href="https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-white"
            >
              Direitos do titular — ANPD
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          </div>
        </PolicySection>
      </div>
    </article>
  );
}

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-3xl font-extrabold uppercase text-white">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-white/55 sm:text-base sm:leading-8">
        {children}
      </div>
    </section>
  );
}
