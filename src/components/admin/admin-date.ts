import type { AdminCalendarEvent } from "@/lib/calendar/types";

export type CalendarView = "day" | "week" | "month";

export function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function eventDate(event: AdminCalendarEvent) {
  return event.allDay
    ? new Date(`${event.start}T00:00:00`)
    : new Date(event.start);
}

export function eventDateKey(event: AdminCalendarEvent) {
  return event.allDay ? event.start : toLocalDateKey(new Date(event.start));
}

export function getViewRange(anchor: Date, view: CalendarView) {
  const start = new Date(anchor);
  start.setHours(0, 0, 0, 0);

  if (view === "week") {
    const day = start.getDay();
    start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
  } else if (view === "month") {
    start.setDate(1);
  }

  const end = new Date(start);
  if (view === "day") end.setDate(end.getDate() + 1);
  if (view === "week") end.setDate(end.getDate() + 7);
  if (view === "month") end.setMonth(end.getMonth() + 1);
  return { start, end };
}

export function moveAnchor(anchor: Date, view: CalendarView, direction: number) {
  const next = new Date(anchor);
  if (view === "day") next.setDate(next.getDate() + direction);
  if (view === "week") next.setDate(next.getDate() + 7 * direction);
  if (view === "month") next.setMonth(next.getMonth() + direction);
  return next;
}

export function viewDays(anchor: Date, view: CalendarView) {
  const { start, end } = getViewRange(anchor, view);
  const first = new Date(start);
  const last = new Date(end);
  if (view === "month") {
    first.setDate(first.getDate() - first.getDay());
    const trailing = last.getDay() === 0 ? 0 : 7 - last.getDay();
    last.setDate(last.getDate() + trailing);
  }

  const days: Date[] = [];
  for (const cursor = new Date(first); cursor < last; cursor.setDate(cursor.getDate() + 1)) {
    days.push(new Date(cursor));
  }
  return days;
}

export function formatEventTime(event: AdminCalendarEvent) {
  if (event.allDay) return "Dia inteiro";
  const start = new Date(event.start).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const end = new Date(event.end).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${start}–${end}`;
}
