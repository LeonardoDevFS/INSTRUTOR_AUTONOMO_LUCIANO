import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AdminAuthError } from "@/lib/auth/require-admin";
import { GoogleCalendarError } from "@/lib/calendar/google-calendar";
import { BookingDatabaseError } from "@/lib/booking/database";
import { StudentsDatabaseError } from "@/lib/students/database";

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

  if (error instanceof BookingDatabaseError) {
    console.error("Booking database dependency failure", {
      code: error.code,
    });
    return adminJson(
      {
        error: "A agenda está temporariamente indisponível.",
        code: "BOOKING_DATABASE_UNAVAILABLE",
      },
      { status: 503 },
    );
  }

  if (error instanceof StudentsDatabaseError) {
    const response = {
      STUDENTS_SCHEMA_NOT_INSTALLED: {
        status: 503,
        message: "A Gestão de Alunos aguarda a aplicação da migração revisada.",
      },
      STUDENTS_DATABASE_UNAVAILABLE: {
        status: 503,
        message: "A Gestão de Alunos está temporariamente indisponível.",
      },
      STUDENT_NOT_FOUND: {
        status: 404,
        message: "Aluno não encontrado.",
      },
      STUDENT_DUPLICATE: {
        status: 409,
        message: "Já existe um cadastro com o mesmo nome e telefone.",
      },
      POSSIBLE_STUDENT_DUPLICATE: {
        status: 409,
        message: "Encontramos um possível cadastro semelhante. Revise antes de continuar.",
      },
      STUDENT_RECORD_CONFLICT: {
        status: 409,
        message: "O registro não pôde ser associado porque foi alterado ou já está vinculado.",
      },
    }[error.code];
    if (error.diagnostic) {
      console.error("Student database diagnostic", {
        publicCode: error.code,
        category: error.diagnostic.category,
        ...(error.diagnostic.technicalCode
          ? { technicalCode: error.diagnostic.technicalCode }
          : {}),
        databaseUrlPresent: error.diagnostic.databaseUrlPresent,
        supabaseCaCertPemPresent: error.diagnostic.supabaseCaCertPemPresent,
        production: error.diagnostic.production,
      });
    }
    return adminJson(
      {
        error: response.message,
        code: error.code,
        ...(error.details ? { matches: error.details } : {}),
      },
      { status: response.status },
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

  console.error("Admin API unexpected failure", {
    name: error instanceof Error ? error.name : "UnknownError",
  });
  return adminJson(
    { error: "Ocorreu um erro inesperado.", code: "INTERNAL_ERROR" },
    { status: 500 },
  );
}
