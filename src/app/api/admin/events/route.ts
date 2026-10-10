import type { NextRequest } from "next/server";

import { adminError, adminJson } from "@/lib/api/admin-response";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { serializeCalendarEvent } from "@/lib/calendar/business";
import { listGoogleEvents } from "@/lib/calendar/google-calendar";
import { eventRangeSchema } from "@/lib/calendar/schemas";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { accessToken } = await requireAdminApi(request);
    const range = eventRangeSchema.parse({
      from: request.nextUrl.searchParams.get("from"),
      to: request.nextUrl.searchParams.get("to"),
    });
    const rawEvents = await listGoogleEvents(
      accessToken,
      range.from,
      range.to,
    );
    const events = rawEvents
      .map(serializeCalendarEvent)
      .filter((event) => event !== null);

    return adminJson({ events, syncedAt: new Date().toISOString() });
  } catch (error) {
    return adminError(error);
  }
}
