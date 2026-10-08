"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AlertCircle, CalendarDays, Check, Clock3, LoaderCircle, MessageCircle } from "lucide-react";

import { services } from "@/data/services";
import type { AvailabilityResult } from "@/lib/calendar";
import { cn } from "@/lib/utils";
import { createWhatsAppUrl } from "@/lib/whatsapp";

const bookingServices = services.filter((service) =>
  ["carro", "moto", "habilitados", "prova-pratica", "mentoria"].includes(
    service.id,
  ),
);

function getTodayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function BookingFlow() {
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [serviceId, setServiceId] = useState(bookingServices[0]?.id ?? "");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadAvailability() {
      try {
        const response = await fetch(
          `/api/availability?startDate=${getTodayIsoDate()}`,
          { signal: controller.signal, cache: "no-store" },
        );

        if (!response.ok) {
          throw new Error("Não foi possível carregar os horários.");
        }

        const data = (await response.json()) as AvailabilityResult;
        setAvailability(data);
        setSelectedDate(data.days[0]?.date ?? "");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    }

    void loadAvailability();

    return () => controller.abort();
  }, []);

  const selectedDay = useMemo(
    () => availability?.days.find((day) => day.date === selectedDate),
    [availability, selectedDate],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const service = bookingServices.find((item) => item.id === serviceId);
    const name = String(formData.get("name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();

    if (!service || !selectedDay || !selectedTime || !name || !phone) {
      return;
    }

    const message = [
      "Olá, Luciano! Gostaria de solicitar um horário de aula.",
      `Serviço: ${service.title}`,
      `Data de preferência: ${selectedDay.weekday}, ${selectedDay.label}`,
      `Horário de preferência: ${selectedTime}`,
      `Nome: ${name}`,
      `Telefone: ${phone}`,
      "Entendo que o horário ainda precisa ser confirmado.",
    ].join("\n");

    window.open(createWhatsAppUrl(message), "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <fieldset>
        <legend className="font-display text-3xl font-extrabold uppercase text-white">
          1. Escolha o serviço
        </legend>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {bookingServices.map((service) => (
            <label
              key={service.id}
              className={cn(
                "cursor-pointer rounded-2xl border p-4 transition",
                serviceId === service.id
                  ? "border-gold bg-gold/10"
                  : "border-white/10 bg-white/[0.025] hover:border-white/25",
              )}
            >
              <input
                type="radio"
                name="service"
                value={service.id}
                checked={serviceId === service.id}
                onChange={() => setServiceId(service.id)}
                className="sr-only"
              />
              <span className="flex items-center justify-between gap-3 font-bold text-white">
                {service.title}
                {serviceId === service.id && (
                  <Check size={17} className="text-gold" aria-hidden="true" />
                )}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-display text-3xl font-extrabold uppercase text-white">
          2. Escolha um dia de preferência
        </legend>
        {loading && (
          <p className="mt-5 flex items-center gap-2 text-sm text-white/50">
            <LoaderCircle className="animate-spin text-gold" size={18} aria-hidden="true" />
            Carregando opções…
          </p>
        )}
        {loadError && (
          <p className="mt-5 flex items-center gap-2 text-sm text-red-300">
            <AlertCircle size={18} aria-hidden="true" />
            Não foi possível carregar as opções. Tente novamente ou use o WhatsApp.
          </p>
        )}
        {availability && (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {availability.days.slice(0, 12).map((day) => (
              <button
                key={day.date}
                type="button"
                onClick={() => {
                  setSelectedDate(day.date);
                  setSelectedTime("");
                }}
                aria-pressed={selectedDate === day.date}
                className={cn(
                  "rounded-2xl border p-4 text-left transition",
                  selectedDate === day.date
                    ? "border-gold bg-gold text-black"
                    : "border-white/10 bg-white/[0.025] text-white hover:border-white/25",
                )}
              >
                <span className="block text-xs font-bold uppercase">{day.weekday}</span>
                <span className="mt-1 block font-display text-xl font-bold uppercase">{day.label}</span>
              </button>
            ))}
          </div>
        )}
      </fieldset>

      {selectedDay && (
        <fieldset>
          <legend className="font-display text-3xl font-extrabold uppercase text-white">
            3. Escolha um horário de preferência
          </legend>
          <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {selectedDay.slots.map((slot) => (
              <button
                key={slot.time}
                type="button"
                disabled={!slot.available}
                onClick={() => setSelectedTime(slot.time)}
                aria-pressed={selectedTime === slot.time}
                className={cn(
                  "min-h-12 rounded-xl border text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-35",
                  selectedTime === slot.time
                    ? "border-gold bg-gold text-black"
                    : "border-white/10 bg-white/[0.025] text-white hover:border-white/25",
                )}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="font-display text-3xl font-extrabold uppercase text-white">
          4. Informe seus dados
        </legend>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold text-white/70">
            Nome
            <input
              name="name"
              type="text"
              required
              autoComplete="name"
              className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-black px-4 text-white outline-none transition placeholder:text-white/25 focus:border-gold"
              placeholder="Seu nome"
            />
          </label>
          <label className="text-sm font-bold text-white/70">
            Telefone
            <input
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-black px-4 text-white outline-none transition placeholder:text-white/25 focus:border-gold"
              placeholder="(35) 99999-9999"
            />
          </label>
        </div>
      </fieldset>

      <div className="rounded-2xl border border-gold/25 bg-gold/[0.07] p-5 text-sm leading-6 text-white/60">
        <p className="flex items-start gap-3">
          <CalendarDays size={19} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
          Esta versão usa disponibilidade demonstrativa. Enviar a solicitação
          não reserva nem bloqueia o horário; Luciano confirma pelo WhatsApp.
        </p>
        <p className="mt-3 flex items-start gap-3">
          <Clock3 size={19} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
          Domingo é tratado somente por consulta direta e disponibilidade.
        </p>
      </div>

      <button
        type="submit"
        disabled={!selectedDate || !selectedTime}
        className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-gold px-8 font-extrabold text-black transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        Enviar solicitação pelo WhatsApp
        <MessageCircle size={19} aria-hidden="true" />
      </button>
    </form>
  );
}
