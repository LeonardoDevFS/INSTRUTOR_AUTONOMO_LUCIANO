"use client";

import {
  Bike,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileText,
  LoaderCircle,
  Route,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import type { BookingService } from "@/config/public-booking";

type Slot = { time: string; start: string; end: string };
type BookingDay = { date: string; available: boolean; slots: Slot[] };
type BookingApiPayload = {
  error?: string;
  code?: string;
  days?: BookingDay[];
  cancellationPath?: string;
};
type FormData = {
  name: string;
  email: string;
  phone: string;
  notes: string;
  privacyAccepted: boolean;
  website: string;
};

const stepLabels = ["Atendimento", "Data", "Horário", "Seus dados", "Revisão"];
const emptyForm: FormData = {
  name: "",
  email: "",
  phone: "",
  notes: "",
  privacyAccepted: false,
  website: "",
};
const icons = {
  car: Car,
  bike: Bike,
  badge: ClipboardCheck,
  route: Route,
  file: FileText,
  shield: ShieldCheck,
};

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function createCancellationToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

function moveMonth(month: string, amount: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  const value = new Date(year, monthNumber - 1 + amount, 1);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
}

function monthDays(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const firstWeekday = new Date(year, monthNumber - 1, 1).getDay();
  const count = new Date(year, monthNumber, 0).getDate();
  return [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from(
      { length: count },
      (_, index) =>
        `${year}-${String(monthNumber).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`,
    ),
  ];
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

async function readBookingPayload(response: Response) {
  try {
    return (await response.json()) as BookingApiPayload;
  } catch {
    return {} satisfies BookingApiPayload;
  }
}

function bookingErrorMessage(payload: BookingApiPayload, fallback: string) {
  if (payload.code === "BOOKING_GOOGLE_AUTH_UNAVAILABLE") {
    return "A agenda precisa ser reconectada. Use o agendamento pelo Google enquanto isso.";
  }
  if (payload.code === "BOOKING_DATABASE_UNAVAILABLE") {
    return "A agenda está temporariamente indisponível. Tente novamente em instantes.";
  }
  if (payload.error) return payload.error;
  return fallback;
}

export function CustomBooking({
  services,
  ready,
}: {
  services: BookingService[];
  ready: boolean;
}) {
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState("");
  const [month, setMonth] = useState(currentMonthKey);
  const [days, setDays] = useState<BookingDay[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [cancellationToken, setCancellationToken] = useState("");
  const [cancellationPath, setCancellationPath] = useState("");
  const [availabilityVersion, setAvailabilityVersion] = useState(0);
  const service = services.find((item) => item.id === serviceId);

  useEffect(() => {
    if (!ready || !serviceId || step < 2) return;
    const controller = new AbortController();
    fetch(
      `/api/booking/availability?month=${encodeURIComponent(month)}&serviceId=${encodeURIComponent(serviceId)}`,
      { cache: "no-store", signal: controller.signal },
    )
      .then(async (response) => {
        const payload = await readBookingPayload(response);
        if (!response.ok) {
          throw new Error(
            bookingErrorMessage(
              payload,
              "Não foi possível consultar os horários.",
            ),
          );
        }
        setDays(payload.days ?? []);
      })
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setError(
          cause instanceof Error
            ? cause.message
            : "Não foi possível consultar os horários.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [availabilityVersion, month, ready, serviceId, step]);

  const selectedDay = days.find((day) => day.date === selectedDate);
  const calendarDays = useMemo(() => monthDays(month), [month]);

  function chooseService(id: string) {
    setServiceId(id);
    setSelectedDate("");
    setSelectedSlot(null);
    setDays([]);
    setIdempotencyKey("");
    setCancellationToken("");
  }

  function goBack() {
    setError("");
    if (step === 3) setLoading(true);
    setStep((current) => Math.max(1, current - 1));
  }

  function goForward() {
    setError("");
    if (step === 1 && (!service?.active || !ready)) return;
    if (step === 2 && !selectedDate) return;
    if (step === 3 && !selectedSlot) return;
    if (step === 1) setLoading(true);
    setStep((current) => Math.min(5, current + 1));
  }

  function submitData(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.privacyAccepted) return;
    goForward();
  }

  async function confirmBooking() {
    if (!service || !selectedSlot || !selectedDate) return;
    const attemptKey = idempotencyKey || crypto.randomUUID();
    const attemptCancellationToken =
      cancellationToken || createCancellationToken();
    setIdempotencyKey(attemptKey);
    setCancellationToken(attemptCancellationToken);
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/booking/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          date: selectedDate,
          time: selectedSlot.time,
          ...form,
          idempotencyKey: attemptKey,
          cancellationToken: attemptCancellationToken,
        }),
      });
      const payload = await readBookingPayload(response);
      if (!response.ok) {
        if (
          payload.code === "SLOT_UNAVAILABLE" ||
          payload.code === "BOOKING_ALREADY_PROCESSED"
        ) {
          setIdempotencyKey("");
          setCancellationToken("");
          setSelectedSlot(null);
          setStep(3);
          setLoading(true);
          setAvailabilityVersion((current) => current + 1);
        }
        throw new Error(
          bookingErrorMessage(
            payload,
            "Não foi possível confirmar a reserva.",
          ),
        );
      }
      setCancellationPath(payload.cancellationPath ?? "");
      setSuccess(true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível confirmar a reserva.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (success && service && selectedSlot) {
    return (
      <section
        className="rounded-[2rem] border border-emerald-400/25 bg-emerald-400/[0.06] p-6 text-center sm:p-10"
        aria-live="polite"
      >
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-400 text-black">
          <Check size={30} aria-hidden="true" />
        </span>
        <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.28em] text-emerald-300">
          Reserva confirmada
        </p>
        <h2 className="mt-3 font-display text-4xl font-extrabold uppercase text-white">
          Horário registrado na agenda.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/60">
          {service.name}, {formatDate(selectedDate)}, às {selectedSlot.time}. O
          Google recebeu o pedido de envio do convite; confira também sua caixa de
          spam.
        </p>
        {cancellationPath && (
          <div className="mx-auto mt-7 max-w-2xl rounded-2xl border border-white/10 bg-black/25 p-5">
            <p className="text-sm leading-6 text-white/60">
              Guarde este acesso para cancelar com segurança, caso precise. O
              site não possui envio próprio de e-mail para recuperar esse link.
            </p>
            <Link
              href={cancellationPath}
              className="mt-4 inline-flex min-h-12 items-center justify-center rounded-full border border-red-300/35 px-6 text-sm font-extrabold text-red-100 hover:border-red-300/70"
            >
              Cancelar meu agendamento
            </Link>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d0d0d] shadow-2xl shadow-black/30">
      <div className="border-b border-white/10 p-5 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-gold">
              Agenda Direção Segura
            </p>
            <h2 className="mt-3 font-display text-4xl font-extrabold uppercase leading-none text-white sm:text-5xl">
              Monte seu agendamento.
            </h2>
          </div>
          <p className="max-w-lg text-sm leading-6 text-white/50">
            Escolha o atendimento, veja a disponibilidade real e revise tudo antes
            de confirmar.
          </p>
        </div>

        {!ready && (
          <div className="mt-6 rounded-2xl border border-gold/25 bg-gold/[0.07] p-4 text-sm leading-6 text-white/65">
            A nova agenda está preparada, mas permanece em validação técnica. Por
            enquanto, use a opção segura <strong className="text-gold">Agendar pelo Google</strong> logo abaixo.
          </div>
        )}

        <ol className="mt-7 grid grid-cols-5 gap-1" aria-label={`Etapa ${step} de 5`}>
          {stepLabels.map((label, index) => {
            const number = index + 1;
            return (
              <li key={label} className="min-w-0">
                <div
                  className={`h-1.5 rounded-full ${number <= step ? "bg-gold" : "bg-white/10"}`}
                />
                <span
                  className={`mt-2 hidden truncate text-[0.64rem] font-bold uppercase tracking-wider sm:block ${number === step ? "text-white" : number < step ? "text-gold" : "text-white/30"}`}
                >
                  {label}
                </span>
                <span className="sr-only">{number}. {label}</span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="p-5 sm:p-8">
        {step === 1 && (
          <div>
            <StepTitle number={1} title="Qual atendimento você procura?" />
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {services.map((item) => {
                const Icon = icons[item.icon];
                const selected = item.id === serviceId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={!item.active}
                    onClick={() => chooseService(item.id)}
                    aria-pressed={selected}
                    className={`group flex min-h-36 items-start gap-4 rounded-2xl border p-5 text-left transition ${selected ? "border-gold bg-gold/[0.09]" : item.active ? "border-white/10 bg-black/25 hover:border-gold/40" : "cursor-not-allowed border-white/[0.06] bg-black/15 opacity-55"}`}
                  >
                    <span
                      className={`grid size-11 shrink-0 place-items-center rounded-xl ${selected ? "bg-gold text-black" : "bg-gold/10 text-gold"}`}
                    >
                      <Icon size={21} aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block font-extrabold text-white">{item.name}</span>
                      <span className="mt-2 block text-sm leading-6 text-white/50">
                        {item.description}
                      </span>
                      <span className="mt-3 block text-xs font-bold uppercase tracking-wider text-gold">
                        {item.active && item.durationMinutes
                          ? `${item.durationMinutes} minutos`
                          : "Duração a confirmar • consulte pelo WhatsApp"}
                      </span>
                      {item.notice && (
                        <span className="mt-3 block text-xs leading-5 text-white/45">
                          {item.notice}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <StepTitle number={2} title="Escolha uma data disponível" />
            <div className="mx-auto mt-6 max-w-2xl rounded-3xl border border-white/10 bg-black/25 p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  aria-label="Mês anterior"
                  disabled={month <= currentMonthKey()}
                  onClick={() => {
                    setLoading(true);
                    setError("");
                    setMonth(moveMonth(month, -1));
                    setSelectedDate("");
                  }}
                  className="grid size-11 place-items-center rounded-full border border-white/10 disabled:opacity-25"
                >
                  <ChevronLeft size={18} />
                </button>
                <h3 className="font-extrabold capitalize text-white">
                  {new Intl.DateTimeFormat("pt-BR", {
                    month: "long",
                    year: "numeric",
                  }).format(new Date(`${month}-01T12:00:00`))}
                </h3>
                <button
                  type="button"
                  aria-label="Próximo mês"
                  onClick={() => {
                    setLoading(true);
                    setError("");
                    setMonth(moveMonth(month, 1));
                    setSelectedDate("");
                  }}
                  className="grid size-11 place-items-center rounded-full border border-white/10"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[0.65rem] font-extrabold uppercase text-white/35">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((label) => (
                  <span key={label} className="py-2">{label}</span>
                ))}
              </div>
              {loading ? (
                <div className="grid h-64 place-items-center text-gold">
                  <LoaderCircle className="animate-spin" aria-label="Consultando disponibilidade" />
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((date, index) => {
                    if (!date) return <span key={`empty-${index}`} />;
                    const day = days.find((item) => item.date === date);
                    const available = Boolean(day?.available);
                    const selected = selectedDate === date;
                    return (
                      <button
                        key={date}
                        type="button"
                        disabled={!available}
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedSlot(null);
                        }}
                        aria-label={`${formatDate(date)}${available ? ", disponível" : ", indisponível"}`}
                        aria-pressed={selected}
                        className={`aspect-square min-h-10 rounded-xl text-sm font-bold transition ${selected ? "bg-gold text-black" : available ? "bg-white/[0.06] text-white hover:bg-gold/15 hover:text-gold" : "text-white/20 line-through"}`}
                      >
                        {Number(date.slice(-2))}
                      </button>
                    );
                  })}
                </div>
              )}
              <p className="mt-4 text-center text-xs text-white/35">
                Datas sem horários livres ficam desativadas. Domingo é somente sob consulta.
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <StepTitle number={3} title="Escolha o horário" />
            <p className="mt-3 text-sm capitalize text-white/50">{formatDate(selectedDate)}</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {(selectedDay?.slots ?? []).map((slot) => (
                <button
                  key={slot.start}
                  type="button"
                  onClick={() => {
                    setSelectedSlot(slot);
                    setIdempotencyKey("");
                    setCancellationToken("");
                  }}
                  aria-pressed={selectedSlot?.start === slot.start}
                  className={`min-h-14 rounded-2xl border text-base font-extrabold transition ${selectedSlot?.start === slot.start ? "border-gold bg-gold text-black" : "border-white/10 bg-black/25 text-white hover:border-gold/45"}`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
            {!selectedDay?.slots.length && (
              <p className="mt-6 rounded-2xl border border-white/10 p-5 text-sm text-white/50">
                Não restam horários nessa data. Volte e selecione outro dia.
              </p>
            )}
          </div>
        )}

        {step === 4 && (
          <form id="booking-personal-data" onSubmit={submitData}>
            <StepTitle number={4} title="Informe seus dados" />
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Nome completo" required>
                <input required autoComplete="name" maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="admin-input" />
              </Field>
              <Field label="E-mail" required>
                <input required type="email" autoComplete="email" maxLength={160} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="admin-input" />
              </Field>
              <Field label="Telefone / WhatsApp" required>
                <input required type="tel" autoComplete="tel" maxLength={24} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="admin-input" />
              </Field>
              <Field label="Observações (opcional)">
                <textarea rows={4} maxLength={600} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="admin-input resize-y" />
              </Field>
              <div className="absolute -left-[10000px]" aria-hidden="true">
                <label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} /></label>
              </div>
            </div>
            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/55">
              <input required type="checkbox" checked={form.privacyAccepted} onChange={(event) => setForm({ ...form, privacyAccepted: event.target.checked })} className="mt-1 size-4 accent-[#e5b93f]" />
              <span>
                Concordo com o uso destes dados exclusivamente para o agendamento e atendimento, conforme a{" "}
                <Link href="/politica-de-privacidade" target="_blank" className="font-bold text-gold hover:text-gold-light">Política de Privacidade</Link>.
              </span>
            </label>
          </form>
        )}

        {step === 5 && service && selectedSlot && (
          <div>
            <StepTitle number={5} title="Revise antes de confirmar" />
            <dl className="mt-6 grid gap-4 rounded-3xl border border-white/10 bg-black/25 p-5 sm:grid-cols-2 sm:p-6">
              <Review label="Atendimento" value={service.name} />
              <Review label="Duração" value={`${service.durationMinutes} minutos`} />
              <Review label="Data" value={formatDate(selectedDate)} />
              <Review label="Horário" value={selectedSlot.time} />
              <Review label="Nome" value={form.name} />
              <Review label="Telefone" value={form.phone} />
              <Review label="E-mail" value={form.email} />
              {form.notes && <Review label="Observações" value={form.notes} />}
            </dl>
          </div>
        )}

        {error && (
          <p role="alert" aria-live="assertive" className="mt-6 rounded-2xl border border-red-400/25 bg-red-400/[0.08] p-4 text-sm text-red-200">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-between">
          <button type="button" onClick={goBack} disabled={step === 1 || submitting} className="min-h-12 rounded-full border border-white/15 px-6 text-sm font-bold text-white disabled:invisible">
            Voltar
          </button>
          {step < 5 ? (
            <button
              type={step === 4 ? "submit" : "button"}
              form={step === 4 ? "booking-personal-data" : undefined}
              onClick={step === 4 ? undefined : goForward}
              disabled={!ready || (step === 1 && !serviceId) || (step === 2 && !selectedDate) || (step === 3 && !selectedSlot)}
              className="min-h-12 rounded-full bg-gold px-7 text-sm font-extrabold text-black transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-35"
            >
              {!ready && step === 1 ? "Agenda em validação" : "Continuar"}
            </button>
          ) : (
            <button type="button" onClick={() => void confirmBooking()} disabled={submitting} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gold px-7 text-sm font-extrabold text-black transition hover:bg-gold-light disabled:opacity-50">
              {submitting && <LoaderCircle size={17} className="animate-spin" />}
              Confirmar agendamento
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function StepTitle({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold text-sm font-black text-black">{number}</span>
      <h3 className="font-display text-3xl font-extrabold uppercase text-white sm:text-4xl">{title}</h3>
    </div>
  );
}

function Field({ label, required = false, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="text-sm font-bold text-white/70">
      {label}{required && <span className="text-gold"> *</span>}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function Review({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-white/35">{label}</dt>
      <dd className="mt-1 break-words text-sm font-bold text-white/75">{value}</dd>
    </div>
  );
}
