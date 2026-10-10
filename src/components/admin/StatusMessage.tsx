import { AlertTriangle, CalendarX2, LoaderCircle } from "lucide-react";

export function StatusMessage({
  type,
  title,
  children,
}: {
  type: "loading" | "error" | "empty";
  title: string;
  children?: React.ReactNode;
}) {
  const Icon = type === "loading" ? LoaderCircle : type === "error" ? AlertTriangle : CalendarX2;
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.025] px-6 py-12 text-center">
      <Icon
        className={`mx-auto text-gold ${type === "loading" ? "animate-spin" : ""}`}
        size={30}
        aria-hidden="true"
      />
      <p className="mt-4 font-bold text-white">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/50">{children}</div>}
    </div>
  );
}
