import type { NextRequest } from "next/server";

import { adminError, adminJson } from "@/lib/api/admin-response";
import {
  assertSameOrigin,
  requireAdminApi,
} from "@/lib/auth/require-admin";
import {
  findConflicts,
  isManagedBlock,
  isRecurringEvent,
  serializeCalendarEvent,
} from "@/lib/calendar/business";
import { BLOCK_REQUEST_KEY } from "@/lib/calendar/constants";
import { toGoogleEventRange } from "@/lib/calendar/date-time";
import {
  deleteGoogleBlock,
  getGoogleEvent,
  GoogleCalendarError,
  listGoogleEvents,
  updateGoogleBlock,
} from "@/lib/calendar/google-calendar";
import {
  blockInputSchema,
  deleteBlockSchema,
  eventIdSchema,
} from "@/lib/calendar/schemas";

export const dynamic = "force-dynamic";

function assertEditableBlock(event: Awaited<ReturnType<typeof getGoogleEvent>>) {
  if (!isManagedBlock(event)) {
    throw new GoogleCalendarError(
      "Somente bloqueios criados pelo painel podem ser alterados aqui.",
      403,
      "NOT_MANAGED_BLOCK",
    );
  }
  if (isRecurringEvent(event)) {
    throw new GoogleCalendarError(
      "Eventos recorrentes devem ser gerenciados diretamente no Google Agenda.",
      403,
      "RECURRING_EVENT_PROTECTED",
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ eventId: string }> },
) {
  try {
    assertSameOrigin(request);
    const { accessToken } = await requireAdminApi(request);
    const { eventId: rawEventId } = await context.params;
    const eventId = eventIdSchema.parse(rawEventId);
    const input = blockInputSchema.parse(await request.json());
    const current = await getGoogleEvent(accessToken, eventId);
    assertEditableBlock(current);

    const range = toGoogleEventRange(
      input,
      process.env.APP_TIMEZONE || "America/Sao_Paulo",
    );
    const events = await listGoogleEvents(
      accessToken,
      range.rangeStart.toISOString(),
      range.rangeEnd.toISOString(),
    );
    const conflicts = findConflicts(
      events.filter((event) => event.id !== eventId),
      range.rangeStart,
      range.rangeEnd,
    );
    if (conflicts.length > 0 && !input.confirmConflicts) {
      return adminJson(
        {
          error: "Já existem compromissos nesse período.",
          code: "CALENDAR_CONFLICT",
          conflicts: conflicts.map(serializeCalendarEvent).filter(Boolean),
        },
        { status: 409 },
      );
    }

    const preservedRequestId =
      current.extendedProperties?.private?.[BLOCK_REQUEST_KEY] ?? input.requestId;
    const updated = serializeCalendarEvent(
      await updateGoogleBlock(
        accessToken,
        eventId,
        { ...input, requestId: preservedRequestId },
        current.etag,
      ),
    );
    return adminJson({ event: updated });
  } catch (error) {
    return adminError(error);
  }
}

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
        "A confirmação não corresponde ao bloqueio selecionado.",
        403,
        "INVALID_CONFIRMATION",
      );
    }

    const current = await getGoogleEvent(accessToken, eventId);
    assertEditableBlock(current);
    await deleteGoogleBlock(accessToken, eventId, current.etag);
    return adminJson({ deleted: true, eventId });
  } catch (error) {
    return adminError(error);
  }
}
