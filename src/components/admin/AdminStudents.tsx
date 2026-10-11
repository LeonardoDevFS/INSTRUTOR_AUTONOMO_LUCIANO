"use client";

import { CalendarCheck2, ChevronLeft, ChevronRight, Download, Search, UserPlus, UsersRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { StatusMessage } from "@/components/admin/StatusMessage";
import { StudentFormDialog } from "@/components/admin/StudentFormDialog";
import type { StudentMetrics, StudentStatus, StudentSummary, TrainingCategory } from "@/lib/students/types";

type StudentListPayload = {
  students: StudentSummary[];
  metrics: StudentMetrics;
  pagination: { page: number; pageSize: number; total: number };
};

const statusLabels: Record<StudentStatus, string> = { active: "Ativo", inactive: "Inativo", completed: "Concluído" };

export function AdminStudents() {
  const router = useRouter();
  const [data, setData] = useState<StudentListPayload | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StudentStatus | "all">("all");
  const [category, setCategory] = useState<TrainingCategory | "all">("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setErrorCode("");
    try {
      const params = new URLSearchParams({ query, status, category, page: String(page), pageSize: "15" });
      const response = await fetch(`/api/admin/students?${params}`, { cache: "no-store" });
      const payload = await response.json().catch(() => ({})) as StudentListPayload & { error?: string; code?: string };
      if (!response.ok) {
        setErrorCode(payload.code ?? "");
        throw new Error(payload.error || "Não foi possível carregar os alunos.");
      }
      setData(payload);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao carregar os alunos.");
    } finally {
      setLoading(false);
    }
  }, [category, page, query, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), query ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [load, query]);

  const pageCount = Math.max(1, Math.ceil((data?.pagination.total ?? 0) / 15));

  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-gold">Relacionamento e acompanhamento</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold uppercase leading-none sm:text-5xl">Alunos</h1>
          <p className="mt-3 text-sm text-white/45">Cadastros, aulas, evolução e registros administrativos em um só lugar.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/api/admin/students/export" prefetch={false} aria-disabled={errorCode === "STUDENTS_SCHEMA_NOT_INSTALLED"} onClick={(event) => { if (errorCode === "STUDENTS_SCHEMA_NOT_INSTALLED") event.preventDefault(); }} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-5 text-sm font-bold hover:border-gold/50 aria-disabled:pointer-events-none aria-disabled:opacity-40"><Download size={17} />Exportar CSV</Link>
          <button type="button" onClick={() => setCreating(true)} disabled={errorCode === "STUDENTS_SCHEMA_NOT_INSTALLED"} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gold px-6 text-sm font-extrabold text-black hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-40"><UserPlus size={18} />Cadastrar aluno</button>
        </div>
      </div>

      {data && (
        <section className="mt-8 grid grid-cols-2 gap-3 xl:grid-cols-5" aria-label="Indicadores de alunos">
          <Metric label="Total" value={data.metrics.total} />
          <Metric label="Ativos" value={data.metrics.active} />
          <Metric label="Inativos" value={data.metrics.inactive} />
          <Metric label="Concluídos" value={data.metrics.completed} />
          <Metric label="Com aulas futuras" value={data.metrics.withFutureLessons} wide />
        </section>
      )}

      <section className="mt-6 rounded-3xl border border-white/10 bg-[#0d0d0d] p-4 sm:p-6">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">
          <label className="relative block">
            <span className="sr-only">Pesquisar aluno</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35" size={18} />
            <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} className="admin-input pl-11" placeholder="Nome, telefone ou e-mail" />
          </label>
          <label><span className="sr-only">Filtrar por situação</span><select value={status} onChange={(event) => { setStatus(event.target.value as StudentStatus | "all"); setPage(1); }} className="admin-input"><option value="all">Todas as situações</option><option value="active">Ativos</option><option value="inactive">Inativos</option><option value="completed">Concluídos</option></select></label>
          <label><span className="sr-only">Filtrar por categoria</span><select value={category} onChange={(event) => { setCategory(event.target.value as TrainingCategory | "all"); setPage(1); }} className="admin-input"><option value="all">Todas as categorias</option><option value="A">Categoria A</option><option value="B">Categoria B</option><option value="A+B">Categorias A+B</option></select></label>
        </div>

        {loading && !data ? (
          <div className="mt-5"><StatusMessage type="loading" title="Carregando alunos…" /></div>
        ) : error ? (
          <div className="mt-5"><StatusMessage type="error" title={errorCode === "STUDENTS_SCHEMA_NOT_INSTALLED" ? "Migração pendente" : "Gestão de Alunos indisponível"}><p>{error}</p>{errorCode === "STUDENTS_SCHEMA_NOT_INSTALLED" ? <p className="mt-2">Revise e aplique <code>database/students.sql</code> no SQL Editor do Supabase.</p> : <button onClick={() => void load()} className="mt-4 font-bold text-gold">Tentar novamente</button>}</StatusMessage></div>
        ) : data?.students.length ? (
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
            <div className="hidden grid-cols-[1.4fr_1fr_0.8fr_0.8fr_auto] gap-4 border-b border-white/10 bg-white/[0.025] px-5 py-3 text-[0.65rem] font-extrabold uppercase tracking-wider text-white/35 md:grid">
              <span>Aluno</span><span>Contato</span><span>Categoria</span><span>Situação</span><span>Acesso</span>
            </div>
            <div className="divide-y divide-white/[0.07]">
              {data.students.map((student) => (
                <article key={student.id} className="grid gap-3 p-5 md:grid-cols-[1.4fr_1fr_0.8fr_0.8fr_auto] md:items-center md:gap-4">
                  <div><h2 className="font-extrabold text-white">{student.fullName}</h2><p className="mt-1 text-xs text-white/40">{student.serviceType}</p></div>
                  <div className="text-sm text-white/55"><p>{student.phone}</p>{student.email && <p className="mt-1 truncate text-xs">{student.email}</p>}</div>
                  <span className="w-fit rounded-full border border-gold/25 bg-gold/[0.07] px-3 py-1 text-xs font-extrabold text-gold">{student.trainingCategory}</span>
                  <div><span className="text-sm font-bold text-white/65">{statusLabels[student.status]}</span>{student.hasFutureLessons && <span className="mt-1 flex items-center gap-1 text-[0.68rem] font-bold text-emerald-300"><CalendarCheck2 size={13} />Aula futura</span>}</div>
                  <Link href={`/admin/alunos/${student.id}`} className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/15 px-4 text-xs font-extrabold hover:border-gold/50 hover:text-gold">Abrir ficha</Link>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-5"><StatusMessage type="empty" title="Nenhum aluno encontrado"><p>A lista usa somente cadastros reais. Ajuste os filtros ou cadastre o primeiro aluno.</p></StatusMessage></div>
        )}

        {data && data.pagination.total > 0 && (
          <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
            <p className="text-xs text-white/40">Página {page} de {pageCount} · {data.pagination.total} registro(s)</p>
            <div className="flex gap-2"><button aria-label="Página anterior" disabled={page <= 1 || loading} onClick={() => setPage((value) => Math.max(1, value - 1))} className="grid size-10 place-items-center rounded-full border border-white/10 disabled:opacity-30"><ChevronLeft size={17} /></button><button aria-label="Próxima página" disabled={page >= pageCount || loading} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="grid size-10 place-items-center rounded-full border border-white/10 disabled:opacity-30"><ChevronRight size={17} /></button></div>
          </div>
        )}
      </section>

      {creating && <StudentFormDialog onClose={() => setCreating(false)} onSaved={(student) => { setCreating(false); router.push(`/admin/alunos/${student.id}`); }} />}
    </div>
  );
}

function Metric({ label, value, wide = false }: { label: string; value: number; wide?: boolean }) {
  return <article className={`rounded-2xl border border-white/10 bg-[#0e0e0e] p-4 ${wide ? "col-span-2 xl:col-span-1" : ""}`}><div className="flex items-start justify-between gap-3"><p className="text-xs font-bold text-white/45">{label}</p><UsersRound size={16} className="text-gold" /></div><p className="mt-3 font-display text-3xl font-extrabold">{value}</p></article>;
}
