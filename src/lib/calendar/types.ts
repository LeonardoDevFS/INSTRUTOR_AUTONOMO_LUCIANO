export type CalendarEventKind = "block" | "participant" | "busy" | "other";

export type CalendarAttendee = {
  email?: string;
  displayName?: string;
  responseStatus?: string;
  self?: boolean;
};

export type AdminCalendarEvent = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start: string;
  end: string;
  allDay: boolean;
  status: string;
  kind: CalendarEventKind;
  htmlLink?: string;
  recurring: boolean;
  managedBlock: boolean;
  transparency: "opaque" | "transparent";
  attendees: CalendarAttendee[];
  organizer?: string;
  reason?: string;
  reasonCode?: string;
  formFields: { label: string; value: string }[];
};

export type CalendarSummary = {
  id: string;
  summary: string;
  timeZone: string;
};

export type GoogleCalendarEvent = {
  id?: string;
  etag?: string;
  status?: string;
  summary?: string;
  description?: string;
  location?: string;
  htmlLink?: string;
  eventType?: string;
  transparency?: "opaque" | "transparent";
  visibility?: string;
  recurringEventId?: string;
  recurrence?: string[];
  start?: { date?: string; dateTime?: string; timeZone?: string };
  end?: { date?: string; dateTime?: string; timeZone?: string };
  attendees?: CalendarAttendee[];
  organizer?: { email?: string; displayName?: string; self?: boolean };
  extendedProperties?: {
    private?: Record<string, string>;
    shared?: Record<string, string>;
  };
};

export type GoogleCalendarListResponse = {
  items?: GoogleCalendarEvent[];
  nextPageToken?: string;
  summary?: string;
  timeZone?: string;
};
