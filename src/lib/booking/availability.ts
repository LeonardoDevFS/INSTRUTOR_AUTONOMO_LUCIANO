import { siteConfig } from "@/config/site";
import type { BookingService, PublicBookingRuntimeConfig } from "@/config/public-booking";
import { findConflicts } from "@/lib/calendar/business";
import { addDays, zonedLocalToUtc } from "@/lib/calendar/date-time";
import type { GoogleCalendarEvent } from "@/lib/calendar/types";

export type BookingSlot = {
  time: string;
  start: string;
  end: string;
};

export type BookingDay = {
  date: string;
  available: boolean;
  slots: BookingSlot[];
};

// A margem protege os dois lados da aula, inclusive de eventos criados no Google.
export function getProtectedSlotRange(start: Date, end: Date, bufferMinutes: number) {
  const bufferMs = bufferMinutes * 60_000;
  return {
    from: new Date(start.getTime() - bufferMs),
    to: new Date(end.getTime() + bufferMs),
  };
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(total: number) {
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function weekday(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function monthBounds(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const start = `${year}-${String(monthNumber).padStart(2, "0")}-01`;
  const next = new Date(Date.UTC(year, monthNumber, 1));
  return { start, endExclusive: next.toISOString().slice(0, 10) };
}

export function getDateKeyInTimeZone(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function buildSlotsForDate(
  date: string,
  service: BookingService,
  runtime: PublicBookingRuntimeConfig,
  events: GoogleCalendarEvent[],
  reservedRanges: { start: Date; end: Date }[],
  now = new Date(),
) {
  if (!service.active || !service.durationMinutes || !runtime.ready) return [];
  if (runtime.closedDates.includes(date)) return [];

  const day = weekday(date);
  if (day === 0) return [];
  const schedule = day === 6 ? siteConfig.schedule.saturday : siteConfig.schedule.weekdays;
  const opening = timeToMinutes(schedule.opening);
  const closing = timeToMinutes(schedule.closing);
  const step = service.durationMinutes + (runtime.bufferMinutes ?? 0);
  const earliest = now.getTime() + (runtime.minAdvanceMinutes ?? 0) * 60_000;
  const latest = now.getTime() + (runtime.maxAdvanceDays ?? 0) * 86_400_000;
  const slots: BookingSlot[] = [];

  for (let minute = opening; minute + service.durationMinutes <= closing; minute += step) {
    const time = minutesToTime(minute);
    const start = zonedLocalToUtc(date, time);
    const end = new Date(start.getTime() + service.durationMinutes * 60_000);
    if (start.getTime() < earliest || start.getTime() > latest) continue;
    const protectedRange = getProtectedSlotRange(start, end, runtime.bufferMinutes ?? 0);
    if (findConflicts(events, protectedRange.from, protectedRange.to).length > 0) continue;
    if (reservedRanges.some((range) => range.start < protectedRange.to && range.end > protectedRange.from)) continue;
    slots.push({ time, start: start.toISOString(), end: end.toISOString() });
  }

  return slots;
}

export function datesInMonth(month: string) {
  const { start, endExclusive } = monthBounds(month);
  const dates: string[] = [];
  for (let date = start; date < endExclusive; date = addDays(date, 1)) dates.push(date);
  return dates;
}
