import { loadEnvConfig } from "@next/env";
import { Pool, type PoolClient } from "pg";

import {
  auditPublicBookingEnvironment,
  bookingServices,
  type PublicBookingRuntimeConfig,
} from "../src/config/public-booking";
import {
  buildSlotsForDate,
  getDateKeyInTimeZone,
} from "../src/lib/booking/availability";
import {
  assertAuthorizedPostgresTls,
  createBookingDatabasePoolConfig,
} from "../src/lib/booking/postgres-config";
import { addDays, zonedLocalToUtc } from "../src/lib/calendar/date-time";
import type {
  GoogleCalendarEvent,
  GoogleCalendarListResponse,
} from "../src/lib/calendar/types";

loadEnvConfig(process.cwd());

type CheckStatus = "pass" | "fail" | "warning";
type Check = { status: CheckStatus; label: string; detail?: string };
type TokenResponse = {
  access_token?: string;
  error?: string;
};

const checks: Check[] = [];

function report(status: CheckStatus, label: string, detail?: string) {
  checks.push({ status, label, detail });
  const marker = status === "pass" ? "✓" : status === "warning" ? "!" : "✗";
  console.log(`${marker} ${label}${detail ? ` — ${detail}` : ""}`);
}

function safeDatabaseFailure(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (
    message.includes("ssl") ||
    message.includes("tls") ||
    message.includes("certificate") ||
    message.includes("self-signed")
  ) {
    return "falha de validação TLS, certificado ou hostname";
  }
  if (message.includes("password") || message.includes("authentication")) {
    return "credenciais PostgreSQL rejeitadas";
  }
  if (
    message.includes("database_url") ||
    message.includes("supabase_ca_cert") ||
    message.includes("transaction pooler")
  ) {
    return "configuração PostgreSQL inválida";
  }
  return "não foi possível conectar ao PostgreSQL";
}

async function refreshGoogleToken() {
  const refreshToken = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN?.trim();
  const clientId = process.env.AUTH_GOOGLE_ID?.trim();
  const clientSecret = process.env.AUTH_GOOGLE_SECRET?.trim();
  if (!refreshToken || !clientId || !clientSecret) return null;

  let response: Response;
  try {
    response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });
  } catch {
    throw new Error("GOOGLE_NETWORK");
  }

  let payload: TokenResponse;
  try {
    payload = (await response.json()) as TokenResponse;
  } catch {
    throw new Error("GOOGLE_INVALID_RESPONSE");
  }
  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error === "invalid_grant" ? "GOOGLE_EXPIRED" : "GOOGLE_REJECTED");
  }
  return payload.access_token;
}

async function listCalendarEvents(
  accessToken: string,
  from: Date,
  to: Date,
) {
  const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim();
  if (!calendarId) throw new Error("GOOGLE_CALENDAR_ID_MISSING");

  const events: GoogleCalendarEvent[] = [];
  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({
      fields: "items(id,status,transparency,start,end),nextPageToken",
      maxResults: "2500",
      orderBy: "startTime",
      showDeleted: "false",
      singleEvents: "true",
      timeMax: to.toISOString(),
      timeMin: from.toISOString(),
      timeZone: process.env.APP_TIMEZONE?.trim() || "America/Sao_Paulo",
    });
    if (pageToken) params.set("pageToken", pageToken);

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      },
    );
    if (!response.ok) {
      throw new Error(`GOOGLE_CALENDAR_${response.status}`);
    }
    const payload = (await response.json()) as GoogleCalendarListResponse;
    events.push(...(payload.items ?? []));
    pageToken = payload.nextPageToken;
  } while (pageToken);

  return events;
}

async function verifyDatabase(client: PoolClient) {
  assertAuthorizedPostgresTls(client);
  const result = await client.query<{
    reservations: string | null;
    rate_limits: string | null;
  }>(`
    SELECT
      to_regclass('public.booking_reservations')::text AS reservations,
      to_regclass('public.booking_rate_limits')::text AS rate_limits
  `);
  if (!result.rows[0]?.reservations || !result.rows[0]?.rate_limits) {
    throw new Error("BOOKING_TABLES_MISSING");
  }
}

async function reservedRanges(client: PoolClient, from: Date, to: Date) {
  const result = await client.query<{ starts_at: string; ends_at: string }>(
    `
      SELECT starts_at, ends_at
      FROM public.booking_reservations
      WHERE status IN ('holding', 'confirmed')
        AND starts_at < $1::timestamptz
        AND ends_at > $2::timestamptz
    `,
    [to.toISOString(), from.toISOString()],
  );
  return result.rows.map((row) => ({
    start: new Date(row.starts_at),
    end: new Date(row.ends_at),
  }));
}

