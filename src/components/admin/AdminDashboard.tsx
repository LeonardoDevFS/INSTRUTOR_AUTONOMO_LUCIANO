"use client";

import { CalendarClock, CalendarDays, RefreshCw, ShieldCheck, UsersRound } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { StatusMessage } from "@/components/admin/StatusMessage";
import { eventDate, formatEventTime, toLocalDateKey } from "@/components/admin/admin-date";
import type { AdminCalendarEvent, CalendarSummary } from "@/lib/calendar/types";

type DashboardData = {
  events: AdminCalendarEvent[];
  syncedAt: string;
};

export function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [calendar, setCalendar] = useState<CalendarSummary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setDate(to.getDate() + 31);
    try {
      const [eventsResponse, calendarResponse] = await Promise.all([
        fetch(`/api/admin/events?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`, { cache: "no-store" }),
        fetch("/api/admin/calendar", { cache: "no-store" }),
      ]);
      const eventsPayload = await eventsResponse.json();
      const calendarPayload = await calendarResponse.json();
      if (!eventsResponse.ok) throw new Error(eventsPayload.error || "Não foi possível carregar a agenda.");
      if (!calendarResponse.ok) throw new Error(calendarPayload.error || "Não foi possível verificar a conexão.");
      setData(eventsPayload);
      setCalendar(calendarPayload.calendar);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha de conexão com a agenda.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  const metrics = useMemo(() => {
    const events = data?.events ?? [];
    const currentTime = data?.syncedAt ? new Date(data.syncedAt) : new Date(0);
    const today = toLocalDateKey(currentTime);
    const upcoming = events.filter((event) => eventDate(event).getTime() >= currentTime.getTime());
    return {
      today: events.filter((event) => (event.allDay ? event.start : toLocalDateKey(new Date(event.start))) === today).length,
      todayEvents: events.filter((event) => (event.allDay ? event.start : toLocalDateKey(new Date(event.start))) === today),
      participants: events.filter((event) => event.kind === "participant").length,
      blocks: events.filter((event) => event.kind === "block").length,
      next: upcoming[0],
      nextParticipant: upcoming.find((event) => event.kind === "participant"),
    };
  }, [data]);

  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-gold">Direção Segura</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold uppercase leading-none sm:text-5xl">Visão geral</h1>
          <p className="mt-3 text-sm text-white/45">Dados reais da agenda conectada, sem estimativas.</p>
        </div>
        <button
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 px-5 text-sm font-bold transition hover:border-gold/60 hover:text-gold disabled:opacity-50"
        >
          <RefreshCw size={17} className={loading ? "animate-spin" : ""} aria-hidden="true" />
          Atualizar
        </button>
      </div>

      {loading && !data ? (
        <div className="mt-8"><StatusMessage type="loading" title="Sincronizando com o Google Agenda…" /></div>
      ) : error ? (
        <div className="mt-8"><StatusMessage type="error" title="Não foi possível sincronizar"><p>{error}</p><button onClick={() => void load()} className="mt-4 font-bold text-gold">Tentar novamente</button></StatusMessage></div>
      ) : (
        <>
          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores da agenda">
            <MetricCard icon={CalendarDays} label="Compromissos hoje" value={String(metrics.today)} />
            <MetricCard icon={UsersRound} label="Eventos com participante" value={String(metrics.participants)} hint="Próximos 31 dias" />
            <MetricCard icon={ShieldCheck} label="Bloqueios do painel" value={String(metrics.blocks)} hint="Próximos 31 dias" />
            <MetricCard icon={CalendarClock} label="Sincronização" value="Ativa" hint={calendar?.summary} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-3xl border border-white/10 bg-[#0e0e0e] p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-gold">Agenda do dia</p>
                  <h2 className="mt-2 text-xl font-extrabold">Compromissos de hoje</h2>
                </div>
                <Link href="/admin/agenda" className="text-sm font-bold text-gold hover:text-gold-light">Ver agenda</Link>
              </div>
              {metrics.todayEvents.length > 0 ? (
                <div className="mt-7 space-y-3">
                  {metrics.todayEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="rounded-2xl border border-white/10 bg-black/35 p-4">
                      <p className="font-bold text-white">{event.title}</p>
                      <p className="mt-1 text-sm text-white/50">{formatEventTime(event)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-7 rounded-2xl border border-dashed border-white/10 p-6 text-sm text-white/45">Nenhum compromisso encontrado para hoje.</p>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-[#0e0e0e] p-6 sm:p-7">
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-gold">Próximo compromisso</p>
                {metrics.next ? (
                  <>
                    <h2 className="mt-3 text-lg font-extrabold">{metrics.next.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-white/50">{eventDate(metrics.next).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })} · {formatEventTime(metrics.next)}</p>
                  </>
                ) : <p className="mt-3 text-sm text-white/45">Nenhum evento futuro no período.</p>}
                {metrics.nextParticipant && (
                  <p className="mt-4 border-t border-white/10 pt-4 text-xs leading-5 text-white/40">Próximo evento identificado com participante: <strong className="text-white/70">{metrics.nextParticipant.title}</strong></p>
                )}
              </div>
              <div className="rounded-3xl border border-gold/20 bg-gradient-to-br from-gold/[0.1] to-transparent p-6 sm:p-7">
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-gold">Conexão</p>
                <h2 className="mt-3 text-xl font-extrabold">{calendar?.summary ?? "Google Agenda"}</h2>
                <p className="mt-3 text-sm leading-6 text-white/50">Fuso: {calendar?.timeZone ?? "America/Sao_Paulo"}. A atualização é feita somente ao abrir ou usar o botão atualizar.</p>
                {data?.syncedAt && <p className="mt-5 text-xs text-white/35">Última leitura: {new Date(data.syncedAt).toLocaleString("pt-BR")}</p>}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, hint }: { icon: typeof CalendarDays; label: string; value: string; hint?: string }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-[#0e0e0e] p-5">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-bold text-white/55">{label}</p>
        <Icon size={19} className="text-gold" aria-hidden="true" />
      </div>
      <p className="mt-5 font-display text-4xl font-extrabold uppercase">{value}</p>
      {hint && <p className="mt-1 truncate text-xs text-white/35">{hint}</p>}
    </article>
  );
}
