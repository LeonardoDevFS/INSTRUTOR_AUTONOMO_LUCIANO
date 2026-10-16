import "server-only";

import {
  completeCancelBooking,
  confirmBooking,
  failBooking,
  listBookingsPendingReconciliation,
  recordBookingSyncError,
  recordCancellationSyncError,
} from "@/lib/booking/database";
import { getReconciliationAction } from "@/lib/booking/reconciliation-policy";
import { isSiteBooking } from "@/lib/calendar/business";
import {
  getSiteBookingEventId,
  SITE_BOOKING_REQUEST_KEY,
} from "@/lib/calendar/constants";
import {
  deleteGoogleSiteBooking,
  getGoogleEvent,
  GoogleCalendarError,
} from "@/lib/calendar/google-calendar";

function isMissingGoogleEvent(error: unknown) {
  return (
    error instanceof GoogleCalendarError &&
    (error.status === 404 || error.status === 410)
  );
}

export async function reconcilePendingBookings(accessToken: string) {
  const pending = await listBookingsPendingReconciliation();

  for (const booking of pending) {
    if (booking.status === "holding") {
      try {
        const event = await getGoogleEvent(
          accessToken,
          getSiteBookingEventId(booking.id),
        );
        if (
          event.id &&
          isSiteBooking(event) &&
          event.extendedProperties?.private?.[SITE_BOOKING_REQUEST_KEY] ===
            booking.id
        ) {
          if (
            getReconciliationAction("holding", "matching-event") === "confirm"
          ) {
            await confirmBooking(booking.id, event.id);
          }
        } else {
          await recordBookingSyncError(booking.id, "google-event-marker-mismatch");
        }
      } catch (error) {
        if (isMissingGoogleEvent(error)) {
          if (getReconciliationAction("holding", "missing-event") === "fail") {
            await failBooking(booking.id, "google-event-not-created");
          }
        } else {
          await recordBookingSyncError(booking.id, "google-calendar-unavailable");
        }
      }
      continue;
    }

    if (
      (booking.status === "confirmed" || booking.status === "cancelled") &&
      booking.calendar_sync_status === "cancel_pending" &&
      booking.google_event_id
    ) {
      try {
        const event = await getGoogleEvent(accessToken, booking.google_event_id);
        if (
          !isSiteBooking(event) ||
          event.extendedProperties?.private?.[SITE_BOOKING_REQUEST_KEY] !==
            booking.id
        ) {
          await recordBookingSyncError(booking.id, "cancel-marker-mismatch");
          continue;
        }
        await deleteGoogleSiteBooking(
          accessToken,
          booking.google_event_id,
          event.etag,
        );
        if (
            getReconciliationAction(booking.status, "matching-event") ===
          "cancel-event"
        ) {
          await completeCancelBooking(booking.id, booking.google_event_id);
        }
      } catch (error) {
        if (isMissingGoogleEvent(error)) {
          if (
            getReconciliationAction(booking.status, "missing-event") ===
            "complete-cancellation"
          ) {
            await completeCancelBooking(booking.id, booking.google_event_id);
          }
        } else {
          await recordCancellationSyncError(
            booking.id,
            "cancel-google-unavailable",
          );
        }
      }
    }
  }
}