async function verifyEligibleSlot(input: {
  accessToken: string;
  client: PoolClient;
  runtime: PublicBookingRuntimeConfig;
}) {
  const maxAdvanceDays = input.runtime.maxAdvanceDays;
  if (
    input.runtime.minAdvanceMinutes === undefined ||
    maxAdvanceDays === undefined ||
    input.runtime.bufferMinutes === undefined
  ) {
    throw new Error("BOOKING_RULES_MISSING");
  }

  const now = new Date();
  const timeZone = process.env.APP_TIMEZONE?.trim() || "America/Sao_Paulo";
  const firstDate = getDateKeyInTimeZone(now, timeZone);
  const lastDate = addDays(firstDate, maxAdvanceDays);
  const rangeStart = zonedLocalToUtc(firstDate, "00:00", timeZone);
  const rangeEnd = zonedLocalToUtc(addDays(lastDate, 1), "00:00", timeZone);
  const [events, reservations] = await Promise.all([
    listCalendarEvents(input.accessToken, rangeStart, rangeEnd),
    reservedRanges(input.client, rangeStart, rangeEnd),
  ]);
  const service = bookingServices.find(
    (item) => item.active && item.durationMinutes,
  );
  if (!service) throw new Error("NO_ACTIVE_SERVICE");

  const diagnosticRuntime: PublicBookingRuntimeConfig = {
    ...input.runtime,
    enabled: true,
    ready: true,
    reason: undefined,
  };
  for (let offset = 0; offset <= maxAdvanceDays; offset += 1) {
    const date = addDays(firstDate, offset);
    if (
      buildSlotsForDate(
        date,
        service,
        diagnosticRuntime,
        events,
        reservations,
        now,
      ).length > 0
    ) {
      return;
    }
  }
  throw new Error("NO_ELIGIBLE_SLOT");
}

async function main() {
  console.log("Booking Doctor — Direção Segura (somente leitura)\n");
  const audit = auditPublicBookingEnvironment();

  if (audit.runtime.enabled) {
    report("pass", "Agendamento personalizado habilitado");
  } else {
    report(
      "fail",
      "Agendamento personalizado desabilitado",
      "CUSTOM_BOOKING_ENABLED deve ser exatamente true somente durante o teste controlado",
    );
  }

  const nonActivationIssues = audit.issues.filter(
    (issue) => issue.variable !== "CUSTOM_BOOKING_ENABLED",
  );
  if (nonActivationIssues.length === 0) {
    report("pass", "Variáveis obrigatórias e regras numéricas presentes");
  } else {
    for (const issue of nonActivationIssues) {
      report(
        "fail",
        issue.variable,
        issue.problem === "missing"
          ? "ausente"
          : issue.problem === "invalid"
            ? "valor inválido"
            : "desabilitada",
      );
    }
  }

  let pool: Pool | undefined;
  let client: PoolClient | undefined;
  if (process.env.DATABASE_URL?.trim()) {
    try {
      pool = new Pool(createBookingDatabasePoolConfig());
      client = await pool.connect();
      await verifyDatabase(client);
      report("pass", "Supabase: TLS verify-full, conexão e tabelas");
    } catch (error) {
      report("fail", "Supabase", safeDatabaseFailure(error));
    }
  } else {
    report("fail", "Supabase", "DATABASE_URL ausente");
  }

  let accessToken: string | null = null;
  if (
    process.env.GOOGLE_CALENDAR_REFRESH_TOKEN?.trim() &&
    process.env.AUTH_GOOGLE_ID?.trim() &&
    process.env.AUTH_GOOGLE_SECRET?.trim() &&
    process.env.GOOGLE_CALENDAR_ID?.trim()
  ) {
    try {
      accessToken = await refreshGoogleToken();
      if (!accessToken) throw new Error("GOOGLE_CONFIGURATION");
      await listCalendarEvents(
        accessToken,
        new Date(),
        new Date(Date.now() + 7 * 86_400_000),
      );
      report(
        "pass",
        "Google OAuth offline e leitura da agenda",
        "nenhum evento foi criado ou alterado",
      );
    } catch (error) {
      const code = error instanceof Error ? error.message : "GOOGLE_UNKNOWN";
      report(
        "fail",
        "Google OAuth offline",
        code === "GOOGLE_EXPIRED"
          ? "refresh token expirado ou revogado"
          : code.startsWith("GOOGLE_CALENDAR_")
            ? "token válido, mas a agenda configurada não pôde ser consultada"
            : "credenciais rejeitadas ou Google temporariamente indisponível",
      );
    }
  } else {
    report("fail", "Google OAuth offline", "uma ou mais variáveis obrigatórias estão ausentes");
  }

  report(
    "warning",
    "Status OAuth Testing/In production",
    "não é exposto pela API; confirme manualmente em Google Auth Platform > Audience",
  );

  if (client && accessToken && audit.runtime.maxAdvanceDays !== undefined) {
    try {
      await verifyEligibleSlot({ accessToken, client, runtime: audit.runtime });
      report("pass", "Existe ao menos um horário elegível na janela configurada");
    } catch (error) {
      const code = error instanceof Error ? error.message : "UNKNOWN";
      report(
        "fail",
        "Horário elegível",
        code === "BOOKING_RULES_MISSING"
          ? "as regras numéricas ainda não estão completas"
          : "nenhum horário livre foi encontrado na janela configurada",
      );
    }
  } else {
    report(
      "fail",
      "Horário elegível",
      "depende de banco, Google e regras numéricas válidas",
    );
  }

  client?.release();
  await pool?.end();

  const failures = checks.filter((check) => check.status === "fail").length;
  console.log(
    `\nResultado: ${failures === 0 ? "pronto para teste controlado" : `${failures} pendência(s) encontrada(s)`}.`,
  );
  if (failures > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error("Booking Doctor falhou de forma segura.", {
    name: error instanceof Error ? error.name : "UnknownError",
  });
  process.exitCode = 1;
});
