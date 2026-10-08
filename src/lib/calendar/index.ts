import { MockCalendarProvider } from "./mock-provider";
import type { CalendarProvider } from "./types";

export function getCalendarProvider(): CalendarProvider {
  return new MockCalendarProvider();
}

export type {
  AvailabilityDay,
  AvailabilityResult,
  AvailabilitySlot,
  CalendarProvider,
} from "./types";
