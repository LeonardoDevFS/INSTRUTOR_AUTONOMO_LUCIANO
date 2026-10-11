"use client";

import { LoaderCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

import { bookingServices } from "@/config/public-booking";
import type { StudentStatus, StudentSummary, TrainingCategory } from "@/lib/students/types";

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  birthDate: string;
  trainingCategory: TrainingCategory;
  serviceType: string;
  status: StudentStatus;
};

type Match = Pick<StudentSummary, "id" | "fullName" | "phone" | "email">;

const emptyForm: FormState = {
  fullName: "",
  phone: "",
  email: "",
  birthDate: "",
  trainingCategory: "B",
  serviceType: "",
  status: "active",
};

export function StudentFormDialog({
  student,
  onClose,
  onSaved,
}: {
  student?: StudentSummary;
  onClose: () => void;
  onSaved: (student: StudentSummary) => void;
}) {
  const [form, setForm] = useState<FormState>(() => student ? {
    fullName: student.fullName,
    phone: student.phone,
    email: student.email ?? "",
    birthDate: student.birthDate ?? "",
    trainingCategory: student.trainingCategory,
    serviceType: student.serviceType,
    status: student.status,
  } : emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function save(confirmPossibleDuplicate = false) {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(
        student ? `/api/admin/students/${student.id}` : "/api/admin/students",
        {
          method: student ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, confirmPossibleDuplicate }),
        },
      );
      const payload = await response.json().catch(() => ({})) as {
        error?: string;
        code?: string;
        matches?: Match[];
        student?: StudentSummary;
      };
      if (!response.ok) {
        if (payload.code === "POSSIBLE_STUDENT_DUPLICATE") {
          setMatches(payload.matches ?? []);
          return;
        }
        throw new Error(payload.error || "Não foi possível salvar o aluno.");
      }
      if (!payload.student) throw new Error("O cadastro não foi retornado pelo servidor.");
      onSaved(payload.student);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao salvar o aluno.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid items-end bg-black/80 backdrop-blur-sm sm:place-items-center sm:p-5" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="student-form-title" className="max-h-[94vh] w-full overflow-y-auto rounded-t-[2rem] border border-white/10 bg-[#111] p-6 shadow-2xl sm:max-w-2xl sm:rounded-[2rem] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-gold">Gestão de alunos</p>
            <h2 id="student-form-title" className="mt-2 font-display text-3xl font-extrabold uppercase">{student ? "Editar aluno" : "Cadastrar aluno"}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="grid size-11 shrink-0 place-items-center rounded-full border border-white/10 text-white/60 hover:text-white"><X size={19} /></button>
        </div>

        <form className="mt-7 space-y-5" onSubmit={(event) => { event.preventDefault(); void save(false); }}>
          <Field label="Nome completo">
            <input required minLength={3} maxLength={120} autoComplete="name" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} className="admin-input" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Telefone / WhatsApp">
              <input required minLength={10} maxLength={24} autoComplete="tel" inputMode="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="admin-input" />
            </Field>
            <Field label="E-mail (opcional)">
              <input type="email" maxLength={160} autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="admin-input" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Nascimento (opcional)">
              <input type="date" value={form.birthDate} onChange={(event) => setForm({ ...form, birthDate: event.target.value })} className="admin-input" />
            </Field>
            <Field label="Categoria">
              <select value={form.trainingCategory} onChange={(event) => setForm({ ...form, trainingCategory: event.target.value as TrainingCategory })} className="admin-input">
                <option value="A">Categoria A</option><option value="B">Categoria B</option><option value="A+B">Categorias A+B</option>
              </select>
            </Field>
            <Field label="Situação">
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as StudentStatus })} className="admin-input">
                <option value="active">Ativo</option><option value="inactive">Inativo</option><option value="completed">Concluído</option>
              </select>
            </Field>
          </div>
          <Field label="Tipo de atendimento">
            <input required minLength={3} maxLength={80} list="student-service-types" value={form.serviceType} onChange={(event) => setForm({ ...form, serviceType: event.target.value })} className="admin-input" placeholder="Ex.: Treinamento para habilitados" />
            <datalist id="student-service-types">{bookingServices.map((service) => <option key={service.id} value={service.name} />)}</datalist>
          </Field>

          {matches.length > 0 && (
            <div className="rounded-2xl border border-amber-300/25 bg-amber-300/[0.07] p-5">
              <p className="font-bold text-amber-100">Possíveis cadastros semelhantes</p>
              <p className="mt-2 text-sm leading-6 text-white/55">Revise antes de criar outra ficha. Nenhum registro será mesclado automaticamente.</p>
              <ul className="mt-4 space-y-2 text-sm">
                {matches.map((match) => <li key={match.id} className="rounded-xl bg-black/25 p-3"><strong>{match.fullName}</strong><span className="mt-1 block text-white/45">{match.phone}{match.email ? ` · ${match.email}` : ""}</span></li>)}
              </ul>
              <button type="button" disabled={saving} onClick={() => void save(true)} className="mt-4 min-h-11 rounded-full border border-gold/40 px-5 text-sm font-extrabold text-gold">Confirmar cadastro separado</button>
            </div>
          )}
          {error && <p role="alert" aria-live="assertive" className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">{error}</p>}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="min-h-12 rounded-full border border-white/15 px-6 text-sm font-bold">Cancelar</button>
            <button disabled={saving} type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gold px-7 text-sm font-extrabold text-black hover:bg-gold-light disabled:opacity-50">{saving && <LoaderCircle size={17} className="animate-spin" />}{saving ? "Salvando…" : "Salvar aluno"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-white/45">{label}</span>{children}</label>;
}
