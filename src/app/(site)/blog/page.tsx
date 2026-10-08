import type { Metadata } from "next";
import { ArrowRight, BookOpenText } from "lucide-react";
import Link from "next/link";

import { PageHero } from "@/components/sections/PageHero";
import { guides } from "@/data/guides";
import { whatsappMessages } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Conteúdos da Direção Segura sobre habilitação, aulas práticas e direção em Itajubá/MG.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Blog Direção Segura"
        title="Conteúdo útil, sem publicar apenas por publicar."
        description="Os artigos serão adicionados quando houver conteúdo original e revisado. Enquanto isso, consulte os guias já disponíveis."
        backHref="/"
        backLabel="Voltar ao início"
        whatsappMessage={whatsappMessages.general}
        placeholderTitle="Conteúdo em preparação"
        placeholderDescription="Não há artigos fictícios ou textos genéricos publicados nesta etapa."
      />

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex items-center gap-3 text-gold">
            <BookOpenText aria-hidden="true" />
            <h2 className="font-display text-3xl font-extrabold uppercase text-white">
              Comece pelos guias
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {guides.map((guide) => (
              <Link
                key={guide.id}
                href={guide.href}
                className="group rounded-3xl border border-white/10 bg-surface p-6 transition hover:border-gold/40"
              >
                <h3 className="font-display text-2xl font-bold uppercase leading-none text-white">
                  {guide.title}
                </h3>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-gold">
                  Ler guia
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
