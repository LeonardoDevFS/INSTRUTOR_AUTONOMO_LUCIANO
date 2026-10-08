import { NextResponse, type NextRequest } from "next/server";

import { getCalendarProvider } from "@/lib/calendar";

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  const startDate = request.nextUrl.searchParams.get("startDate");

  if (!startDate || !isoDatePattern.test(startDate)) {
    return NextResponse.json(
      { error: "Data inicial inválida." },
      { status: 400 },
    );
  }

  const provider = getCalendarProvider();
  const availability = await provider.getAvailability({
    startDate,
    numberOfDays: 14,
  });

  return NextResponse.json(availability, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
