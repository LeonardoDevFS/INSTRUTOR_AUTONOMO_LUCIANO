export type CalendarEventKind =
  | "siteBooking"
  | "block"
  | "participant"
  | "busy"
  | "other";

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
  siteBooking: boolean;
  transparency: "opaque" | "transparent";
  attendees: CalendarAttendee[];
  organizer?: string;
  reason?: string;
  reasonCode?: string;
  serviceId?: string;
  bookingId?: string;
  bookingStatus?: "holding" | "confirmed" | "failed" | "cancelled" | "missing";
  bookingSyncStatus?: "pending" | "synced" | "cancel_pending" | "error";
  bookingSyncIssue?: string;
  formFields: { label: string; value: string }[];
};

export type AdminBookingSyncIssue = {
  bookingId: string;
  startsAt: string;
  endsAt: string;
  code:
    | "CANCELLATION_PENDING"
    | "GOOGLE_EVENT_MISSING"
    | "GOOGLE_EVENT_NOT_LINKED"
    | "SYNC_ERROR"
    | "DATABASE_RESERVATION_MISSING";
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
