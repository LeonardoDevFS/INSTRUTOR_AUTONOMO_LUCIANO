import type { NextRequest } from "next/server";

import { adminError, adminJson } from "@/lib/api/admin-response";
import {
  assertSameOrigin,
  requireAdminApi,
} from "@/lib/auth/require-admin";
import {
  findBlockByRequestId,
  findConflicts,
  serializeCalendarEvent,
} from "@/lib/calendar/business";
import { getBlockEventId } from "@/lib/calendar/constants";
import { toGoogleEventRange } from "@/lib/calendar/date-time";
import {
  createGoogleBlock,
  getGoogleEvent,
  GoogleCalendarError,
  listGoogleEvents,
} from "@/lib/calendar/google-calendar";
import { blockInputSchema } from "@/lib/calendar/schemas";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const { accessToken } = await requireAdminApi(request);
    const input = blockInputSchema.parse(await request.json());
    const range = toGoogleEventRange(
      input,
      process.env.APP_TIMEZONE || "America/Sao_Paulo",
    );
    const events = await listGoogleEvents(
      accessToken,
      range.rangeStart.toISOString(),
      range.rangeEnd.toISOString(),
    );

    const existing = findBlockByRequestId(events, input.requestId);
    if (existing) {
      return adminJson(
        { event: serializeCalendarEvent(existing), idempotent: true },
        { status: 200 },
      );
    }

    const conflicts = findConflicts(events, range.rangeStart, range.rangeEnd);
    if (conflicts.length > 0 && !input.confirmConflicts) {
      return adminJson(
        {
          error: "Já existem compromissos nesse período.",
          code: "CALENDAR_CONFLICT",
          conflicts: conflicts.map((event) => {
            const item = serializeCalendarEvent(event);
            return item
              ? {
                  id: item.id,
                  title: item.title,
                  start: item.start,
                  end: item.end,
                  kind: item.kind,
                }
              : null;
          }).filter(Boolean),
        },
        { status: 409 },
      );
    }

    let created;
    try {
      created = serializeCalendarEvent(
        await createGoogleBlock(accessToken, input),
      );
    } catch (error) {
      if (error instanceof GoogleCalendarError && error.status === 409) {
        const duplicate = await getGoogleEvent(
          accessToken,
          getBlockEventId(input.requestId),
        );
        const existingRequestId =
          duplicate.extendedProperties?.private?.direcaoSeguraRequestId;
        if (existingRequestId === input.requestId) {
          return adminJson(
            { event: serializeCalendarEvent(duplicate), idempotent: true },
            { status: 200 },
          );
        }
      }
      throw error;
    }
    return adminJson({ event: created }, { status: 201 });
  } catch (error) {
    return adminError(error);
  }
}
