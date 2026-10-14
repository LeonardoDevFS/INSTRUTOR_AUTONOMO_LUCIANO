import assert from "node:assert/strict";
import test from "node:test";

import type { BookingService, PublicBookingRuntimeConfig } from "@/config/public-booking";

import { buildSlotsForDate } from "./availability";

const service: BookingService = {
  id: "carro",
  name: "Aula de carro",
  description: "Teste",
  icon: "car",
  active: true,
  durationMinutes: 50,
};

const runtime: PublicBookingRuntimeConfig = {
  enabled: true,
  ready: true,
  minAdvanceMinutes: 60,
  maxAdvanceDays: 60,
  bufferMinutes: 0,
  closedDates: [],
};

test("gera horários de 50 minutos dentro do expediente", () => {
  const slots = buildSlotsForDate(
    "2026-10-12",
    service,
    runtime,
    [],
    [],
    new Date("2026-10-10T12:00:00Z"),
  );
  assert.equal(slots[0]?.time, "07:00");
  assert.equal(slots[1]?.time, "07:50");
  assert.equal(slots.at(-1)?.time, "18:40");
});

test("não oferece domingo nem data explicitamente fechada", () => {
  const now = new Date("2026-10-10T12:00:00Z");
  assert.equal(
    buildSlotsForDate("2026-10-11", service, runtime, [], [], now).length,
    0,
  );
  assert.equal(
    buildSlotsForDate(
      "2026-10-12",
      service,
      { ...runtime, closedDates: ["2026-10-12"] },
      [],
      [],
      now,
    ).length,
    0,
  );
});

test("remove horários sobrepostos por evento Google ou retenção persistente", () => {
  const now = new Date("2026-10-10T12:00:00Z");
  const events = [
    {
      start: { dateTime: "2026-10-12T07:00:00-03:00" },
      end: { dateTime: "2026-10-12T07:50:00-03:00" },
    },
  ];
  const reservations = [
    {
      start: new Date("2026-10-12T10:50:00Z"),
      end: new Date("2026-10-12T11:40:00Z"),
    },
  ];
  const slots = buildSlotsForDate(
    "2026-10-12",
    service,
    runtime,
    events,
    reservations,
    now,
  );
  assert.equal(slots.some((slot) => slot.time === "07:00"), false);
  assert.equal(slots.some((slot) => slot.time === "07:50"), false);
  assert.equal(slots.some((slot) => slot.time === "08:40"), true);
});

test("evento Google da categoria A bloqueia o horário da categoria B", () => {
  const now = new Date("2026-10-10T12:00:00Z");
  const events = [{
    start: { dateTime: "2026-10-15T15:00:00-03:00" },
    end: { dateTime: "2026-10-15T15:50:00-03:00" },
  }];
  const slots = buildSlotsForDate(
    "2026-10-15", { ...service, id: "carro-categoria-b" },
    { ...runtime, bufferMinutes: 10 }, events, [], now,
  );
  assert.equal(slots.some((slot) => slot.time === "15:00"), false);
  assert.equal(slots.some((slot) => slot.time === "16:00"), true);
});

test("reserva existente de outra categoria bloqueia todas as modalidades", () => {
  const reservations = [{
    start: new Date("2026-10-15T15:00:00-03:00"),
    end: new Date("2026-10-15T15:50:00-03:00"),
  }];
  const slots = buildSlotsForDate(
    "2026-10-15", { ...service, id: "moto-categoria-a" },
    { ...runtime, bufferMinutes: 10 }, [], reservations,
    new Date("2026-10-10T12:00:00Z"),
  );
  assert.equal(slots.some((slot) => slot.time === "15:00"), false);
  assert.equal(slots.some((slot) => slot.time === "16:00"), true);
});

test("margem de dez minutos impede eventos Google e retenções quase adjacentes", () => {
  const now = new Date("2026-10-10T12:00:00Z");
  const start = "2026-10-15T15:51:00-03:00";
  const end = "2026-10-15T15:55:00-03:00";
  const googleEvents = [{ start: { dateTime: start }, end: { dateTime: end } }];
  const reservations = [{ start: new Date(start), end: new Date(end) }];
  for (const [events, ranges] of [[googleEvents, []], [[], reservations]] as const) {
    const slots = buildSlotsForDate(
      "2026-10-15", service, { ...runtime, bufferMinutes: 10 },
      [...events], [...ranges], now,
    );
    assert.equal(slots.some((slot) => slot.time === "15:00"), false);
    assert.equal(slots.some((slot) => slot.time === "16:00"), false);
  }
});
