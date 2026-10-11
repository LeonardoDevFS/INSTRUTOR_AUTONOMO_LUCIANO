import type { NextRequest } from "next/server";

import { adminError, adminJson } from "@/lib/api/admin-response";
import { assertSameOrigin, requireAdminApi } from "@/lib/auth/require-admin";
import {
  beginCancelBookingByGoogleEventId,
  completeCancelBookingByGoogleEventId,
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

    const current = await getGoogleEvent(accessToken, eventId);
    if (!isSiteBooking(current)) {
      throw new GoogleCalendarError(
        "Somente reservas criadas pelo site podem ser canceladas por esta ação.",
        403,
        "NOT_SITE_BOOKING",
      );
    }
    if (isRecurringEvent(current)) {
      throw new GoogleCalendarError(
        "Eventos recorrentes devem ser gerenciados diretamente no Google Agenda.",
        403,
        "RECURRING_EVENT_PROTECTED",
      );
    }

    await beginCancelBookingByGoogleEventId(eventId);
    await deleteGoogleSiteBooking(accessToken, eventId, current.etag);
    await completeCancelBookingByGoogleEventId(eventId);
    return adminJson({ deleted: true, eventId });
  } catch (error) {
    return adminError(error);
  }
}
