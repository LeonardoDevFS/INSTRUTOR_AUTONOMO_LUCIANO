"use client";

import { CalendarPlus, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { BlockDialog } from "@/components/admin/BlockDialog";
import { EventDetailDialog } from "@/components/admin/EventDetailDialog";
import { StatusMessage } from "@/components/admin/StatusMessage";
import {
  eventDateKey,
  formatEventTime,
  getViewRange,
  moveAnchor,
  toLocalDateKey,
  type CalendarView,
  viewDays,
} from "@/components/admin/admin-date";
import type { AdminCalendarEvent, CalendarEventKind } from "@/lib/calendar/types";

type Filter = "all" | CalendarEventKind;

const viewLabels: Record<CalendarView, string> = { day: "Dia", week: "Semana", month: "Mês" };
const filterLabels: Record<Filter, string> = { all: "Todos", participant: "Com participante", block: "Bloqueios", busy: "Ocupados", other: "Outros" };

export function AdminAgenda() {
  const [anchor, setAnchor] = useState(() => new Date());
  const [view, setView] = useState<CalendarView>("week");
  const [filter, setFilter] = useState<Filter>("all");
  const [events, setEvents] = useState<AdminCalendarEvent[]>([]);
  const [selected, setSelected] = useState<AdminCalendarEvent | null>(null);
  const [editing, setEditing] = useState<AdminCalendarEvent | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [syncedAt, setSyncedAt] = useState("");

  const range = useMemo(() => getViewRange(anchor, view), [anchor, view]);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/events?from=${encodeURIComponent(range.start.toISOString())}&to=${encodeURIComponent(range.end.toISOString())}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível carregar os eventos.");
      setEvents(payload.events ?? []);
      setSyncedAt(payload.syncedAt ?? "");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha de conexão com a agenda.");
    } finally {
      setLoading(false);
    }
  }, [range.end, range.start]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  const visibleEvents = useMemo(() => events.filter((event) => filter === "all" || event.kind === filter), [events, filter]);
  const days = useMemo(() => viewDays(anchor, view), [anchor, view]);
  const periodLabel = view === "day"
    ? anchor.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    : view === "month"
      ? anchor.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
      : `${range.start.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} — ${new Date(range.end.getTime() - 86_400_000).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}`;

  return (
    <div>
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-gold">Agenda conectada</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold uppercase leading-none sm:text-5xl">Compromissos</h1>
          <p className="mt-3 text-sm text-white/45">Reservas, eventos e bloqueios vindos do Google Agenda.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button onClick={() => void load()} disabled={loading} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-5 text-sm font-bold hover:border-gold/50 disabled:opacity-50"><RefreshCw size={17} className={loading ? "animate-spin" : ""} />Atualizar</button>
          <button onClick={() => setEditing(null)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gold px-6 text-sm font-extrabold text-black hover:bg-gold-light"><CalendarPlus size={18} />Bloquear horário</button>
        </div>
      </div>

      <section className="mt-8 rounded-3xl border border-white/10 bg-[#0d0d0d] p-4 sm:p-6">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-2">
            <button aria-label="Período anterior" onClick={() => setAnchor(moveAnchor(anchor, view, -1))} className="grid size-11 place-items-center rounded-full border border-white/10 hover:border-gold/50"><ChevronLeft size={18} /></button>
            <button onClick={() => setAnchor(new Date())} className="min-h-11 rounded-full border border-white/10 px-4 text-sm font-bold hover:border-gold/50">Hoje</button>
            <button aria-label="Próximo período" onClick={() => setAnchor(moveAnchor(anchor, view, 1))} className="grid size-11 place-items-center rounded-full border border-white/10 hover:border-gold/50"><ChevronRight size={18} /></button>
            <h2 className="ml-2 capitalize font-bold text-white/80">{periodLabel}</h2>
          </div>
          <div className="flex rounded-full border border-white/10 bg-black/30 p-1" aria-label="Visualização da agenda">
            {(Object.keys(viewLabels) as CalendarView[]).map((option) => <button key={option} onClick={() => setView(option)} aria-pressed={view === option} className={`min-h-9 flex-1 rounded-full px-4 text-xs font-extrabold sm:flex-none ${view === option ? "bg-white text-black" : "text-white/45 hover:text-white"}`}>{viewLabels[option]}</button>)}
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2" aria-label="Filtros de eventos">
          {(Object.keys(filterLabels) as Filter[]).map((option) => <button key={option} onClick={() => setFilter(option)} aria-pressed={filter === option} className={`min-h-9 shrink-0 rounded-full border px-4 text-xs font-bold ${filter === option ? "border-gold bg-gold/10 text-gold" : "border-white/10 text-white/45"}`}>{filterLabels[option]}</button>)}
        </div>

        {loading ? (
          <div className="mt-5"><StatusMessage type="loading" title="Carregando período…" /></div>
        ) : error ? (
          <div className="mt-5"><StatusMessage type="error" title="Agenda indisponível"><p>{error}</p><button onClick={() => void load()} className="mt-4 font-bold text-gold">Tentar novamente</button></StatusMessage></div>
        ) : (
          <CalendarGrid view={view} anchor={anchor} days={days} events={visibleEvents} onSelect={setSelected} onCreate={(date) => { setAnchor(date); setEditing(null); }} />
        )}

        {syncedAt && !loading && <p className="mt-4 text-right text-[0.68rem] text-white/30">Atualizado em {new Date(syncedAt).toLocaleString("pt-BR")}</p>}
      </section>

      {selected && <EventDetailDialog event={selected} onClose={() => setSelected(null)} onEdit={() => { setEditing(selected); setSelected(null); }} onDeleted={() => void load()} />}
      {editing !== undefined && <BlockDialog event={editing} selectedDate={toLocalDateKey(anchor)} onClose={() => setEditing(undefined)} onSaved={() => void load()} />}
    </div>
  );
}

