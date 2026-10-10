import "server-only";

import {
  BLOCK_MARKER_KEY,
  BLOCK_MARKER_VALUE,
  BLOCK_REASON_CODE_KEY,
  BLOCK_REASON_KEY,
  BLOCK_REQUEST_KEY,
  BLOCK_VERSION_KEY,
  DEFAULT_TIME_ZONE,
  getBlockEventId,
  getBlockReasonLabel,
} from "@/lib/calendar/constants";
import { toGoogleEventRange } from "@/lib/calendar/date-time";
import type { BlockInput } from "@/lib/calendar/schemas";
import type {
  CalendarSummary,
  GoogleCalendarEvent,
  GoogleCalendarListResponse,
} from "@/lib/calendar/types";

const API_ROOT = "https://www.googleapis.com/calendar/v3";

export class GoogleCalendarError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = "GoogleCalendarError";
  }
}

function getCalendarId() {
  const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim();
  if (!calendarId) {
    throw new GoogleCalendarError(
      "A agenda administrativa ainda não foi configurada.",
      503,
      "CALENDAR_NOT_CONFIGURED",
    );
  }
  return calendarId;
}

function getTimeZone() {
  return process.env.APP_TIMEZONE?.trim() || DEFAULT_TIME_ZONE;
}

async function googleRequest<T>(
  accessToken: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_ROOT}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorMessage =
      response.status === 401
        ? "A autorização do Google expirou. Entre novamente."
        : response.status === 403
          ? "A conta conectada não possui acesso suficiente a esta agenda."
          : response.status === 404
            ? "Agenda ou compromisso não encontrado."
            : response.status === 429
              ? "O Google limitou temporariamente as consultas. Tente novamente em instantes."
              : "Não foi possível concluir a operação no Google Agenda.";

    throw new GoogleCalendarError(
      errorMessage,
      response.status,
      `GOOGLE_CALENDAR_${response.status}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function calendarPath(suffix = "") {
  return `/calendars/${encodeURIComponent(getCalendarId())}${suffix}`;
}

export async function getCalendarSummary(accessToken: string) {
  const now = new Date();
  const params = new URLSearchParams({
    maxResults: "1",
    singleEvents: "true",
    orderBy: "startTime",
    timeMin: now.toISOString(),
    timeZone: getTimeZone(),
  });
  const calendar = await googleRequest<GoogleCalendarListResponse>(
    accessToken,
    `${calendarPath("/events")}?${params.toString()}`,
  );

  return {
    id: getCalendarId(),
    summary: calendar.summary ?? getCalendarId(),
    timeZone: calendar.timeZone ?? getTimeZone(),
  } satisfies CalendarSummary;
}

export async function listGoogleEvents(
  accessToken: string,
  from: string,
  to: string,
  privateExtendedProperty?: string,
) {
  const events: GoogleCalendarEvent[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      timeMin: from,
      timeMax: to,
      singleEvents: "true",
      orderBy: "startTime",
      showDeleted: "false",
      maxResults: "250",
      timeZone: getTimeZone(),
    });
    if (pageToken) params.set("pageToken", pageToken);
    if (privateExtendedProperty) {
      params.set("privateExtendedProperty", privateExtendedProperty);
    }

    const response = await googleRequest<GoogleCalendarListResponse>(
      accessToken,
      `${calendarPath("/events")}?${params.toString()}`,
    );
    events.push(...(response.items ?? []));
    pageToken = response.nextPageToken;
  } while (pageToken);

  return events;
}

export function getGoogleEvent(accessToken: string, eventId: string) {
  return googleRequest<GoogleCalendarEvent>(
    accessToken,
    calendarPath(`/events/${encodeURIComponent(eventId)}`),
  );
}

function buildBlockBody(input: BlockInput, includeId = false) {
  const timeZone = getTimeZone();
  const range = toGoogleEventRange(input, timeZone);
  const reason = getBlockReasonLabel(input.reason, input.customReason);
  return {
    ...(includeId ? { id: getBlockEventId(input.requestId) } : {}),
    summary: `Bloqueio — ${reason}`,
    description: input.notes || undefined,
    eventType: "default",
    transparency: "opaque",
    visibility: "private",
    start: range.start,
    end: range.end,
    reminders: { useDefault: false },
    extendedProperties: {
      private: {
        [BLOCK_MARKER_KEY]: BLOCK_MARKER_VALUE,
        [BLOCK_VERSION_KEY]: "1",
        [BLOCK_REASON_KEY]: reason,
        [BLOCK_REASON_CODE_KEY]: input.reason,
        [BLOCK_REQUEST_KEY]: input.requestId,
      },
    },
  };
}

export async function createGoogleBlock(
  accessToken: string,
  input: BlockInput,
) {
  return googleRequest<GoogleCalendarEvent>(
    accessToken,
    calendarPath("/events?sendUpdates=none"),
    { method: "POST", body: JSON.stringify(buildBlockBody(input, true)) },
  );
}

export async function updateGoogleBlock(
  accessToken: string,
  eventId: string,
  input: BlockInput,
  etag?: string,
) {
  return googleRequest<GoogleCalendarEvent>(
    accessToken,
    calendarPath(`/events/${encodeURIComponent(eventId)}?sendUpdates=none`),
    {
      method: "PATCH",
      headers: etag ? { "If-Match": etag } : undefined,
      body: JSON.stringify(buildBlockBody(input)),
    },
  );
}

export function deleteGoogleBlock(
  accessToken: string,
  eventId: string,
  etag?: string,
) {
  return googleRequest<void>(
    accessToken,
    calendarPath(`/events/${encodeURIComponent(eventId)}?sendUpdates=none`),
    { method: "DELETE", headers: etag ? { "If-Match": etag } : undefined },
  );
}
