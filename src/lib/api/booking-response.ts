import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AdminAuthError } from "@/lib/auth/require-admin";
import { GoogleOAuthError } from "@/lib/auth/google-tokens";
import { BookingDatabaseError } from "@/lib/booking/database";
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
  if (error instanceof GoogleOAuthError) {
    console.error("Public booking dependency failure", {
      dependency: "google-oauth",
      code: error.code,
    });
    return bookingJson(
      {
        error:
          "A agenda online precisa ser reconectada. Por enquanto, use o agendamento pelo Google.",
        code: "BOOKING_GOOGLE_AUTH_UNAVAILABLE",
      },
      { status: 503 },
    );
  }
  if (error instanceof BookingDatabaseError) {
    console.error("Public booking dependency failure", {
      dependency: "postgresql",
      code: error.code,
    });
    return bookingJson(
      {
        error:
          "A agenda online está temporariamente indisponível. Tente novamente ou use o agendamento pelo Google.",
        code: "BOOKING_DATABASE_UNAVAILABLE",
      },
      { status: 503 },
    );
  }
  if (error instanceof GoogleCalendarError) {
    console.error("Public booking dependency failure", {
      dependency: "google-calendar",
      code: error.code,
      status: error.status,
    });
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

  console.error("Public booking API unexpected failure", {
    name: error instanceof Error ? error.name : "UnknownError",
  });
  return bookingJson(
    {
      error: "Não foi possível concluir agora. Tente novamente ou use o agendamento pelo Google.",
      code: "BOOKING_INTERNAL_ERROR",
    },
    { status: 500 },
  );
}