function CalendarGrid({ view, anchor, days, events, onSelect, onCreate }: { view: CalendarView; anchor: Date; days: Date[]; events: AdminCalendarEvent[]; onSelect: (event: AdminCalendarEvent) => void; onCreate: (date: Date) => void }) {
  if (view === "day") {
    if (events.length === 0) return <div className="mt-5"><StatusMessage type="empty" title="Nenhum compromisso neste dia"><button onClick={() => onCreate(anchor)} className="mt-4 font-bold text-gold">Criar um bloqueio</button></StatusMessage></div>;
    return <div className="mt-5 space-y-3">{events.map((event) => <EventCard key={event.id} event={event} onClick={() => onSelect(event)} />)}</div>;
  }

  return (
    <div className="mt-5 overflow-x-auto">
      <div className={`grid min-w-[760px] ${view === "week" ? "grid-cols-7" : "grid-cols-7"}`}>
        {view === "month" && ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((label) => <div key={label} className="border-b border-white/10 px-2 py-3 text-center text-[0.65rem] font-extrabold uppercase tracking-wider text-white/35">{label}</div>)}
        {days.map((day) => {
          const key = toLocalDateKey(day);
          const dayEvents = events.filter((event) => eventDateKey(event) === key);
          const outsideMonth = view === "month" && day.getMonth() !== anchor.getMonth();
          const today = key === toLocalDateKey(new Date());
          return (
            <div key={key} className={`min-h-40 border-b border-r border-white/[0.07] p-2 ${outsideMonth ? "opacity-35" : ""}`}>
              <button onClick={() => onCreate(day)} aria-label={`Criar bloqueio em ${day.toLocaleDateString("pt-BR")}`} className={`mb-2 grid size-8 place-items-center rounded-full text-xs font-extrabold ${today ? "bg-gold text-black" : "text-white/55 hover:bg-white/10"}`}>{day.getDate()}</button>
              <div className="space-y-1.5">
                {dayEvents.slice(0, view === "month" ? 3 : 8).map((event) => <EventCard compact key={event.id} event={event} onClick={() => onSelect(event)} />)}
                {dayEvents.length > (view === "month" ? 3 : 8) && <p className="px-2 text-[0.65rem] font-bold text-white/40">+ {dayEvents.length - (view === "month" ? 3 : 8)} eventos</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EventCard({ event, onClick, compact = false }: { event: AdminCalendarEvent; onClick: () => void; compact?: boolean }) {
  const colors: Record<CalendarEventKind, string> = {
    block: "border-gold/35 bg-gold/[0.1] text-gold-light",
    participant: "border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-100",
    busy: "border-sky-400/20 bg-sky-400/[0.07] text-sky-100",
    other: "border-white/10 bg-white/[0.04] text-white/70",
  };
  return (
    <button onClick={onClick} className={`w-full rounded-xl border text-left transition hover:brightness-125 ${colors[event.kind]} ${compact ? "p-2" : "p-4"}`}>
      <span className={`block truncate font-bold ${compact ? "text-[0.7rem]" : "text-sm"}`}>{event.title}</span>
      <span className={`mt-1 block text-current opacity-60 ${compact ? "text-[0.62rem]" : "text-xs"}`}>{formatEventTime(event)}</span>
    </button>
  );
}
