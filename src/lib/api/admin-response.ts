import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AdminAuthError } from "@/lib/auth/require-admin";
import { GoogleCalendarError } from "@/lib/calendar/google-calendar";

const noStoreHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow",
};

export function adminJson(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: { ...noStoreHeaders, ...init?.headers },
  });
}

export function adminError(error: unknown) {
  if (error instanceof AdminAuthError || error instanceof GoogleCalendarError) {
    return adminJson(
      { error: error.message, code: error.code },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    return adminJson(
      {
        error: "Revise os dados informados.",
        code: "VALIDATION_ERROR",
        fields: error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  if (error instanceof SyntaxError) {
    return adminJson(
      { error: "O corpo da requisição não é um JSON válido.", code: "INVALID_JSON" },
      { status: 400 },
    );
  }

  console.error("Admin API error", error);
  return adminJson(
    { error: "Ocorreu um erro inesperado.", code: "INTERNAL_ERROR" },
    { status: 500 },
  );
}
