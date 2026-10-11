"use client";

import { Archive, ArrowLeft, Check, LoaderCircle, Pencil, Plus, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { StatusMessage } from "@/components/admin/StatusMessage";
import { StudentFormDialog } from "@/components/admin/StudentFormDialog";
import type { ContractStatus, LessonStatus, PaymentMethod, PaymentStatus, ProcessType, SkillLevel, StudentWorkspace, TrainingCategory } from "@/lib/students/types";

type Tab = "overview" | "lessons" | "skills" | "license" | "finance" | "notes";

const tabLabels: Record<Tab, string> = { overview: "Visão geral", lessons: "Aulas", skills: "Evolução", license: "Habilitação", finance: "Financeiro", notes: "Anotações" };
const lessonLabels: Record<LessonStatus, string> = { scheduled: "Agendada", completed: "Realizada", cancelled: "Cancelada", no_show: "Falta" };
const levelLabels: Record<SkillLevel, string> = { not_assessed: "Não avaliado", learning: "Em aprendizagem", developing: "Em desenvolvimento", autonomous: "Executa com autonomia" };
const processLabels: Record<ProcessType, string> = { first_license: "Primeira habilitação", category_addition: "Adição de categoria", licensed_training: "Treinamento para habilitados", practical_test: "Preparação para prova prática" };
const contractLabels: Record<ContractStatus, string> = { pending: "Pendente", partial: "Parcial", paid: "Pago", cancelled: "Cancelado" };
const paymentLabels: Record<PaymentStatus, string> = { pending: "Pendente", paid: "Pago", cancelled: "Cancelado" };
const paymentMethodLabels: Record<PaymentMethod, string> = { pix: "Pix", cash: "Dinheiro", debit: "Débito", credit: "Crédito" };

function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatMoney(value: string) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value));
}

export function StudentProfile({ studentId }: { studentId: string }) {
  const router = useRouter();
  const [workspace, setWorkspace] = useState<StudentWorkspace | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/students/${studentId}`, { cache: "no-store" });
      const payload = await response.json().catch(() => ({})) as { error?: string; workspace?: StudentWorkspace };
      if (!response.ok) throw new Error(payload.error || "Não foi possível carregar a ficha.");
      if (!payload.workspace) throw new Error("A ficha não foi retornada pelo servidor.");
      setWorkspace(payload.workspace);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao carregar a ficha.");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function record(body: unknown) {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/students/${studentId}/records`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const payload = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Não foi possível salvar o registro.");
      await load();
      return true;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Falha ao salvar o registro.";
      setError(message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function archive() {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/students/${studentId}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmStudentId: studentId }) });
      const payload = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Não foi possível arquivar o aluno.");
      router.push("/admin/alunos");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao arquivar o aluno.");
      setSaving(false);
    }
  }

  const nextLesson = useMemo(() => workspace?.lessons
    .filter((lesson) => lesson.status === "scheduled" && new Date(lesson.startsAt) >= new Date())
    .sort((left, right) => left.startsAt.localeCompare(right.startsAt))[0], [workspace]);

  if (loading && !workspace) return <StatusMessage type="loading" title="Carregando ficha do aluno…" />;
  if (!workspace) return <StatusMessage type="error" title="Ficha indisponível"><p>{error}</p><Link href="/admin/alunos" className="mt-4 inline-block font-bold text-gold">Voltar para alunos</Link></StatusMessage>;

  const { student } = workspace;
  return (
    <div>
      <Link href="/admin/alunos" className="inline-flex items-center gap-2 text-sm font-bold text-white/50 hover:text-gold"><ArrowLeft size={17} />Voltar para alunos</Link>
      <header className="mt-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-gold/25 bg-gold/[0.08] px-3 py-1 text-xs font-extrabold text-gold">Categoria {student.trainingCategory}</span><span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-white/55">{student.status === "active" ? "Ativo" : student.status === "inactive" ? "Inativo" : "Concluído"}</span></div>
          <h1 className="mt-4 font-display text-4xl font-extrabold uppercase leading-none sm:text-5xl">{student.fullName}</h1>
          <p className="mt-3 text-sm text-white/45">{student.serviceType}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row"><button onClick={() => setEditing(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 px-5 text-sm font-bold hover:border-gold/50"><Pencil size={16} />Editar ficha</button><button onClick={() => setConfirmArchive(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-red-400/25 px-5 text-sm font-bold text-red-200"><Archive size={16} />Arquivar</button></div>
      </header>

      <nav aria-label="Seções da ficha" className="mt-8 flex gap-2 overflow-x-auto border-b border-white/10 pb-3">
        {(Object.keys(tabLabels) as Tab[]).map((item) => <button key={item} onClick={() => setTab(item)} aria-current={tab === item ? "page" : undefined} className={`min-h-10 shrink-0 rounded-full px-4 text-xs font-extrabold ${tab === item ? "bg-gold text-black" : "border border-white/10 text-white/50 hover:text-white"}`}>{tabLabels[item]}</button>)}
      </nav>

      {error && <p role="alert" aria-live="assertive" className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">{error}</p>}
      <div className="mt-6">
        {tab === "overview" && <Overview workspace={workspace} nextLesson={nextLesson} record={record} saving={saving} />}
        {tab === "lessons" && <Lessons workspace={workspace} record={record} saving={saving} />}
        {tab === "skills" && <Skills workspace={workspace} record={record} saving={saving} />}
        {tab === "license" && <License workspace={workspace} record={record} saving={saving} />}
        {tab === "finance" && <Finance workspace={workspace} record={record} saving={saving} />}
        {tab === "notes" && <Notes workspace={workspace} record={record} saving={saving} />}
      </div>

      {editing && <StudentFormDialog student={student} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); void load(); }} />}
      {confirmArchive && <ConfirmDialog title="Arquivar este aluno?" description="A ficha sairá da listagem ativa, mas aulas, pagamentos, evolução e auditoria serão preservados." busy={saving} onCancel={() => setConfirmArchive(false)} onConfirm={() => void archive()} />}
    </div>
  );
}

