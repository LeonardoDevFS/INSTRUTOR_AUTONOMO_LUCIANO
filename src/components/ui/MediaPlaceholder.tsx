import { Camera, Route } from "lucide-react";

import { cn } from "@/lib/utils";

type MediaPlaceholderProps = {
  title: string;
  description: string;
  className?: string;
};

export function MediaPlaceholder({
  title,
  description,
  className,
}: MediaPlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={`${title}. ${description}`}
      className={cn(
        "group relative isolate min-h-80 overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d0d0d]",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(229,185,63,0.2),transparent_28%),linear-gradient(145deg,transparent_25%,rgba(255,255,255,0.035)_26%,transparent_27%)]" />
      <div className="absolute -bottom-24 left-1/2 h-96 w-44 -translate-x-1/2 rotate-[18deg] border-x border-gold/20 bg-gradient-to-t from-gold/10 to-transparent [clip-path:polygon(28%_0,72%_0,100%_100%,0_100%)]">
        <span className="absolute left-1/2 top-10 h-32 w-px -translate-x-1/2 bg-gradient-to-b from-gold/70 to-transparent" />
      </div>

      <div className="relative flex h-full min-h-[inherit] flex-col justify-between p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-black/50 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
            <Camera size={14} aria-hidden="true" />
            Material original
          </span>
          <Route className="text-white/20" aria-hidden="true" />
        </div>

        <div className="max-w-sm rounded-2xl border border-white/10 bg-black/65 p-5 backdrop-blur-md">
          <p className="font-display text-2xl font-bold uppercase leading-none text-white">
            {title}
          </p>
          <p className="mt-3 text-sm leading-6 text-white/50">{description}</p>
        </div>
      </div>
    </div>
  );
}
