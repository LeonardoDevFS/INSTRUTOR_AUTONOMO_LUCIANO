export type AvailabilitySlot = {
  time: string;
  available: boolean;
};

export type AvailabilityDay = {
  date: string;
  label: string;
  weekday: string;
  slots: readonly AvailabilitySlot[];
};

export type AvailabilityResult = {
  provider: "mock" | "google-calendar";
  generatedAt: string;
  lessonDurationMinutes: number;
  days: readonly AvailabilityDay[];
};

export type AvailabilityRequest = {
  startDate: string;
  numberOfDays: number;
};

export interface CalendarProvider {
  getAvailability(request: AvailabilityRequest): Promise<AvailabilityResult>;
}
