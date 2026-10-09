import { ChevronDown } from "lucide-react";

import { JsonLd } from "@/components/seo/JsonLd";
import type { JourneyFaqItem } from "@/data/guide-pages";

type JourneyFAQProps = {
  items: readonly JourneyFaqItem[];
};

export function JourneyFAQ({ items }: JourneyFAQProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <section aria-labelledby="journey-faq-title" className="py-20 sm:py-24">
      <JsonLd data={schema} />
      <div className="mx-auto max-w-5xl px-5 lg:px-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-gold">Perguntas frequentes</p>
        <h2 id="journey-faq-title" className="mt-4 text-balance font-display text-4xl font-extrabold uppercase leading-[0.95] text-white sm:text-5xl">
          Respostas para seguir com mais clareza.
        </h2>
        <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
          {items.map((item) => (
            <details key={item.question} className="group">
              <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-6 py-5 text-left font-bold text-white marker:content-none">
                {item.question}
                <ChevronDown size={19} className="shrink-0 text-gold transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="max-w-3xl pb-6 text-sm leading-7 text-white/60">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
