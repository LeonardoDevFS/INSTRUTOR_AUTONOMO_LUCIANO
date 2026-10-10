import type { NextRequest } from "next/server";

import { adminError, adminJson } from "@/lib/api/admin-response";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { getCalendarSummary } from "@/lib/calendar/google-calendar";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { accessToken } = await requireAdminApi(request);
    const calendar = await getCalendarSummary(accessToken);
    return adminJson({ calendar, syncedAt: new Date().toISOString() });
  } catch (error) {
    return adminError(error);
  }
}
