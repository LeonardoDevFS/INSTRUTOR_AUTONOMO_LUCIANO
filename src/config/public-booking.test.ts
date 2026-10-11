import assert from "node:assert/strict";
import test from "node:test";

import { auditPublicBookingEnvironment } from "./public-booking";

const completeEnvironment = {
  CUSTOM_BOOKING_ENABLED: "true",
  DATABASE_URL: "configured",
  GOOGLE_CALENDAR_REFRESH_TOKEN: "configured",
  AUTH_GOOGLE_ID: "configured",
  AUTH_GOOGLE_SECRET: "configured",
  GOOGLE_CALENDAR_ID: "configured",
  BOOKING_MIN_ADVANCE_MINUTES: "120",
  BOOKING_MAX_ADVANCE_DAYS: "30",
  BOOKING_BUFFER_MINUTES: "0",
  BOOKING_CLOSED_DATES: "",
};

test("considera a agenda pronta somente com toda a configuração", () => {
  const audit = auditPublicBookingEnvironment(completeEnvironment);

  assert.equal(audit.runtime.ready, true);
  assert.deepEqual(audit.issues, []);
});

test("lista todas as configurações ausentes sem retornar seus valores", () => {
  const audit = auditPublicBookingEnvironment({
    ...completeEnvironment,
    CUSTOM_BOOKING_ENABLED: "false",
    GOOGLE_CALENDAR_REFRESH_TOKEN: "",
    BOOKING_MIN_ADVANCE_MINUTES: "",
  });

  assert.equal(audit.runtime.ready, false);
  assert.deepEqual(audit.issues, [
    { variable: "CUSTOM_BOOKING_ENABLED", problem: "disabled" },
    { variable: "GOOGLE_CALENDAR_REFRESH_TOKEN", problem: "missing" },
    { variable: "BOOKING_MIN_ADVANCE_MINUTES", problem: "missing" },
  ]);
});

test("rejeita regras numéricas e datas fechadas inválidas", () => {
  const audit = auditPublicBookingEnvironment({
    ...completeEnvironment,
    BOOKING_MAX_ADVANCE_DAYS: "0",
    BOOKING_BUFFER_MINUTES: "-1",
    BOOKING_CLOSED_DATES: "2026-12-25,data-invalida",
  });

  assert.equal(audit.runtime.reason, "rules");
  assert.deepEqual(
    audit.issues.map((issue) => issue.variable),
    [
      "BOOKING_MAX_ADVANCE_DAYS",
      "BOOKING_BUFFER_MINUTES",
      "BOOKING_CLOSED_DATES",
    ],
  );
});
