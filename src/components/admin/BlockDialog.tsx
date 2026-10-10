"use client";

import { AlertTriangle, LoaderCircle, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  blockReasons,
  isBlockReason,
  type BlockReason,
} from "@/lib/calendar/constants";
import type { AdminCalendarEvent } from "@/lib/calendar/types";

type Conflict = Pick<AdminCalendarEvent, "id" | "title" | "start" | "end" | "kind">;

function eventFormDefaults(event: AdminCalendarEvent | null, selectedDate: string) {
  if (!event) {
    return {
      date: selectedDate,
      startTime: "09:00",
      endTime: "10:00",
      allDay: false,
      reason: "deslocamento" as BlockReason,
      customReason: "",
      notes: "",
    };
  }

  const start = event.allDay ? new Date(`${event.start}T00:00:00`) : new Date(event.start);
  const end = event.allDay ? start : new Date(event.end);
  const date = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
  const hasKnownReason = isBlockReason(event.reasonCode);
  return {
    date,
    startTime: event.allDay ? "09:00" : start.toTimeString().slice(0, 5),
    endTime: event.allDay ? "10:00" : end.toTimeString().slice(0, 5),
    allDay: event.allDay,
    reason: hasKnownReason ? event.reasonCode : "outro",
    customReason: hasKnownReason
      ? ""
      : event.reason ?? event.title.replace(/^Bloqueio\s*[—-]\s*/, ""),
    notes: event.description ?? "",
  };
}

export function BlockDialog({
  event,
  selectedDate,
  onClose,
  onSaved,
}: {
  event: AdminCalendarEvent | null;
  selectedDate: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const defaults = useMemo(() => eventFormDefaults(event, selectedDate), [event, selectedDate]);
  const [form, setForm] = useState(defaults);
  const [requestId] = useState(() => crypto.randomUUID());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [conflictFingerprint, setConflictFingerprint] = useState("");
  const formFingerprint = JSON.stringify(form);

  useEffect(() => {
    const onKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function save(confirmConflicts = false) {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(event ? `/api/admin/blocks/${encodeURIComponent(event.id)}` : "/api/admin/blocks", {
        method: event ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, requestId, confirmConflicts }),
      });
      const payload = await response.json();
      if (response.status === 409) {
        setConflicts(payload.conflicts ?? []);
        setConflictFingerprint(formFingerprint);
        return;
      }
      if (!response.ok) throw new Error(payload.error || "Não foi possível salvar o bloqueio.");
      onSaved();
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao salvar o bloqueio.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid items-end bg-black/75 p-0 backdrop-blur-sm sm:place-items-center sm:p-5" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="block-dialog-title" className="max-h-[94vh] w-full overflow-y-auto rounded-t-[2rem] border border-white/10 bg-[#111] p-6 shadow-2xl sm:max-w-2xl sm:rounded-[2rem] sm:p-8">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-gold">Google Agenda</p>
            <h2 id="block-dialog-title" className="mt-2 font-display text-3xl font-extrabold uppercase">{event ? "Editar bloqueio" : "Bloquear horário"}</h2>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="grid size-11 shrink-0 place-items-center rounded-full border border-white/10 text-white/60 hover:text-white"><X size={19} /></button>
        </div>

        <form className="mt-7 space-y-5" onSubmit={(submitEvent) => { submitEvent.preventDefault(); void save(false); }}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Data">
              <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="admin-input" />
            </Field>
            <Field label="Início">
              <input required={!form.allDay} disabled={form.allDay} type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="admin-input disabled:opacity-35" />
            </Field>
            <Field label="Fim">
              <input required={!form.allDay} disabled={form.allDay} type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="admin-input disabled:opacity-35" />
            </Field>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 p-4 text-sm font-bold">
            <input type="checkbox" checked={form.allDay} onChange={(e) => setForm({ ...form, allDay: e.target.checked })} className="size-4 accent-[var(--gold)]" />
            Bloquear o dia inteiro
          </label>

          <Field label="Motivo do bloqueio">
            <select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value as BlockReason })} className="admin-input">
              {blockReasons.map((reason) => <option key={reason.value} value={reason.value}>{reason.label}</option>)}
            </select>
          </Field>

          {form.reason === "outro" && (
            <Field label="Qual é o motivo?">
              <input required maxLength={80} value={form.customReason} onChange={(e) => setForm({ ...form, customReason: e.target.value })} className="admin-input" placeholder="Ex.: reunião" />
            </Field>
          )}

          <Field label="Observações (opcional)">
            <textarea rows={3} maxLength={500} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="admin-input resize-none" placeholder="Informação interna sobre o bloqueio" />
          </Field>

          {error && <p role="alert" className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">{error}</p>}

          {conflicts.length > 0 && conflictFingerprint === formFingerprint && (
            <div className="rounded-2xl border border-amber-300/25 bg-amber-300/[0.08] p-5">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 shrink-0 text-gold" size={19} aria-hidden="true" />
                <div>
                  <p className="font-bold">Já existe {conflicts.length === 1 ? "um compromisso" : "mais de um compromisso"} nesse período.</p>
                  <ul className="mt-3 space-y-1 text-sm text-white/55">
                    {conflicts.slice(0, 4).map((conflict) => <li key={conflict.id}>• {conflict.title}</li>)}
                  </ul>
                  <p className="mt-3 text-xs leading-5 text-white/45">O painel não cancelará nenhum deles. Confirme apenas se deseja manter os eventos sobrepostos.</p>
                </div>
              </div>
              <button type="button" disabled={saving} onClick={() => void save(true)} className="mt-5 min-h-11 rounded-full border border-gold/40 px-5 text-sm font-extrabold text-gold hover:bg-gold/10">Criar mesmo assim</button>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="min-h-12 rounded-full border border-white/15 px-6 text-sm font-bold">Cancelar</button>
            <button disabled={saving} type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gold px-7 text-sm font-extrabold text-black hover:bg-gold-light disabled:opacity-50">
              {saving && <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />}
              {saving ? "Salvando…" : event ? "Salvar alterações" : "Criar bloqueio"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-white/45">{label}</span>{children}</label>;
}
