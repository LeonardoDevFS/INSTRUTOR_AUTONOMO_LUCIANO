import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";

import {
  getBookingService,
  getPublicBookingRuntimeConfig,
} from "@/config/public-booking";
import { BookingApiError, bookingError, bookingJson } from "@/lib/api/booking-response";
import { buildSlotsForDate } from "@/lib/booking/availability";
import {
  acquireBooking,
  confirmBooking,
  failBooking,
  findBookingByIdempotency,
  listReservedRanges,
  rateLimitBooking,
} from "@/lib/booking/database";
import { publicBookingSchema } from "@/lib/booking/schemas";
import { reconcilePendingBookings } from "@/lib/booking/reconciliation";
import { getPublicBookingAccessToken } from "@/lib/auth/google-tokens";
import { assertSameOrigin } from "@/lib/auth/require-admin";
import { findConflicts, isSiteBooking } from "@/lib/calendar/business";
import { getSiteBookingEventId, SITE_BOOKING_REQUEST_KEY } from "@/lib/calendar/constants";
import { zonedLocalToUtc } from "@/lib/calendar/date-time";
import {
  createGoogleSiteBooking,
  getGoogleEvent,
  GoogleCalendarError,
  listGoogleEvents,
} from "@/lib/calendar/google-calendar";

export const dynamic = "force-dynamic";

