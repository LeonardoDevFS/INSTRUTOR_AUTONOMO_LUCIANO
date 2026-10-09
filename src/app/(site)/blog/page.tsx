import type { Metadata } from "next";
import { ArrowRight, BookOpenText, CalendarDays, Clock3 } from "lucide-react";
import Link from "next/link";

import { PageHero } from "@/components/sections/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { blogPosts, getBlogPostReadingTime } from "@/data/blog-posts";
import { guides } from "@/data/guides";
import { siteMedia } from "@/data/media";
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
        title="Conteúdo prático para evoluir com mais clareza."
        description="Artigos originais sobre aulas práticas, preparação e organização do aprendizado na direção. Para processos oficiais, consulte também os guias atualizados."
        backHref="/"
        backLabel="Voltar ao início"
        whatsappMessage={whatsappMessages.general}
        placeholderTitle="Conteúdo Direção Segura"
        placeholderDescription="Espaço reservado para uma imagem editorial original de Luciano, do carro ou da moto."
        imageSrc={siteMedia.professionalPortrait.src}
        imageAlt={siteMedia.professionalPortrait.alt}
        imagePosition={siteMedia.professionalPortrait.objectPosition}
      />

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="Artigos recentes"
            title="Orientação que continua além da aula."
            description="Leituras diretas para chegar ao treinamento com objetivos mais claros e aproveitar melhor cada etapa da prática."
            align="center"
          />
          <div className="mt-10 grid gap-5 lg:mt-14 lg:grid-cols-2">
            {blogPosts.map((post) => (
              <article
                key={post.slug}
                className="flex min-h-96 flex-col rounded-[2rem] border border-white/10 bg-surface p-7 sm:p-8"
              >
                <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-gold">
                  {post.category}
                </p>
                <h2 className="mt-6 text-balance font-display text-3xl font-extrabold uppercase leading-[0.95] text-white sm:text-4xl">
                  {post.title}
                </h2>
                <p className="mt-5 text-sm leading-7 text-white/55">
                  {post.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/55">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays size={14} className="text-gold" aria-hidden="true" />
                    <time dateTime={post.publishedAt}>{post.displayDate}</time>
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock3 size={14} className="text-gold" aria-hidden="true" />
                    {getBlogPostReadingTime(post)} min de leitura
                  </span>
                </div>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group mt-auto inline-flex items-center gap-2 pt-8 text-sm font-extrabold text-gold transition hover:text-gold-light"
                >
                  Ler artigo
                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex items-center gap-3 text-gold">
            <BookOpenText aria-hidden="true" />
            <h2 className="font-display text-3xl font-extrabold uppercase text-white">
              Comece pelos guias
            </h2>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
            Os guias reúnem conteúdos mais completos sobre os processos de
            habilitação em Minas Gerais e sobre a retomada da direção.
          </p>
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