function Overview({ workspace, nextLesson, record, saving }: { workspace: StudentWorkspace; nextLesson?: StudentWorkspace["lessons"][number]; record: (body: unknown) => Promise<boolean>; saving: boolean }) {
  const [reservationId, setReservationId] = useState("");
  return <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
    <section className="rounded-3xl border border-white/10 bg-[#0e0e0e] p-6"><SectionTitle title="Informações básicas" /><dl className="mt-5 grid gap-5 sm:grid-cols-2"><Detail label="Telefone" value={workspace.student.phone} /><Detail label="E-mail" value={workspace.student.email ?? "Não informado"} /><Detail label="Nascimento" value={workspace.student.birthDate ? new Date(`${workspace.student.birthDate}T12:00:00`).toLocaleDateString("pt-BR") : "Não informado"} /><Detail label="Cadastro" value={new Date(workspace.student.createdAt).toLocaleDateString("pt-BR")} /></dl></section>
    <section className="rounded-3xl border border-white/10 bg-[#0e0e0e] p-6"><SectionTitle title="Próximo compromisso" />{nextLesson ? <div className="mt-5"><p className="font-extrabold">{nextLesson.modality}</p><p className="mt-2 text-sm text-white/50">{formatDateTime(nextLesson.startsAt)} · {nextLesson.durationMinutes} min</p></div> : <p className="mt-5 text-sm text-white/45">Nenhuma aula futura registrada.</p>}</section>
    <section className="rounded-3xl border border-white/10 bg-[#0e0e0e] p-6 xl:col-span-2"><SectionTitle title="Reservas do site" /><p className="mt-2 text-sm text-white/45">O vínculo é sempre manual. Nenhum aluno é associado apenas por nome, telefone ou e-mail.</p>{workspace.reservations.length > 0 && <div className="mt-5 space-y-2">{workspace.reservations.map((item) => <div key={item.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">{item.serviceId}</p><p className="mt-1 text-xs text-white/45">{formatDateTime(item.startsAt)}</p></div><button disabled={saving} onClick={() => void record({ action: "reservation.unlink", data: { reservationId: item.id } })} className="min-h-10 rounded-full border border-red-400/20 px-4 text-xs font-bold text-red-200">Desvincular</button></div>)}</div>}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row"><select value={reservationId} onChange={(event) => setReservationId(event.target.value)} className="admin-input"><option value="">Selecione uma reserva confirmada</option>{workspace.availableReservations.map((item) => <option key={item.id} value={item.id}>{formatDateTime(item.startsAt)} · {item.serviceId}</option>)}</select><button disabled={!reservationId || saving} onClick={() => void record({ action: "reservation.link", data: { reservationId } }).then((saved) => { if (saved) setReservationId(""); })} className="min-h-12 shrink-0 rounded-full bg-gold px-5 text-sm font-extrabold text-black disabled:opacity-40">Vincular reserva</button></div>
    </section>
  </div>;
}

function Lessons({ workspace, record, saving }: RecordPanelProps) {
  const [form, setForm] = useState({ modality: "", startsAt: "", durationMinutes: "50", content: "", notes: "" });
  async function submit(event: React.FormEvent) { event.preventDefault(); if (await record({ action: "lesson.create", data: { ...form, startsAt: new Date(form.startsAt).toISOString(), durationMinutes: Number(form.durationMinutes), status: "scheduled" } })) setForm({ modality: "", startsAt: "", durationMinutes: "50", content: "", notes: "" }); }
  return <div className="space-y-6"><section className="grid grid-cols-2 gap-3 lg:grid-cols-4">{(Object.keys(lessonLabels) as LessonStatus[]).map((status) => <Metric key={status} label={lessonLabels[status]} value={workspace.lessonCounts[status]} />)}</section><RecordCard title="Registrar aula"><form onSubmit={(event) => void submit(event)} className="mt-5 grid gap-4 md:grid-cols-2"><Field label="Modalidade"><input required value={form.modality} onChange={(event) => setForm({ ...form, modality: event.target.value })} className="admin-input" placeholder="Carro, moto ou mentoria" /></Field><Field label="Data e horário"><input required type="datetime-local" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} className="admin-input" /></Field><Field label="Duração em minutos"><input required type="number" min="10" max="480" value={form.durationMinutes} onChange={(event) => setForm({ ...form, durationMinutes: event.target.value })} className="admin-input" /></Field><Field label="Conteúdo trabalhado"><input maxLength={2000} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} className="admin-input" /></Field><div className="md:col-span-2"><Field label="Observações"><textarea rows={3} maxLength={3000} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="admin-input resize-none" /></Field></div><Submit busy={saving} label="Registrar aula" /></form></RecordCard><RecordCard title="Histórico de aulas">{workspace.lessons.length ? <div className="mt-5 space-y-3">{workspace.lessons.map((lesson) => <article key={lesson.id} className="rounded-2xl border border-white/10 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-extrabold">{lesson.modality}</p><p className="mt-1 text-sm text-white/45">{formatDateTime(lesson.startsAt)} · {lesson.durationMinutes} min</p>{lesson.content && <p className="mt-3 text-sm text-white/65">{lesson.content}</p>}</div><select aria-label="Situação da aula" value={lesson.status} disabled={saving} onChange={(event) => void record({ action: "lesson.update", recordId: lesson.id, data: { status: event.target.value } })} className="admin-input sm:w-40">{(Object.keys(lessonLabels) as LessonStatus[]).map((status) => <option key={status} value={status}>{lessonLabels[status]}</option>)}</select></div></article>)}</div> : <Empty text="Nenhuma aula registrada." />}</RecordCard></div>;
}

const skillsByCategory = {
  B: [["partida", "Partida"], ["embreagem", "Controle de embreagem"], ["troca-marchas", "Troca de marchas"], ["baliza", "Baliza"], ["estacionamento", "Estacionamento"], ["conversoes", "Conversões"], ["sinalizacao", "Sinalização"], ["percepcao-transito", "Percepção de trânsito"], ["direcao-defensiva", "Direção defensiva"]],
  A: [["equilibrio", "Equilíbrio"], ["comandos", "Comandos"], ["arrancada", "Arrancada"], ["frenagem", "Frenagem"], ["curvas", "Curvas"], ["baixa-velocidade", "Controle em baixa velocidade"], ["conducao-defensiva", "Condução defensiva"]],
} as const;

function Skills({ workspace, record, saving }: RecordPanelProps) {
  const [category, setCategory] = useState<"A" | "B">(workspace.student.trainingCategory === "A" ? "A" : "B");
  const firstSkill = skillsByCategory[category][0];
  const [skillCode, setSkillCode] = useState<string>(firstSkill[0]);
  const [level, setLevel] = useState<SkillLevel>("learning");
  const [comments, setComments] = useState("");
  const [assessedOn, setAssessedOn] = useState(today());
  const choices = skillsByCategory[category];
  async function submit(event: React.FormEvent) { event.preventDefault(); const skill = choices.find(([code]) => code === skillCode) ?? choices[0]; if (await record({ action: "skill.create", data: { vehicleCategory: category, skillCode: skill[0], skillLabel: skill[1], level, comments, assessedOn } })) setComments(""); }
  return <div className="space-y-6"><RecordCard title="Registrar avaliação"><p className="mt-2 text-sm text-white/45">Use níveis descritivos do treinamento. Este registro não representa diagnóstico médico.</p><form onSubmit={(event) => void submit(event)} className="mt-5 grid gap-4 md:grid-cols-2"><Field label="Categoria"><select value={category} onChange={(event) => { const value = event.target.value as "A" | "B"; setCategory(value); setSkillCode(skillsByCategory[value][0][0]); }} className="admin-input"><option value="A">Moto · A</option><option value="B">Carro · B</option></select></Field><Field label="Habilidade"><select value={skillCode} onChange={(event) => setSkillCode(event.target.value)} className="admin-input">{choices.map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></Field><Field label="Nível"><select value={level} onChange={(event) => setLevel(event.target.value as SkillLevel)} className="admin-input">{(Object.keys(levelLabels) as SkillLevel[]).map((item) => <option key={item} value={item}>{levelLabels[item]}</option>)}</select></Field><Field label="Data"><input type="date" required value={assessedOn} onChange={(event) => setAssessedOn(event.target.value)} className="admin-input" /></Field><div className="md:col-span-2"><Field label="Comentários"><textarea rows={3} maxLength={1500} value={comments} onChange={(event) => setComments(event.target.value)} className="admin-input resize-none" /></Field></div><Submit busy={saving} label="Registrar evolução" /></form></RecordCard><RecordCard title="Linha de evolução">{workspace.skills.length ? <div className="mt-5 space-y-3">{workspace.skills.map((item) => <article key={item.id} className="rounded-2xl border border-white/10 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><p className="font-extrabold">{item.skillLabel}</p><span className="rounded-full border border-gold/20 px-3 py-1 text-xs font-bold text-gold">{levelLabels[item.level]}</span></div><p className="mt-2 text-xs text-white/40">Categoria {item.vehicleCategory} · {new Date(`${item.assessedOn}T12:00:00`).toLocaleDateString("pt-BR")}</p>{item.comments && <p className="mt-3 text-sm leading-6 text-white/60">{item.comments}</p>}</article>)}</div> : <Empty text="Nenhuma avaliação registrada." />}</RecordCard></div>;
}

function License({ workspace, record, saving }: RecordPanelProps) {
  const [form, setForm] = useState<{ processType: ProcessType; category: TrainingCategory; statusLabel: string; steps: string; notes: string; startedOn: string }>({ processType: "first_license", category: workspace.student.trainingCategory, statusLabel: "", steps: "", notes: "", startedOn: today() });
  async function submit(event: React.FormEvent) { event.preventDefault(); if (await record({ action: "process.create", data: { ...form, steps: form.steps.split("\n").map((item) => item.trim()).filter(Boolean) } })) setForm({ ...form, statusLabel: "", steps: "", notes: "" }); }
  return <div className="space-y-6"><RecordCard title="Novo acompanhamento"><form onSubmit={(event) => void submit(event)} className="mt-5 grid gap-4 md:grid-cols-2"><Field label="Tipo de processo"><select value={form.processType} onChange={(event) => setForm({ ...form, processType: event.target.value as ProcessType })} className="admin-input">{(Object.keys(processLabels) as ProcessType[]).map((item) => <option key={item} value={item}>{processLabels[item]}</option>)}</select></Field><Field label="Categoria"><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as TrainingCategory })} className="admin-input"><option value="A">A</option><option value="B">B</option><option value="A+B">A+B</option></select></Field><Field label="Situação atual"><input required minLength={2} maxLength={80} value={form.statusLabel} onChange={(event) => setForm({ ...form, statusLabel: event.target.value })} className="admin-input" placeholder="Nomenclatura combinada" /></Field><Field label="Data de início"><input type="date" value={form.startedOn} onChange={(event) => setForm({ ...form, startedOn: event.target.value })} className="admin-input" /></Field><Field label="Etapas concluídas (uma por linha)"><textarea rows={4} value={form.steps} onChange={(event) => setForm({ ...form, steps: event.target.value })} className="admin-input resize-none" /></Field><Field label="Observações"><textarea rows={4} maxLength={2000} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="admin-input resize-none" /></Field><Submit busy={saving} label="Registrar processo" /></form></RecordCard><RecordCard title="Processos registrados">{workspace.processes.length ? <div className="mt-5 space-y-3">{workspace.processes.map((item) => <ProcessItem key={item.id} item={item} record={record} saving={saving} />)}</div> : <Empty text="Nenhum processo registrado." />}</RecordCard></div>;
}

function ProcessItem({ item, record, saving }: { item: StudentWorkspace["processes"][number]; record: (body: unknown) => Promise<boolean>; saving: boolean }) {
  const [statusLabel, setStatusLabel] = useState(item.statusLabel);
  return <article className="rounded-2xl border border-white/10 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-extrabold">{processLabels[item.processType]}</p><p className="mt-1 text-xs text-white/40">Categoria {item.category}</p></div><div className="flex gap-2"><input aria-label="Situação do processo" value={statusLabel} onChange={(event) => setStatusLabel(event.target.value)} className="admin-input sm:w-56" /><button aria-label="Salvar situação" disabled={saving || statusLabel.trim().length < 2} onClick={() => void record({ action: "process.update", recordId: item.id, data: { statusLabel } })} className="grid size-12 shrink-0 place-items-center rounded-xl bg-gold text-black disabled:opacity-40"><Save size={17} /></button></div></div>{item.steps.length > 0 && <ul className="mt-4 space-y-1 text-sm text-white/55">{item.steps.map((step, index) => <li key={`${step}-${index}`} className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-gold" />{step}</li>)}</ul>}</article>;
}

function Finance({ workspace, record, saving }: RecordPanelProps) {
  const [contract, setContract] = useState({ description: "", amount: "", lessonsCount: "", status: "pending" as ContractStatus, agreedOn: today(), notes: "" });
  const [payment, setPayment] = useState({ contractId: "", amount: "", method: "pix" as PaymentMethod, status: "paid" as PaymentStatus, paidOn: today(), notes: "" });
  async function addContract(event: React.FormEvent) { event.preventDefault(); if (await record({ action: "contract.create", data: contract })) setContract({ ...contract, description: "", amount: "", lessonsCount: "", notes: "" }); }
  async function addPayment(event: React.FormEvent) { event.preventDefault(); if (await record({ action: "payment.create", data: payment })) setPayment({ ...payment, amount: "", notes: "" }); }
  return <div className="space-y-6"><section className="grid gap-3 sm:grid-cols-3"><Metric label="Valor combinado" value={formatMoney(workspace.financial.agreed)} /><Metric label="Pagamentos" value={formatMoney(workspace.financial.paid)} /><Metric label="Saldo" value={formatMoney(workspace.financial.balance)} /></section><div className="grid gap-6 xl:grid-cols-2"><RecordCard title="Registrar condição comercial"><form onSubmit={(event) => void addContract(event)} className="mt-5 space-y-4"><Field label="Descrição"><input required value={contract.description} onChange={(event) => setContract({ ...contract, description: event.target.value })} className="admin-input" /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Valor combinado"><input required inputMode="decimal" value={contract.amount} onChange={(event) => setContract({ ...contract, amount: event.target.value })} className="admin-input" placeholder="0,00" /></Field><Field label="Quantidade de aulas"><input type="number" min="1" value={contract.lessonsCount} onChange={(event) => setContract({ ...contract, lessonsCount: event.target.value })} className="admin-input" /></Field><Field label="Situação"><select value={contract.status} onChange={(event) => setContract({ ...contract, status: event.target.value as ContractStatus })} className="admin-input">{(Object.keys(contractLabels) as ContractStatus[]).map((item) => <option key={item} value={item}>{contractLabels[item]}</option>)}</select></Field><Field label="Data combinada"><input type="date" value={contract.agreedOn} onChange={(event) => setContract({ ...contract, agreedOn: event.target.value })} className="admin-input" /></Field></div><Submit busy={saving} label="Registrar condição" /></form></RecordCard><RecordCard title="Registrar pagamento"><form onSubmit={(event) => void addPayment(event)} className="mt-5 space-y-4"><div className="grid gap-4 sm:grid-cols-2"><Field label="Valor"><input required inputMode="decimal" value={payment.amount} onChange={(event) => setPayment({ ...payment, amount: event.target.value })} className="admin-input" placeholder="0,00" /></Field><Field label="Método"><select value={payment.method} onChange={(event) => setPayment({ ...payment, method: event.target.value as PaymentMethod })} className="admin-input">{(Object.keys(paymentMethodLabels) as PaymentMethod[]).map((item) => <option key={item} value={item}>{paymentMethodLabels[item]}</option>)}</select></Field><Field label="Situação"><select value={payment.status} onChange={(event) => setPayment({ ...payment, status: event.target.value as PaymentStatus })} className="admin-input">{(Object.keys(paymentLabels) as PaymentStatus[]).map((item) => <option key={item} value={item}>{paymentLabels[item]}</option>)}</select></Field><Field label="Data"><input type="date" value={payment.paidOn} onChange={(event) => setPayment({ ...payment, paidOn: event.target.value })} className="admin-input" /></Field></div><Field label="Vincular à condição (opcional)"><select value={payment.contractId} onChange={(event) => setPayment({ ...payment, contractId: event.target.value })} className="admin-input"><option value="">Sem vínculo</option>{workspace.contracts.map((item) => <option key={item.id} value={item.id}>{item.description}</option>)}</select></Field><Submit busy={saving} label="Registrar pagamento" /></form></RecordCard></div><RecordCard title="Condições e lançamentos"><div className="mt-5 grid gap-5 xl:grid-cols-2"><div><p className="text-xs font-extrabold uppercase tracking-wider text-white/35">Condições</p><div className="mt-3 space-y-2">{workspace.contracts.map((item) => <article key={item.id} className="rounded-xl border border-white/10 p-4"><div className="flex justify-between gap-3"><p className="font-bold">{item.description}</p><p className="font-extrabold text-gold">{formatMoney(item.amount)}</p></div><div className="mt-3 flex items-center gap-3"><select aria-label="Situação da condição" value={item.status} disabled={saving} onChange={(event) => void record({ action: "contract.update", recordId: item.id, data: { status: event.target.value } })} className="admin-input"><option value="pending">Pendente</option><option value="partial">Parcial</option><option value="paid">Pago</option><option value="cancelled">Cancelado</option></select><span className="shrink-0 text-xs text-white/40">{new Date(`${item.agreedOn}T12:00:00`).toLocaleDateString("pt-BR")}</span></div></article>)}{!workspace.contracts.length && <Empty text="Nenhuma condição registrada." />}</div></div><div><p className="text-xs font-extrabold uppercase tracking-wider text-white/35">Pagamentos</p><div className="mt-3 space-y-2">{workspace.payments.map((item) => <article key={item.id} className="rounded-xl border border-white/10 p-4"><div className="flex justify-between gap-3"><p className="font-bold">{paymentMethodLabels[item.method]}</p><p className="font-extrabold text-emerald-300">{formatMoney(item.amount)}</p></div><div className="mt-3 flex items-center gap-3"><select aria-label="Situação do pagamento" value={item.status} disabled={saving} onChange={(event) => { const status = event.target.value as PaymentStatus; void record({ action: "payment.update", recordId: item.id, data: { status, ...(status === "paid" ? { paidOn: item.paidOn ?? today() } : {}) } }); }} className="admin-input"><option value="pending">Pendente</option><option value="paid">Pago</option><option value="cancelled">Cancelado</option></select>{item.paidOn && <span className="shrink-0 text-xs text-white/40">{new Date(`${item.paidOn}T12:00:00`).toLocaleDateString("pt-BR")}</span>}</div></article>)}{!workspace.payments.length && <Empty text="Nenhum pagamento registrado." />}</div></div></div></RecordCard></div>;
}

function Notes({ workspace, record, saving }: RecordPanelProps) {
  const [content, setContent] = useState("");
  async function submit(event: React.FormEvent) { event.preventDefault(); if (await record({ action: "note.create", data: { content } })) setContent(""); }
  return <div className="space-y-6"><RecordCard title="Nova anotação"><form onSubmit={(event) => void submit(event)} className="mt-5"><Field label="Observação administrativa"><textarea required minLength={2} maxLength={3000} rows={4} value={content} onChange={(event) => setContent(event.target.value)} className="admin-input resize-none" /></Field><div className="mt-4"><Submit busy={saving} label="Salvar anotação" /></div></form></RecordCard><RecordCard title="Histórico cronológico">{workspace.notes.length ? <ol className="mt-5 space-y-3">{workspace.notes.map((note) => <li key={note.id} className="rounded-2xl border border-white/10 p-4"><p className="whitespace-pre-wrap text-sm leading-6 text-white/70">{note.content}</p><p className="mt-3 text-xs text-white/35">{formatDateTime(note.createdAt)} · {note.authorEmail}</p></li>)}</ol> : <Empty text="Nenhuma anotação registrada." />}</RecordCard></div>;
}

type RecordPanelProps = { workspace: StudentWorkspace; record: (body: unknown) => Promise<boolean>; saving: boolean };
function SectionTitle({ title }: { title: string }) { return <h2 className="text-lg font-extrabold">{title}</h2>; }
function RecordCard({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-3xl border border-white/10 bg-[#0e0e0e] p-5 sm:p-6"><SectionTitle title={title} />{children}</section>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.12em] text-white/40">{label}</span>{children}</label>; }
function Detail({ label, value }: { label: string; value: string }) { return <div><dt className="text-[0.65rem] font-extrabold uppercase tracking-wider text-white/35">{label}</dt><dd className="mt-1 break-words text-sm font-bold text-white/75">{value}</dd></div>; }
function Empty({ text }: { text: string }) { return <p className="mt-5 rounded-2xl border border-dashed border-white/10 p-5 text-sm text-white/40">{text}</p>; }
function Metric({ label, value }: { label: string; value: string | number }) { return <article className="rounded-2xl border border-white/10 bg-[#0e0e0e] p-4"><p className="text-xs font-bold text-white/40">{label}</p><p className="mt-2 font-display text-3xl font-extrabold">{value}</p></article>; }
function Submit({ busy, label }: { busy: boolean; label: string }) { return <button disabled={busy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gold px-5 text-sm font-extrabold text-black disabled:opacity-40">{busy ? <LoaderCircle size={16} className="animate-spin" /> : <Plus size={16} />}{label}</button>; }
function ConfirmDialog({ title, description, busy, onCancel, onConfirm }: { title: string; description: string; busy: boolean; onCancel: () => void; onConfirm: () => void }) { return <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-5 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111] p-6"><h2 id="confirm-title" className="text-xl font-extrabold">{title}</h2><p className="mt-3 text-sm leading-6 text-white/50">{description}</p><div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button onClick={onCancel} className="min-h-11 rounded-full border border-white/15 px-5 text-sm font-bold">Cancelar</button><button disabled={busy} onClick={onConfirm} className="min-h-11 rounded-full bg-red-500 px-5 text-sm font-extrabold text-white disabled:opacity-50">{busy ? "Arquivando…" : "Confirmar arquivamento"}</button></div></section></div>; }
