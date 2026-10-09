import { BookOpenText } from "lucide-react";

import type { GlossaryItem } from "@/data/guide-pages";

export function JourneyGlossary({ items }: { items: readonly GlossaryItem[] }) {
  return (
    <section aria-labelledby="glossary-title" className="border-y border-white/10 bg-surface py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-5 lg:px-8">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10 text-gold">
            <BookOpenText size={23} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-gold">Glossário de trânsito</p>
            <h2 id="glossary-title" className="mt-3 font-display text-4xl font-extrabold uppercase leading-none text-white sm:text-5xl">Siglas explicadas sem complicação.</h2>
          </div>
        </div>
        <dl className="mt-10 grid gap-x-8 md:grid-cols-2">
          {items.map((item) => (
            <div key={item.term} className="border-t border-white/10 py-5">
              <dt className="font-display text-xl font-extrabold uppercase text-gold">{item.term}</dt>
              <dd className="mt-2 text-sm leading-7 text-white/55">{item.definition}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
