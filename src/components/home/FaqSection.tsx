import { Plus } from "lucide-react";

import { siteConfig } from "@/config/site";
import { createHomeFaqItems } from "@/data/home";

import { SectionHeading } from "@/components/ui/SectionHeading";

const faqItems = createHomeFaqItems(siteConfig);

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="border-y border-white/10 bg-surface py-20 sm:py-24 lg:py-28"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20 lg:px-8">
        <SectionHeading
          id="faq-title"
          eyebrow="Perguntas frequentes"
          title="Respostas claras antes de você começar."
          description="Se sua dúvida não estiver aqui, fale diretamente com Luciano pelo WhatsApp."
        />

        <div className="divide-y divide-white/10 border-y border-white/10">
          {faqItems.map((item) => (
            <details key={item.question} className="group">
              <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-5 py-5 text-left font-display text-xl font-bold uppercase leading-tight text-white marker:content-none sm:text-2xl [&::-webkit-details-marker]:hidden">
                {item.question}
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-gold transition group-open:rotate-45 group-open:border-gold/30">
                  <Plus size={18} aria-hidden="true" />
                </span>
              </summary>
              <p className="max-w-2xl pb-6 pr-12 text-sm leading-7 text-white/55 sm:text-base">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
