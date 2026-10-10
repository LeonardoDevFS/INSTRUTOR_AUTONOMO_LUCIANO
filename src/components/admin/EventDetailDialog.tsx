"use client";

import { ExternalLink, LoaderCircle, Pencil, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

import { eventDate, formatEventTime } from "@/components/admin/admin-date";
import type { AdminCalendarEvent } from "@/lib/calendar/types";

export function EventDetailDialog({
  event,
  onClose,
  onEdit,
  onDeleted,
}: {
  event: AdminCalendarEvent;
  onClose: () => void;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function removeBlock() {
    setDeleting(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/blocks/${encodeURIComponent(event.id)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmEventId: event.id }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível remover o bloqueio.");
      onDeleted();
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao remover o bloqueio.");
    } finally {
      setDeleting(false);
    }
  }

  const externalAttendees = event.attendees.filter((attendee) => !attendee.self);
  const findFormValue = (pattern: RegExp) =>
    event.formFields.find((field) => pattern.test(field.label))?.value;
  const firstName = findFormValue(/^nome$/i);
  const lastName = findFormValue(/^sobrenome$/i);
  const participantName =
    externalAttendees.find((attendee) => attendee.displayName)?.displayName ??
    ([firstName, lastName].filter(Boolean).join(" ") || undefined);
  const participantEmail =
    externalAttendees.find((attendee) => attendee.email)?.email ??
    findFormValue(/^e-?mail$/i);
  const participantPhone = findFormValue(
    /^(telefone|celular|whats(?:app)?)$/i,
  );
  const requestedService = findFormValue(/^(servi[cç]o|modalidade)$/i);

  return (
    <div className="fixed inset-0 z-50 grid items-end bg-black/75 backdrop-blur-sm sm:place-items-center sm:p-5" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="event-detail-title" className="max-h-[94vh] w-full overflow-y-auto rounded-t-[2rem] border border-white/10 bg-[#111] p-6 sm:max-w-xl sm:rounded-[2rem] sm:p-8">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-gold">{event.kind === "block" ? "Bloqueio do painel" : event.kind === "participant" ? "Evento com participante" : "Compromisso"}</p>
            <h2 id="event-detail-title" className="mt-2 text-2xl font-extrabold leading-tight">{event.title}</h2>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="grid size-11 shrink-0 place-items-center rounded-full border border-white/10 text-white/60"><X size={19} /></button>
        </div>

        <dl className="mt-7 grid gap-4 rounded-2xl border border-white/10 bg-black/25 p-5 sm:grid-cols-2">
          <Detail label="Data" value={eventDate(event).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })} />
          <Detail label="Horário" value={formatEventTime(event)} />
          {event.location && <Detail label="Local" value={event.location} />}
          {event.organizer && <Detail label="Organizador" value={event.organizer} />}
        </dl>

        {!event.managedBlock && (
          <div className="mt-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/40">Dados do aluno retornados pelo Google</p>
            <dl className="mt-3 grid gap-4 rounded-2xl border border-white/10 bg-black/20 p-5 sm:grid-cols-2">
              <Detail label="Nome" value={participantName ?? "Informação não disponível"} />
              <Detail label="E-mail" value={participantEmail ?? "Informação não disponível"} />
              <Detail label="Telefone" value={participantPhone ?? "Informação não disponível"} />
              <Detail label="Serviço solicitado" value={requestedService ?? "Informação não disponível"} />
            </dl>
          </div>
        )}

        {externalAttendees.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/40">Participantes informados pelo Google</p>
            <ul className="mt-3 space-y-2 text-sm text-white/65">
              {externalAttendees.map((attendee, index) => (
                <li key={`${attendee.email ?? attendee.displayName}-${index}`}>{attendee.displayName || attendee.email || "Participante sem identificação"}{attendee.displayName && attendee.email ? ` — ${attendee.email}` : ""}</li>
              ))}
            </ul>
          </div>
        )}

        {event.formFields.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/40">Dados disponibilizados pelo formulário</p>
            <dl className="mt-3 grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:grid-cols-2">
              {event.formFields.map((field, index) => (
                <Detail key={`${field.label}-${index}`} label={field.label} value={field.value} />
              ))}
            </dl>
          </div>
        )}

        {event.description && (
          <div className="mt-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/40">Informações do compromisso</p>
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-white/60">{event.description}</p>
          </div>
        )}

        {error && <p role="alert" className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">{error}</p>}

        {event.managedBlock && !event.recurring ? (
          <div className="mt-7 border-t border-white/10 pt-6">
            {confirmDelete ? (
              <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.07] p-5">
                <p className="font-bold">Remover este bloqueio do Google Agenda?</p>
                <p className="mt-2 text-sm leading-6 text-white/50">A disponibilidade poderá voltar a aparecer na página pública. Esta ação não afeta outros eventos.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button disabled={deleting} onClick={() => void removeBlock()} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-red-500 px-5 text-sm font-extrabold text-white disabled:opacity-50">{deleting && <LoaderCircle size={16} className="animate-spin" />}Confirmar remoção</button>
                  <button onClick={() => setConfirmDelete(false)} className="min-h-11 rounded-full border border-white/15 px-5 text-sm font-bold">Voltar</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <button onClick={onEdit} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gold px-5 text-sm font-extrabold text-black"><Pencil size={16} />Editar bloqueio</button>
                <button onClick={() => setConfirmDelete(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-red-400/30 px-5 text-sm font-bold text-red-200"><Trash2 size={16} />Remover</button>
              </div>
            )}
          </div>
        ) : event.managedBlock && event.recurring ? (
          <div className="mt-7 rounded-2xl border border-gold/20 bg-gold/[0.06] p-5">
            <p className="font-bold">Bloqueio transformado em recorrente</p>
            <p className="mt-2 text-sm leading-6 text-white/50">Para evitar alterações em toda uma série por engano, gerencie este evento diretamente no Google Agenda.</p>
            {event.htmlLink && <a href={event.htmlLink} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-gold/35 px-5 text-sm font-extrabold text-gold"><ExternalLink size={16} />Gerenciar no Google Agenda</a>}
          </div>
        ) : (
          <div className="mt-7 rounded-2xl border border-gold/20 bg-gold/[0.06] p-5">
            <p className="font-bold">Cancelar ou reagendar</p>
            <p className="mt-2 text-sm leading-6 text-white/50">Para preservar a reserva e as notificações do aluno, use o fluxo oficial no Google Agenda. O painel não executa exclusão automática deste evento.</p>
            {event.htmlLink && <a href={event.htmlLink} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-gold/35 px-5 text-sm font-extrabold text-gold"><ExternalLink size={16} />Gerenciar no Google Agenda</a>}
          </div>
        )}
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-white/35">{label}</dt><dd className="mt-1 text-sm font-bold text-white/75">{value}</dd></div>;
}
