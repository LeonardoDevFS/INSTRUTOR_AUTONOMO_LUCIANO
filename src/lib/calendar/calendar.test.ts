import assert from "node:assert/strict";
import test from "node:test";

import {
  classifyEvent,
  findConflicts,
  isManagedBlock,
  isRecurringEvent,
  serializeCalendarEvent,
} from "./business";
import { BLOCK_MARKER_KEY, BLOCK_MARKER_VALUE, getBlockEventId } from "./constants";
import { toGoogleEventRange, zonedLocalToUtc } from "./date-time";
import { blockInputSchema } from "./schemas";

test("converte horário de São Paulo para UTC", () => {
  assert.equal(
    zonedLocalToUtc("2026-10-15", "09:00").toISOString(),
    "2026-10-15T12:00:00.000Z",
  );
});

test("bloqueio de dia inteiro termina no dia seguinte", () => {
  const range = toGoogleEventRange({
    date: "2026-10-15",
    startTime: "09:00",
    endTime: "10:00",
    allDay: true,
  });
  assert.deepEqual(range.start, { date: "2026-10-15" });
  assert.deepEqual(range.end, { date: "2026-10-16" });
});

test("gera ID determinístico aceito pelo Google para evitar duplicidade", () => {
  assert.equal(
    getBlockEventId("6ba7b810-9dad-11d1-80b4-00c04fd430c8"),
    "ds6ba7b8109dad11d180b400c04fd430c8",
  );
});

test("validação rejeita duração zero e data inexistente", () => {
  const result = blockInputSchema.safeParse({
    date: "2026-02-30",
    startTime: "09:00",
    endTime: "09:00",
    allDay: false,
    reason: "intervalo",
    requestId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    confirmConflicts: false,
  });
  assert.equal(result.success, false);
});

test("identifica bloqueio próprio, participante e recorrência", () => {
  const block = {
    extendedProperties: { private: { [BLOCK_MARKER_KEY]: BLOCK_MARKER_VALUE } },
  };
  assert.equal(isManagedBlock(block), true);
  assert.equal(classifyEvent(block), "block");
  assert.equal(classifyEvent({ attendees: [{ email: "aluno@example.com" }] }), "participant");
  assert.equal(isRecurringEvent({ recurringEventId: "serie-1" }), true);
});

test("detecta sobreposição sem considerar eventos transparentes", () => {
  const events = [
    {
      id: "ocupado",
      start: { dateTime: "2026-10-15T09:00:00-03:00" },
      end: { dateTime: "2026-10-15T10:00:00-03:00" },
    },
    {
      id: "livre",
      transparency: "transparent" as const,
      start: { dateTime: "2026-10-15T09:00:00-03:00" },
      end: { dateTime: "2026-10-15T10:00:00-03:00" },
    },
  ];
  const conflicts = findConflicts(
    events,
    new Date("2026-10-15T12:30:00Z"),
    new Date("2026-10-15T13:30:00Z"),
  );
  assert.deepEqual(conflicts.map((event) => event.id), ["ocupado"]);
});

test("expõe apenas campos realmente presentes na descrição do evento", () => {
  const event = serializeCalendarEvent({
    id: "reserva-1",
    summary: "Compromisso",
    start: { dateTime: "2026-10-15T09:00:00-03:00" },
    end: { dateTime: "2026-10-15T09:50:00-03:00" },
    description: "Telefone: (35) 99999-0000<br>Serviço: Aula de carro<br>Texto livre",
  });
  assert.deepEqual(event?.formFields, [
    { label: "Telefone", value: "(35) 99999-0000" },
    { label: "Serviço", value: "Aula de carro" },
  ]);
});
