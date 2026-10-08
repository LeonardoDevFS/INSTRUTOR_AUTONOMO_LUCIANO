import { siteConfig } from "@/config/site";

import type {
  AvailabilityDay,
  AvailabilityRequest,
  AvailabilityResult,
  CalendarProvider,
} from "./types";

const weekdaySlots = [
  "07:00",
  "08:00",
  "09:00",
  "14:00",
  "15:00",
  "18:00",
  "19:00",
] as const;

const saturdaySlots = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00"] as const;

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  timeZone: "UTC",
});

export class MockCalendarProvider implements CalendarProvider {
  async getAvailability({
    startDate,
    numberOfDays,
  }: AvailabilityRequest): Promise<AvailabilityResult> {
    const start = new Date(`${startDate}T12:00:00.000Z`);
    const days: AvailabilityDay[] = [];

    for (let offset = 0; offset < numberOfDays; offset += 1) {
      const current = new Date(start);
      current.setUTCDate(start.getUTCDate() + offset);
      const weekday = current.getUTCDay();

      if (weekday === 0) {
        continue;
      }

      const times = weekday === 6 ? saturdaySlots : weekdaySlots;

      days.push({
        date: current.toISOString().slice(0, 10),
        label: dateFormatter.format(current).replace(" de ", " "),
        weekday: weekdayFormatter.format(current).replace(".", ""),
        slots: times.map((time) => ({ time, available: true })),
      });
    }

    return {
      provider: "mock",
      generatedAt: new Date().toISOString(),
      lessonDurationMinutes: siteConfig.lesson.durationMinutes,
      days,
    };
  }
}