function requestIp(request: NextRequest) {
  return (
    request.headers.get("x-nf-client-connection-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  let bookingId: string | undefined;

  try {
    assertSameOrigin(request);
    const runtime = getPublicBookingRuntimeConfig();
    if (!runtime.ready) {
      throw new BookingApiError(
        "O agendamento personalizado ainda está em validação.",
        503,
        "CUSTOM_BOOKING_NOT_READY",
      );
    }
    const input = publicBookingSchema.parse(await request.json());
    if (!(await rateLimitBooking(requestIp(request)))) {
      throw new BookingApiError(
        "Muitas tentativas em pouco tempo. Aguarde antes de tentar novamente.",
        429,
        "BOOKING_RATE_LIMITED",
      );
    }
    const service = getBookingService(input.serviceId);
    if (!service?.active || !service.durationMinutes) {
      throw new BookingApiError(
        "Este atendimento ainda não está disponível para reserva online.",
        400,
        "SERVICE_NOT_BOOKABLE",
      );
    }

    const candidateStart = zonedLocalToUtc(
      input.date,
      input.time,
      process.env.APP_TIMEZONE || "America/Sao_Paulo",
    );
    if (Number.isNaN(candidateStart.getTime())) {
      throw new BookingApiError("Horário inválido.", 400, "INVALID_SLOT");
    }
    const candidateEnd = new Date(
      candidateStart.getTime() + service.durationMinutes * 60_000,
    );
    const accessToken = await getPublicBookingAccessToken();
    await reconcilePendingBookings(accessToken);
    const existingAttempt = await findBookingByIdempotency(input.idempotencyKey);
    if (existingAttempt) {
      bookingId = existingAttempt.id;
      if (existingAttempt.status === "confirmed" && existingAttempt.google_event_id) {
        return bookingJson({ confirmed: true, bookingId, idempotent: true });
      }
      if (existingAttempt.status === "holding") {
        try {
          const duplicate = await getGoogleEvent(
            accessToken,
            getSiteBookingEventId(bookingId),
          );
          if (
            isSiteBooking(duplicate) &&
            duplicate.extendedProperties?.private?.[SITE_BOOKING_REQUEST_KEY] === bookingId &&
            duplicate.id
          ) {
            await confirmBooking(bookingId, duplicate.id);
            return bookingJson({ confirmed: true, bookingId, idempotent: true });
          }
        } catch (error) {
          if (!(error instanceof GoogleCalendarError) || error.status !== 404) throw error;
        }
      }
      throw new BookingApiError(
        "Esta tentativa já foi processada. Atualize os horários antes de tentar novamente.",
        409,
        "BOOKING_ALREADY_PROCESSED",
      );
    }
    const verificationFrom = new Date(candidateStart.getTime() - 86_400_000);
    const verificationTo = new Date(candidateEnd.getTime() + 86_400_000);
    const [events, reservedRanges] = await Promise.all([
      listGoogleEvents(
        accessToken,
        verificationFrom.toISOString(),
        verificationTo.toISOString(),
      ),
      listReservedRanges(verificationFrom, verificationTo),
    ]);
    const validSlot = buildSlotsForDate(
      input.date,
      service,
      runtime,
      events,
      reservedRanges,
      new Date(),
    ).find((slot) => slot.time === input.time);
    if (!validSlot) {
      throw new BookingApiError(
        "Este horário não está mais disponível. Escolha outro horário.",
        409,
        "SLOT_UNAVAILABLE",
      );
    }

    bookingId = randomUUID();
    const acquired = await acquireBooking({
      bookingId,
      idempotencyKey: input.idempotencyKey,
      slotKey: `${validSlot.start}/${validSlot.end}`,
      serviceId: service.id,
      start: new Date(validSlot.start),
      end: new Date(validSlot.end),
    });
    if (acquired.state === "conflict") {
      throw new BookingApiError(
        "Este horário acabou de ser reservado. Escolha outro horário.",
        409,
        "SLOT_UNAVAILABLE",
      );
    }
    bookingId = acquired.row.id;
    if (acquired.state === "idempotent") {
      if (acquired.row.status === "confirmed" && acquired.row.google_event_id) {
        return bookingJson({ confirmed: true, bookingId, idempotent: true });
      }
      if (acquired.row.status === "holding") {
        try {
          const duplicate = await getGoogleEvent(
            accessToken,
            getSiteBookingEventId(bookingId),
          );
          if (
            isSiteBooking(duplicate) &&
            duplicate.extendedProperties?.private?.[SITE_BOOKING_REQUEST_KEY] === bookingId &&
            duplicate.id
          ) {
            await confirmBooking(bookingId, duplicate.id);
            return bookingJson({ confirmed: true, bookingId, idempotent: true });
          }
        } catch (error) {
          if (!(error instanceof GoogleCalendarError) || error.status !== 404) throw error;
        }
      }
      throw new BookingApiError(
        "Esta tentativa já foi processada. Atualize os horários antes de tentar novamente.",
        409,
        "BOOKING_ALREADY_PROCESSED",
      );
    }

    const finalEvents = await listGoogleEvents(
      accessToken,
      validSlot.start,
      validSlot.end,
    );
    if (
      findConflicts(
        finalEvents,
        new Date(validSlot.start),
        new Date(validSlot.end),
      ).length > 0
    ) {
      await failBooking(bookingId);
      throw new BookingApiError(
        "Este horário acabou de ser ocupado. Escolha outro horário.",
        409,
        "SLOT_UNAVAILABLE",
      );
    }

    let created;
    try {
      created = await createGoogleSiteBooking(accessToken, {
        bookingId,
        serviceId: service.id,
        serviceName: service.name,
        start: new Date(validSlot.start),
        end: new Date(validSlot.end),
        student: {
          name: input.name,
          email: input.email,
          phone: input.phone,
          notes: input.notes,
        },
      });
    } catch (error) {
      if (error instanceof GoogleCalendarError && error.status === 409) {
        const duplicate = await getGoogleEvent(
          accessToken,
          getSiteBookingEventId(bookingId),
        );
        if (
          isSiteBooking(duplicate) &&
          duplicate.extendedProperties?.private?.[SITE_BOOKING_REQUEST_KEY] === bookingId
        ) {
          created = duplicate;
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }
    if (!created.id) throw new Error("GOOGLE_EVENT_WITHOUT_ID");
    await confirmBooking(bookingId, created.id);

    return bookingJson(
      {
        confirmed: true,
        bookingId,
        event: { start: validSlot.start, end: validSlot.end },
      },
      { status: 201 },
    );
  } catch (error) {
    return bookingError(error);
  }
}
