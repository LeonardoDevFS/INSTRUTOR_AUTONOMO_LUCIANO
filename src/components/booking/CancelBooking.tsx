"use client";

import { CalendarX2, Check, LoaderCircle, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

import { ActionLink } from "@/components/ui/ActionLink";
import { createWhatsAppUrl, whatsappMessages } from "@/lib/whatsapp";

type CancellationStatus =
  | "confirmed"
  | "cancellation_pending"
  | "cancelled";

type ReservationSummary = {
  serviceName: string;
  startsAt: string;
  endsAt: string;
  status: CancellationStatus;
};

type CancellationPayload = {
  error?: string;
  code?: string;
  cancelled?: boolean;
  reservation?: ReservationSummary;
};

function tokenFromFragment() {
  const params = new URLSearchParams(window.location.hash.slice(1));
  return params.get("token") ?? "";
}

function subscribeToFragment(onStoreChange: () => void) {
  window.addEventListener("hashchange", onStoreChange);
  return () => window.removeEventListener("hashchange", onStoreChange);
}

async function cancellationRequest(action: "inspect" | "cancel", token: string) {
  const response = await fetch("/api/booking/cancellations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, token }),
  });
  const payload = (await response.json()) as CancellationPayload;
  if (!response.ok) {
    throw new Error(
      payload.error ?? "Não foi possível consultar este agendamento.",
    );
  }
  return payload;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

export function CancelBooking() {
  const token = useSyncExternalStore(
    subscribeToFragment,
    tokenFromFragment,
    () => "",
  );
  const [reservation, setReservation] = useState<ReservationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      const timeout = window.setTimeout(() => {
        setError(
          "O link seguro de cancelamento não foi encontrado. Use o acesso exibido após a confirmação da reserva.",
        );
        setLoading(false);
      }, 0);
      return () => window.clearTimeout(timeout);
    }

    cancellationRequest("inspect", token)
      .then((payload) => setReservation(payload.reservation ?? null))
      .catch((cause: unknown) =>
        setError(
          cause instanceof Error
            ? cause.message
            : "Não foi possível consultar este agendamento.",
        ),
      )
      .finally(() => setLoading(false));
  }, [token]);

  async function cancel() {
    if (!token) return;
    setCancelling(true);
    setError("");
    try {
      const payload = await cancellationRequest("cancel", token);
      if (payload.reservation) setReservation(payload.reservation);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível concluir o cancelamento.",
      );
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-64 place-items-center text-gold" role="status">
        <LoaderCircle className="animate-spin" aria-hidden="true" />
        <span className="sr-only">Consultando agendamento</span>
      </div>
    );
  }

  const cancelled = reservation?.status === "cancelled";
  const pending = reservation?.status === "cancellation_pending";

  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#0d0d0d] p-6 sm:p-10">
      <span
        className={`grid size-14 place-items-center rounded-2xl ${cancelled ? "bg-emerald-400 text-black" : "bg-gold/10 text-gold"}`}
      >
        {cancelled ? <Check aria-hidden="true" /> : <CalendarX2 aria-hidden="true" />}
      </span>
      <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.25em] text-gold">
        {cancelled ? "Reserva cancelada" : "Cancelamento seguro"}
      </p>
      <h1 className="mt-3 font-display text-4xl font-extrabold uppercase leading-none text-white sm:text-5xl">
        {cancelled
          ? "Seu horário foi cancelado."
          : "Revise antes de cancelar."}
      </h1>

      {reservation && (
        <dl className="mt-7 grid gap-4 rounded-2xl border border-white/10 bg-black/25 p-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-white/35">Atendimento</dt>
            <dd className="mt-1 font-bold text-white/75">{reservation.serviceName}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-white/35">Data e horário</dt>
            <dd className="mt-1 capitalize text-white/75">{formatDateTime(reservation.startsAt)}</dd>
          </div>
        </dl>
      )}

      {pending && (
        <p role="status" className="mt-6 rounded-2xl border border-gold/25 bg-gold/[0.07] p-4 text-sm leading-6 text-white/65">
          O cancelamento está pendente de sincronização com o Google. O horário
          continua bloqueado até a confirmação, para evitar outra reserva no
          mesmo período.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-6 rounded-2xl border border-red-400/25 bg-red-400/[0.08] p-4 text-sm leading-6 text-red-100">
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {reservation && !cancelled && (
          <button
            type="button"
            disabled={cancelling}
            onClick={() => void cancel()}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-red-500 px-6 text-sm font-extrabold text-white hover:bg-red-400 disabled:opacity-50"
          >
            {cancelling && <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />}
            {pending ? "Tentar sincronizar novamente" : "Confirmar cancelamento"}
          </button>
        )}
        <Link
          href="/agendar"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-bold text-white"
        >
          Voltar para a agenda
        </Link>
        <ActionLink
          href={createWhatsAppUrl(whatsappMessages.booking)}
          external
          variant="secondary"
          icon={<MessageCircle size={17} aria-hidden="true" />}
          ariaLabel="Falar com Luciano pelo WhatsApp"
        >
          Preciso de ajuda
        </ActionLink>
      </div>

      <p className="mt-6 text-xs leading-5 text-white/35">
        Reservas feitas diretamente pela página do Google devem ser canceladas
        pelos controles e mensagens enviados pelo próprio Google.
      </p>
    </section>
  );
}
