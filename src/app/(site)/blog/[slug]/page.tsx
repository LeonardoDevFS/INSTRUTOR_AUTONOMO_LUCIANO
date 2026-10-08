import type { Metadata } from "next";
import { CalendarDays, Check, Clock3, Lightbulb, Route } from "lucide-react";
import { notFound } from "next/navigation";

import { ContactCta } from "@/components/sections/ContactCta";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import {
  blogPosts,
  getBlogPost,
  getBlogPostReadingTime,
} from "@/data/blog-posts";
import { getAbsoluteUrl } from "@/lib/seo/site-url";
import { whatsappMessages } from "@/lib/whatsapp";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {};
  }

  const canonical = `/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: canonical,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const readingTime = getBlogPostReadingTime(post);
  const articleUrl = getAbsoluteUrl(`/blog/${post.slug}`);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    inLanguage: "pt-BR",
    mainEntityOfPage: articleUrl,
    author: {
      "@type": "Person",
      name: siteConfig.name,
      jobTitle: siteConfig.profession,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.brand,
      url: getAbsoluteUrl(),
    },
  };

  return (
    <article>
      <JsonLd data={articleSchema} />

      <header className="relative isolate overflow-hidden border-b border-white/10 pt-20">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_75%_35%,rgba(229,185,63,0.15),transparent_30%)]" />
        <div className="mx-auto max-w-5xl px-5 py-16 sm:py-20 lg:px-8 lg:py-24">
          <Breadcrumbs
            items={[
              { label: "Início", href: "/" },
              { label: "Blog", href: "/blog" },
              { label: post.category },
            ]}
          />
          <p className="mt-9 text-xs font-extrabold uppercase tracking-[0.3em] text-gold">
            {post.category}
          </p>
          <h1 className="mt-5 max-w-4xl text-balance font-display text-5xl font-extrabold uppercase leading-[0.9] text-white sm:text-6xl lg:text-7xl">
            {post.title}
          </h1>
          <p className="mt-7 max-w-3xl text-base leading-8 text-white/60 sm:text-lg">
            {post.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 text-xs text-white/55 sm:flex-row sm:items-center sm:gap-6">
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={15} className="text-gold" aria-hidden="true" />
              Publicado em <time dateTime={post.publishedAt}>{post.displayDate}</time>
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock3 size={15} className="text-gold" aria-hidden="true" />
              {readingTime} min de leitura
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20 lg:px-8">
        <div className="space-y-6 text-base leading-8 text-white/65 sm:text-lg">
          {post.introduction.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-14 space-y-14">
          {post.sections.map((section, index) => (
            <section key={section.title} aria-labelledby={`section-${index + 1}`}>
              <div className="flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/25 bg-gold/10 font-display text-sm font-extrabold text-gold"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2
                  id={`section-${index + 1}`}
                  className="text-balance font-display text-3xl font-extrabold uppercase leading-none text-white sm:text-4xl"
                >
                  {section.title}
                </h2>
              </div>
              <div className="mt-6 space-y-5 text-base leading-8 text-white/60">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.items && (
                <ul className="mt-6 grid gap-3">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 rounded-2xl border border-white/10 bg-surface p-4 text-sm leading-6 text-white/65"
                    >
                      <Check
                        size={17}
                        className="mt-0.5 shrink-0 text-gold"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <aside className="mt-16 rounded-[2rem] border border-gold/20 bg-gold/[0.07] p-6 sm:p-8">
          <Lightbulb size={26} className="text-gold" aria-hidden="true" />
          <p className="mt-5 font-display text-2xl font-bold uppercase leading-tight text-white sm:text-3xl">
            Em resumo
          </p>
          <p className="mt-4 text-base leading-8 text-white/65">{post.takeaway}</p>
        </aside>

        <div className="mt-12 flex items-center gap-3 border-t border-white/10 pt-8 text-sm text-white/55">
          <Route size={18} className="shrink-0 text-gold" aria-hidden="true" />
          Conteúdo educativo da {siteConfig.brand}, em {siteConfig.location.city}/
          {siteConfig.location.state}.
        </div>
      </div>

      <ContactCta
        eyebrow="Treinamento individual"
        title="Quer transformar esse conteúdo em um plano de prática?"
        description="Conte a Luciano qual é o seu momento e veja qual modalidade de aula pode atender melhor ao seu objetivo."
        whatsappMessage={whatsappMessages.general}
        secondaryHref={post.relatedHref}
        secondaryLabel={post.relatedLabel}
      />
    </article>
  );
}
