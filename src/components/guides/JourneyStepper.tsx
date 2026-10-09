"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ExternalLink,
  Lightbulb,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useMemo, useState, type KeyboardEvent } from "react";

import {
  officialGuideSources,
  type JourneyStep,
  type JourneyVariant,
} from "@/data/guide-pages";
import { cn } from "@/lib/utils";

type JourneyStepperProps = {
  journeyKey: string;
  title: string;
  steps: readonly JourneyStep[];
  variants?: readonly JourneyVariant[];
};

export function JourneyStepper({
  journeyKey,
  title,
  steps,
  variants = [],
}: JourneyStepperProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [activeVariantId, setActiveVariantId] = useState(variants[0]?.id ?? "");
  const storageKey = `direcao-segura:jornada:${journeyKey}`;
  const activeStep = steps[activeIndex];
  const activeVariant = variants.find(({ id }) => id === activeVariantId);

  useEffect(() => {
    let timeoutId: number | undefined;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (!stored) return;
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const validIds = parsed.filter((id): id is string => typeof id === "string");
        timeoutId = window.setTimeout(() => setCompleted(validIds), 0);
      }
    } catch {
      // O checklist continua funcional mesmo se o armazenamento estiver indisponível.
    }
    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [storageKey]);

  const completedSet = useMemo(() => new Set(completed), [completed]);
  const progress = Math.round((completedSet.size / steps.length) * 100);

  function persist(next: string[]) {
    setCompleted(next);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // O estado da sessão ainda funciona sem persistência.
    }
  }

  function toggleCompleted(stepId: string) {
    persist(
      completedSet.has(stepId)
        ? completed.filter((id) => id !== stepId)
        : [...completed, stepId],
    );
  }

  function resetJourney() {
    persist([]);
    setActiveIndex(0);
    document.getElementById(`${journeyKey}-step-0`)?.focus();
  }

  function selectStep(index: number) {
    setActiveIndex(index);
    document
      .getElementById(`${journeyKey}-content`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function handleStepKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | null = null;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = (index + 1) % steps.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex = (index - 1 + steps.length) % steps.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = steps.length - 1;
    }

    if (nextIndex === null) return;
    event.preventDefault();
    setActiveIndex(nextIndex);
    document.getElementById(`${journeyKey}-step-${nextIndex}`)?.focus();
  }

  return (
    <section aria-labelledby={`${journeyKey}-journey-title`} className="border-y border-white/10 bg-surface py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-gold">Jornada interativa</p>
          <h2 id={`${journeyKey}-journey-title`} className="mt-4 text-balance font-display text-4xl font-extrabold uppercase leading-[0.95] text-white sm:text-5xl">
            {title}
          </h2>
          <p className="mt-5 text-sm leading-7 text-white/55">
            Selecione uma etapa para estudar. Você também pode marcar o que já concluiu; o checklist fica somente neste navegador e não possui valor oficial.
          </p>
        </div>

        {variants.length > 0 && (
          <div className="mt-10 rounded-[2rem] border border-gold/20 bg-black/35 p-5 sm:p-7">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-gold">Escolha sua situação</p>
            <div role="tablist" aria-label="Categoria que deseja adicionar" className="mt-4 grid gap-3 sm:grid-cols-2">
              {variants.map((variant) => {
                const selected = variant.id === activeVariantId;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls={`${journeyKey}-variant-panel`}
                    onClick={() => setActiveVariantId(variant.id)}
                    className={cn(
                      "min-h-14 rounded-2xl border px-5 py-3 text-left text-sm font-extrabold transition",
                      selected ? "border-gold bg-gold text-black" : "border-white/10 bg-white/[0.03] text-white hover:border-gold/50",
                    )}
                  >
                    {variant.label}
                  </button>
                );
              })}
            </div>
            {activeVariant && (
              <div id={`${journeyKey}-variant-panel`} role="tabpanel" className="mt-6 border-t border-white/10 pt-6">
                <h3 className="font-display text-3xl font-extrabold uppercase text-white">{activeVariant.title}</h3>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60">{activeVariant.description}</p>
                <ul className="mt-5 grid gap-2 sm:grid-cols-3">
                  {activeVariant.highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-2 text-sm text-white/70">
                      <Check size={16} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="mt-10 grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start">
          <aside className="rounded-[2rem] border border-white/10 bg-black/35 p-4 lg:sticky lg:top-24">
            <div className="px-2 pb-4">
              <div className="flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-[0.14em]">
                <span className="text-white/55">Minha jornada</span>
                <span className="text-gold">{completedSet.size}/{steps.length}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Progresso do checklist" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                <div className="h-full rounded-full bg-gold transition-[width] duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 text-xs text-white/35">Checklist pessoal, sem vínculo com o Detran.</p>
            </div>
            <ol aria-label="Etapas da jornada" className="max-h-[32rem] space-y-1 overflow-y-auto pr-1">
              {steps.map((step, index) => {
                const selected = index === activeIndex;
                const done = completedSet.has(step.id);
                return (
                  <li key={step.id}>
                    <button
                      id={`${journeyKey}-step-${index}`}
                      type="button"
                      aria-current={selected ? "step" : undefined}
                      aria-controls={`${journeyKey}-content`}
                      onClick={() => selectStep(index)}
                      onKeyDown={(event) => handleStepKeyDown(event, index)}
                      className={cn(
                        "grid w-full grid-cols-[2.25rem_1fr_auto] items-center gap-3 rounded-2xl px-3 py-3 text-left transition",
                        selected ? "bg-gold/12 text-white" : "text-white/55 hover:bg-white/[0.04] hover:text-white",
                      )}
                    >
                      <span className={cn("flex h-9 w-9 items-center justify-center rounded-full border text-xs font-extrabold", done ? "border-gold bg-gold text-black" : selected ? "border-gold text-gold" : "border-white/10")}>
                        {done ? <Check size={16} aria-hidden="true" /> : String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm font-bold leading-5">{step.title}</span>
                      <ArrowRight size={15} className={selected ? "text-gold" : "text-white/20"} aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ol>
            <button type="button" onClick={resetJourney} disabled={completed.length === 0} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 text-xs font-extrabold text-white/55 transition hover:border-gold/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-35">
              <RotateCcw size={14} aria-hidden="true" /> Reiniciar checklist
            </button>
          </aside>

          <article id={`${journeyKey}-content`} aria-live="polite" className="min-w-0 rounded-[2rem] border border-white/10 bg-black/40 p-5 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-gold">Etapa {activeIndex + 1} de {steps.length}</p>
                <h3 className="mt-3 text-balance font-display text-4xl font-extrabold uppercase leading-none text-white">{activeStep.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/55">{activeStep.summary}</p>
              </div>
              <label className="flex min-h-12 shrink-0 cursor-pointer items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 text-sm font-bold text-white transition hover:border-gold/45">
                <input type="checkbox" checked={completedSet.has(activeStep.id)} onChange={() => toggleCompleted(activeStep.id)} className="h-4 w-4 accent-[#e5b93f]" />
                Concluí esta etapa
              </label>
            </div>

            <div className="mt-8 grid gap-8 xl:grid-cols-2">
              <ContentBlock title="O que é?" text={activeStep.what} />
              <ContentBlock title="Por que é necessária?" text={activeStep.why} />
              <ListBlock title="O que preciso fazer?" items={activeStep.actions} />
              <ListBlock title="O que preciso ter em mãos?" items={activeStep.requirements} />
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h4 className="text-sm font-extrabold text-white">O que acontece depois?</h4>
              <p className="mt-2 text-sm leading-7 text-white/60">{activeStep.after}</p>
            </div>

            <div className="mt-4 rounded-2xl border border-gold/25 bg-gold/[0.07] p-5">
              <div className="flex items-center gap-2 text-gold"><Lightbulb size={18} aria-hidden="true" /><h4 className="text-sm font-extrabold">Dica do Luciano</h4></div>
              <p className="mt-2 text-sm leading-7 text-white/65">{activeStep.tip}</p>
            </div>

            {activeStep.notice && (
              <div className={cn("mt-4 rounded-2xl border p-5", activeStep.notice.tone === "attention" ? "border-amber-400/25 bg-amber-400/[0.07]" : "border-sky-400/20 bg-sky-400/[0.06]")}>
                <div className="flex items-center gap-2 text-white"><ShieldAlert size={18} className="text-gold" aria-hidden="true" /><h4 className="text-sm font-extrabold">{activeStep.notice.title}</h4></div>
                <p className="mt-2 text-sm leading-7 text-white/60">{activeStep.notice.text}</p>
              </div>
            )}

            {activeStep.sourceIds && activeStep.sourceIds.length > 0 && (
              <div className="mt-6 border-t border-white/10 pt-6">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/40">Fontes oficiais desta etapa</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {activeStep.sourceIds.map((sourceId) => {
                    const source = officialGuideSources[sourceId];
                    return <a key={sourceId} href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 px-4 text-xs font-bold text-gold transition hover:border-gold/50"><ExternalLink size={13} aria-hidden="true" />{source.shortTitle}</a>;
                  })}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-between">
              <button type="button" disabled={activeIndex === 0} onClick={() => selectStep(activeIndex - 1)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/10 px-5 text-sm font-extrabold text-white transition hover:border-gold/50 disabled:cursor-not-allowed disabled:opacity-30"><ArrowLeft size={17} aria-hidden="true" /> Etapa anterior</button>
              <button type="button" disabled={activeIndex === steps.length - 1} onClick={() => selectStep(activeIndex + 1)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gold px-5 text-sm font-extrabold text-black transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-30">Próxima etapa <ArrowRight size={17} aria-hidden="true" /></button>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function ContentBlock({ title, text }: { title: string; text: string }) {
  return <section><h4 className="text-sm font-extrabold text-white">{title}</h4><p className="mt-3 text-sm leading-7 text-white/60">{text}</p></section>;
}

function ListBlock({ title, items }: { title: string; items: readonly string[] }) {
  return <section><h4 className="text-sm font-extrabold text-white">{title}</h4><ul className="mt-3 space-y-2">{items.map((item) => <li key={item} className="flex gap-2 text-sm leading-6 text-white/60"><CheckCircle2 size={16} className="mt-1 shrink-0 text-gold" aria-hidden="true" />{item}</li>)}</ul></section>;
}
