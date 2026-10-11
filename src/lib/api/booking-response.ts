import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AdminAuthError } from "@/lib/auth/require-admin";
import { GoogleCalendarError } from "@/lib/calendar/google-calendar";

export class BookingApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = "BookingApiError";
  }
}

const headers = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow",
};

export function bookingJson(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: { ...headers, ...init?.headers },
  });
}

export function bookingError(error: unknown) {
  if (error instanceof BookingApiError || error instanceof AdminAuthError) {
    return bookingJson(
      { error: error.message, code: error.code },
      { status: error.status },
    );
  }
  if (error instanceof GoogleCalendarError) {
    const unavailable = error.status === 401 || error.status === 403;
    return bookingJson(
      {
        error: unavailable
          ? "A agenda online está temporariamente indisponível. Use o agendamento pelo Google."
          : error.message,
        code: unavailable ? "BOOKING_UNAVAILABLE" : error.code,
      },
      { status: unavailable ? 503 : error.status },
    );
  }
  if (error instanceof ZodError) {
    return bookingJson(
      {
        error: "Revise os dados informados.",
        code: "VALIDATION_ERROR",
        fields: error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }
  if (error instanceof SyntaxError) {
    return bookingJson(
      { error: "A solicitação enviada é inválida.", code: "INVALID_JSON" },
      { status: 400 },
    );
  }

  console.error("Public booking API error", error);
  return bookingJson(
    {
      error: "Não foi possível concluir agora. Tente novamente ou use o agendamento pelo Google.",
      code: "BOOKING_INTERNAL_ERROR",
    },
    { status: 500 },
  );
}
