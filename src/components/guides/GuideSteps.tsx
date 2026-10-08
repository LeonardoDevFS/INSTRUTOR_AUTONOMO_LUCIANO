import type { GuideStep } from "@/data/guide-pages";

type GuideStepsProps = {
  title: string;
  steps: readonly GuideStep[];
};

export function GuideSteps({ title, steps }: GuideStepsProps) {
  return (
    <section aria-labelledby="guide-steps-title" className="border-y border-white/10 bg-surface py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-5 lg:px-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-gold">
          Passo a passo
        </p>
        <h2
          id="guide-steps-title"
          className="mt-4 text-balance font-display text-4xl font-extrabold uppercase leading-[0.95] text-white sm:text-5xl"
        >
          {title}
        </h2>
        <ol className="mt-10 space-y-4">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="grid gap-4 rounded-3xl border border-white/10 bg-black/35 p-5 sm:grid-cols-[4rem_1fr] sm:p-6"
            >
              <span className="font-display text-4xl font-extrabold leading-none text-gold/55">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-2xl font-bold uppercase leading-none text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/55">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
