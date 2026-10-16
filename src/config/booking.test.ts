import assert from "node:assert/strict";
import test from "node:test";

import { getGoogleBookingConfig } from "./booking";

test("aceita somente páginas oficiais de agendamento do Google", () => {
  const full = getGoogleBookingConfig({
    NEXT_PUBLIC_GOOGLE_BOOKING_URL:
      "https://calendar.google.com/calendar/appointments/schedules/example?gv=true",
  });
  const short = getGoogleBookingConfig({
    NEXT_PUBLIC_GOOGLE_BOOKING_URL: "https://calendar.app.google/example",
  });

  assert.equal(full.status, "ready");
  assert.equal(short.status, "ready");
});

test("rejeita URL externa, credenciais na URL e calendário público comum", () => {
  for (const value of [
    "https://example.com/calendar",
    "https://user:secret@calendar.google.com/calendar/appointments/schedules/x",
    "https://calendar.google.com/calendar/embed?src=private",
  ]) {
    assert.deepEqual(
      getGoogleBookingConfig({ NEXT_PUBLIC_GOOGLE_BOOKING_URL: value }),
      { status: "invalid" },
    );
  }
});
