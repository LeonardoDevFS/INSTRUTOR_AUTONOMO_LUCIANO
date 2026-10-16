import type { NextRequest } from "next/server";

import { getBookingService } from "@/config/public-booking";
import {
  BookingApiError,
  bookingError,
  bookingJson,
} from "@/lib/api/booking-response";
import { getPublicBookingAccessToken } from "@/lib/auth/google-tokens";
import { assertSameOrigin } from "@/lib/auth/require-admin";
import { hashCancellationToken } from "@/lib/booking/cancellation-token";
import {
  beginCancelBookingByTokenHash,
  completeCancelBooking,
  findBookingByCancellationTokenHash,
  rateLimitBooking,
  recordCancellationSyncError,
  type BookingRow,
} from "@/lib/booking/database";
import { cancellationRequestSchema } from "@/lib/booking/schemas";
import { isSiteBooking } from "@/lib/calendar/business";
import { SITE_BOOKING_REQUEST_KEY } from "@/lib/calendar/constants";
import {
  deleteGoogleSiteBooking,
  getGoogleEvent,
  GoogleCalendarError,
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

function publicStatus(row: BookingRow) {
  if (row.status === "cancelled") return "cancelled" as const;
  if (row.calendar_sync_status === "cancel_pending") {
    return "cancellation_pending" as const;
  }
  return "confirmed" as const;
}

function reservationSummary(row: BookingRow) {
  const service = getBookingService(row.service_id);
  return {
    serviceName: service?.name ?? "Aula Direção Segura",
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: publicStatus(row),
  };
}

function isMissingGoogleEvent(error: unknown) {
  return (
    error instanceof GoogleCalendarError &&
    (error.status === 404 || error.status === 410)
  );
}

function safeSyncCode(error: unknown) {
  return error instanceof GoogleCalendarError
    ? error.code
    : "google-calendar-unavailable";
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const input = cancellationRequestSchema.parse(await request.json());
    if (!(await rateLimitBooking(requestIp(request), "cancellation", 10))) {
      throw new BookingApiError(
        "Muitas tentativas em pouco tempo. Aguarde antes de tentar novamente.",
        429,
        "CANCELLATION_RATE_LIMITED",
      );
    }

    const tokenHash = hashCancellationToken(input.token);
    if (input.action === "inspect") {
      const booking = await findBookingByCancellationTokenHash(tokenHash);
      if (!booking || !["confirmed", "cancelled"].includes(booking.status)) {
        throw new BookingApiError(
          "Este acesso de cancelamento é inválido ou não está disponível.",
          404,
          "CANCELLATION_NOT_FOUND",
        );
      }
      return bookingJson({ reservation: reservationSummary(booking) });
    }

    const prepared = await beginCancelBookingByTokenHash(tokenHash);
    if (prepared.state === "not_found") {
      throw new BookingApiError(
        "Este acesso de cancelamento é inválido ou não está disponível.",
        404,
        "CANCELLATION_NOT_FOUND",
      );
    }
    if (prepared.state === "completed") {
      return bookingJson({
        cancelled: true,
        idempotent: true,
        reservation: reservationSummary(prepared.row),
      });
    }
    if (prepared.state === "unavailable" || !prepared.row.google_event_id) {
      throw new BookingApiError(
        "Esta reserva ainda não pode ser cancelada por este acesso. Fale com Luciano para receber ajuda.",
        409,
        "CANCELLATION_NOT_AVAILABLE",
      );
    }

    const booking = prepared.row;
    const eventId = booking.google_event_id;
    if (!eventId) {
      throw new BookingApiError(
        "Esta reserva ainda não pode ser cancelada por este acesso. Fale com Luciano para receber ajuda.",
        409,
        "CANCELLATION_NOT_AVAILABLE",
      );
    }
    try {
      const accessToken = await getPublicBookingAccessToken();
      let event;
      try {
        event = await getGoogleEvent(accessToken, eventId);
      } catch (error) {
        if (isMissingGoogleEvent(error)) {
          await completeCancelBooking(booking.id, eventId);
          return bookingJson({
            cancelled: true,
            idempotent: prepared.state === "pending",
            reservation: {
              ...reservationSummary(booking),
              status: "cancelled",
            },
          });
        }
        throw error;
      }

      if (
        !isSiteBooking(event) ||
        event.extendedProperties?.private?.[SITE_BOOKING_REQUEST_KEY] !==
          booking.id
      ) {
        await recordCancellationSyncError(
          booking.id,
          "cancel-marker-mismatch",
        );
        throw new BookingApiError(
          "Não foi possível validar com segurança o compromisso correspondente. Fale com Luciano para receber ajuda.",
          409,
          "CANCELLATION_EVENT_MISMATCH",
        );
      }

      try {
        await deleteGoogleSiteBooking(accessToken, eventId, event.etag);
      } catch (error) {
        if (!isMissingGoogleEvent(error)) throw error;
      }
      await completeCancelBooking(booking.id, eventId);
      return bookingJson({
        cancelled: true,
        reservation: {
          ...reservationSummary(booking),
          status: "cancelled",
        },
      });
    } catch (error) {
      if (error instanceof BookingApiError) throw error;
      await recordCancellationSyncError(booking.id, safeSyncCode(error));
      throw new BookingApiError(
        "Seu cancelamento foi registrado, mas a sincronização com o Google ainda está pendente. O horário continuará bloqueado. Tente novamente em instantes ou fale com Luciano.",
        503,
        "CANCELLATION_PENDING",
      );
    }
  } catch (error) {
    return bookingError(error);
  }
}
