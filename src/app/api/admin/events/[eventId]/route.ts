import type { NextRequest } from "next/server";

import { adminError, adminJson } from "@/lib/api/admin-response";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { serializeCalendarEvent } from "@/lib/calendar/business";
import {
  getGoogleEvent,
  GoogleCalendarError,
} from "@/lib/calendar/google-calendar";
import { eventIdSchema } from "@/lib/calendar/schemas";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ eventId: string }> },
) {
  try {
    const { accessToken } = await requireAdminApi(request);
    const { eventId: rawEventId } = await context.params;
    const eventId = eventIdSchema.parse(rawEventId);
    const event = serializeCalendarEvent(
      await getGoogleEvent(accessToken, eventId),
    );
    if (!event) {
      throw new GoogleCalendarError(
        "O compromisso não possui dados de data válidos.",
        404,
        "EVENT_NOT_AVAILABLE",
      );
    }
    return adminJson({ event });
  } catch (error) {
    return adminError(error);
  }
}
