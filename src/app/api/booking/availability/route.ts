import type { NextRequest } from "next/server";

import {
  auditPublicBookingEnvironment,
  getBookingService,
} from "@/config/public-booking";
import { BookingApiError, bookingError, bookingJson } from "@/lib/api/booking-response";
import {
  buildSlotsForDate,
  datesInMonth,
  monthBounds,
} from "@/lib/booking/availability";
import { listReservedRanges } from "@/lib/booking/database";
import { reconcilePendingBookings } from "@/lib/booking/reconciliation";
import { availabilityQuerySchema } from "@/lib/booking/schemas";
import { getPublicBookingAccessToken } from "@/lib/auth/google-tokens";
import { zonedLocalToUtc } from "@/lib/calendar/date-time";
import { listGoogleEvents } from "@/lib/calendar/google-calendar";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const configuration = auditPublicBookingEnvironment();
    const runtime = configuration.runtime;
    if (!runtime.ready) {
      console.error("Public booking configuration unavailable", {
        reason: runtime.reason ?? "unknown",
        issues: configuration.issues,
      });
      throw new BookingApiError(
        "O agendamento personalizado ainda está em validação.",
        503,
        "CUSTOM_BOOKING_NOT_READY",
      );
    }
    const input = availabilityQuerySchema.parse({
      month: request.nextUrl.searchParams.get("month"),
      serviceId: request.nextUrl.searchParams.get("serviceId"),
    });
    const service = getBookingService(input.serviceId);
    if (!service?.active || !service.durationMinutes) {
      throw new BookingApiError(
        "Este atendimento ainda não está disponível para reserva online.",
        400,
        "SERVICE_NOT_BOOKABLE",
      );
    }

    const bounds = monthBounds(input.month);
    const rangeStart = zonedLocalToUtc(bounds.start, "00:00");
    const rangeEnd = zonedLocalToUtc(bounds.endExclusive, "00:00");
    const accessToken = await getPublicBookingAccessToken();
    await reconcilePendingBookings(accessToken);
    const reservedRanges = await listReservedRanges(rangeStart, rangeEnd);
    const events = await listGoogleEvents(
      accessToken,
      rangeStart.toISOString(),
      rangeEnd.toISOString(),
    );
    const now = new Date();
    const days = datesInMonth(input.month).map((date) => {
      const slots = buildSlotsForDate(
        date,
        service,
        runtime,
        events,
        reservedRanges,
        now,
      );
      return { date, available: slots.length > 0, slots };
    });

    return bookingJson({
      month: input.month,
      serviceId: service.id,
      durationMinutes: service.durationMinutes,
      timeZone: process.env.APP_TIMEZONE || "America/Sao_Paulo",
      days,
    });
  } catch (error) {
    return bookingError(error);
  }
}
