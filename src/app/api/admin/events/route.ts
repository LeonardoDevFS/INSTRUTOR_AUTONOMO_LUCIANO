import type { NextRequest } from "next/server";

import { adminError, adminJson } from "@/lib/api/admin-response";
import { requireAdminApi } from "@/lib/auth/require-admin";
import {
  BookingDatabaseError,
  listBookingSyncRowsForRange,
} from "@/lib/booking/database";
import { serializeCalendarEvent } from "@/lib/calendar/business";
import { listGoogleEvents } from "@/lib/calendar/google-calendar";
import { eventRangeSchema } from "@/lib/calendar/schemas";
import type { AdminBookingSyncIssue } from "@/lib/calendar/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { accessToken } = await requireAdminApi(request);
    const range = eventRangeSchema.parse({
      from: request.nextUrl.searchParams.get("from"),
      to: request.nextUrl.searchParams.get("to"),
    });
    const rawEvents = await listGoogleEvents(accessToken, range.from, range.to);
    let diagnosticsUnavailable = false;
    let bookingRows: Awaited<ReturnType<typeof listBookingSyncRowsForRange>> = [];
    try {
      bookingRows = await listBookingSyncRowsForRange(
        new Date(range.from),
        new Date(range.to),
      );
    } catch (error) {
      if (!(error instanceof BookingDatabaseError)) throw error;
      diagnosticsUnavailable = true;
      console.error("Booking synchronization diagnostic unavailable", {
        code: error.code,
      });
    }

    const rowsByEventId = new Map(
      bookingRows
        .filter((row) => row.google_event_id)
        .map((row) => [row.google_event_id, row]),
    );
    const rowsByBookingId = new Map(bookingRows.map((row) => [row.id, row]));
    const events = rawEvents
      .map(serializeCalendarEvent)
      .filter((event) => event !== null)
      .map((event) => {
        if (!event.siteBooking) return event;
        const row =
          rowsByEventId.get(event.id) ??
          (event.bookingId ? rowsByBookingId.get(event.bookingId) : undefined);
        return {
          ...event,
          bookingStatus: row?.status ?? "missing",
          bookingSyncStatus: row?.calendar_sync_status,
          bookingSyncIssue:
            row?.last_sync_error ??
            (!row ? "database-reservation-missing" : undefined),
        };
      });

    const googleEventIds = new Set(rawEvents.flatMap((event) => event.id ?? []));
    const syncIssues = bookingRows.flatMap<AdminBookingSyncIssue>((row) => {
      if (row.calendar_sync_status === "cancel_pending") {
        return [{
          bookingId: row.id,
          startsAt: row.starts_at,
          endsAt: row.ends_at,
          code: "CANCELLATION_PENDING" as const,
        }];
      }
      if (row.calendar_sync_status === "error" || row.last_sync_error) {
        return [{
          bookingId: row.id,
          startsAt: row.starts_at,
          endsAt: row.ends_at,
          code: "SYNC_ERROR" as const,
        }];
      }
      if (row.status === "confirmed" && !row.google_event_id) {
        return [{
          bookingId: row.id,
          startsAt: row.starts_at,
          endsAt: row.ends_at,
          code: "GOOGLE_EVENT_NOT_LINKED" as const,
        }];
      }
      if (
        row.status === "confirmed" &&
        row.google_event_id &&
        !googleEventIds.has(row.google_event_id)
      ) {
        return [{
          bookingId: row.id,
          startsAt: row.starts_at,
          endsAt: row.ends_at,
          code: "GOOGLE_EVENT_MISSING" as const,
        }];
      }
      return [];
    });

    for (const event of events) {
      if (event.siteBooking && event.bookingStatus === "missing") {
        syncIssues.push({
          bookingId: event.bookingId ?? event.id,
          startsAt: event.start,
          endsAt: event.end,
          code: "DATABASE_RESERVATION_MISSING",
        });
      }
    }

    return adminJson({
      events,
      syncIssues,
      diagnosticsUnavailable,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    return adminError(error);
  }
}
