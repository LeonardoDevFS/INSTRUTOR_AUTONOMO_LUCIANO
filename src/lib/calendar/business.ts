import {
  BLOCK_MARKER_KEY,
  BLOCK_MARKER_VALUE,
  BLOCK_REASON_CODE_KEY,
  BLOCK_REASON_KEY,
  BLOCK_REQUEST_KEY,
} from "@/lib/calendar/constants";
import { zonedLocalToUtc } from "@/lib/calendar/date-time";
import type {
  AdminCalendarEvent,
  CalendarEventKind,
  GoogleCalendarEvent,
} from "@/lib/calendar/types";

export function isManagedBlock(event: GoogleCalendarEvent) {
  return (
    event.extendedProperties?.private?.[BLOCK_MARKER_KEY] ===
    BLOCK_MARKER_VALUE
  );
}

export function isRecurringEvent(event: GoogleCalendarEvent) {
  return Boolean(event.recurringEventId || event.recurrence?.length);
}

export function classifyEvent(event: GoogleCalendarEvent): CalendarEventKind {
  if (isManagedBlock(event)) {
    return "block";
  }

  if (event.attendees?.some((attendee) => !attendee.self)) {
    return "participant";
  }

  if ((event.transparency ?? "opaque") === "opaque") {
    return "busy";
  }

  return "other";
}

function descriptionToText(description: string) {
  return description
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .trim();
}

function parseFormFields(description?: string) {
  if (!description) return [];
  const acceptedLabel = /^(nome|sobrenome|e-?mail|telefone|celular|whats(?:app)?|servi[cç]o|modalidade|observa[cç][aã]o|coment[aá]rio|phone|service)/i;

  return descriptionToText(description)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf(":");
      if (separator < 1) return null;
      const label = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim();
      return acceptedLabel.test(label) && value ? { label, value } : null;
    })
    .filter((field): field is { label: string; value: string } => field !== null);
}

export function serializeCalendarEvent(
  event: GoogleCalendarEvent,
): AdminCalendarEvent | null {
  if (!event.id || !event.start || !event.end) {
    return null;
  }

  const start = event.start.dateTime ?? event.start.date;
  const end = event.end.dateTime ?? event.end.date;
  if (!start || !end) {
    return null;
  }

  const managedBlock = isManagedBlock(event);
  return {
    id: event.id,
    title: event.summary?.trim() || "Compromisso sem título",
    description: event.description ? descriptionToText(event.description) : undefined,
    location: event.location,
    start,
    end,
    allDay: Boolean(event.start.date),
    status: event.status ?? "confirmed",
    kind: classifyEvent(event),
    htmlLink: event.htmlLink,
    recurring: isRecurringEvent(event),
    managedBlock,
    transparency: event.transparency ?? "opaque",
    attendees: event.attendees ?? [],
    organizer: event.organizer?.email,
    reason: managedBlock
      ? event.extendedProperties?.private?.[BLOCK_REASON_KEY]
      : undefined,
    reasonCode: managedBlock
      ? event.extendedProperties?.private?.[BLOCK_REASON_CODE_KEY]
      : undefined,
    formFields: parseFormFields(event.description),
  };
}

function eventBoundary(value?: { date?: string; dateTime?: string }) {
  if (value?.dateTime) return Date.parse(value.dateTime);
  if (value?.date) return zonedLocalToUtc(value.date, "00:00").getTime();
  return Number.NaN;
}

export function findConflicts(
  events: GoogleCalendarEvent[],
  rangeStart: Date,
  rangeEnd: Date,
) {
  return events.filter((event) => {
    if (
      event.status === "cancelled" ||
      event.transparency === "transparent"
    ) {
      return false;
    }

    const start = eventBoundary(event.start);
    const end = eventBoundary(event.end);
    return (
      Number.isFinite(start) &&
      Number.isFinite(end) &&
      start < rangeEnd.getTime() &&
      end > rangeStart.getTime()
    );
  });
}

export function findBlockByRequestId(
  events: GoogleCalendarEvent[],
  requestId: string,
) {
  return events.find(
    (event) =>
      isManagedBlock(event) &&
      event.extendedProperties?.private?.[BLOCK_REQUEST_KEY] === requestId,
  );
}
