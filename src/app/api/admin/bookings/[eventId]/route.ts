import type { NextRequest } from "next/server";

import { adminError, adminJson } from "@/lib/api/admin-response";
import { assertSameOrigin, requireAdminApi } from "@/lib/auth/require-admin";
import {
  beginCancelBookingByGoogleEventId,
  completeCancelBooking,
  recordCancellationSyncError,
} from "@/lib/booking/database";
import { isRecurringEvent, isSiteBooking } from "@/lib/calendar/business";
import {
  deleteGoogleSiteBooking,
  getGoogleEvent,
  GoogleCalendarError,
} from "@/lib/calendar/google-calendar";
import { deleteBlockSchema, eventIdSchema } from "@/lib/calendar/schemas";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ eventId: string }> },
) {
  try {
    assertSameOrigin(request);
    const { accessToken } = await requireAdminApi(request);
    const { eventId: rawEventId } = await context.params;
    const eventId = eventIdSchema.parse(rawEventId);
    const confirmation = deleteBlockSchema.parse(await request.json());
    if (confirmation.confirmEventId !== eventId) {
      throw new GoogleCalendarError(
        "A confirmação não corresponde à reserva selecionada.",
        403,
        "INVALID_CONFIRMATION",
      );
    }

    const prepared = await beginCancelBookingByGoogleEventId(eventId);
    if (prepared.state === "not_found" || prepared.state === "unavailable") {
      throw new GoogleCalendarError(
        "A reserva correspondente não foi encontrada no controle do site.",
        404,
        "SITE_BOOKING_NOT_FOUND",
      );
    }
    if (prepared.state === "completed") {
      return adminJson({ deleted: true, eventId, idempotent: true });
    }

    const booking = prepared.row;
    let current;
    try {
      current = await getGoogleEvent(accessToken, eventId);
    } catch (error) {
      if (
        error instanceof GoogleCalendarError &&
        (error.status === 404 || error.status === 410)
      ) {
        await completeCancelBooking(booking.id, eventId);
        return adminJson({ deleted: true, eventId, idempotent: true });
      }
      await recordCancellationSyncError(
        booking.id,
        error instanceof GoogleCalendarError
          ? error.code
          : "google-calendar-unavailable",
      );
      throw error;
    }
    if (!isSiteBooking(current)) {
      await recordCancellationSyncError(
        booking.id,
        "cancel-marker-mismatch",
      );
      throw new GoogleCalendarError(
        "Somente reservas criadas pelo site podem ser canceladas por esta ação.",
        403,
        "NOT_SITE_BOOKING",
      );
    }
    if (isRecurringEvent(current)) {
      await recordCancellationSyncError(
        booking.id,
        "recurring-event-protected",
      );
      throw new GoogleCalendarError(
        "Eventos recorrentes devem ser gerenciados diretamente no Google Agenda.",
        403,
        "RECURRING_EVENT_PROTECTED",
      );
    }

    try {
      await deleteGoogleSiteBooking(accessToken, eventId, current.etag);
    } catch (error) {
      if (
        !(error instanceof GoogleCalendarError) ||
        (error.status !== 404 && error.status !== 410)
      ) {
        await recordCancellationSyncError(
          booking.id,
          error instanceof GoogleCalendarError
            ? error.code
            : "google-calendar-unavailable",
        );
        throw error;
      }
    }
    await completeCancelBooking(booking.id, eventId);
    return adminJson({ deleted: true, eventId });
  } catch (error) {
    return adminError(error);
  }
}
