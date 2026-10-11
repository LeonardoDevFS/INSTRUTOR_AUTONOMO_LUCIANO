import type { NextRequest } from "next/server";

import { adminError, adminJson } from "@/lib/api/admin-response";
import { assertSameOrigin, requireAdminApi } from "@/lib/auth/require-admin";
import { createStudent, listStudents } from "@/lib/students/database";
import { studentInputSchema, studentListQuerySchema } from "@/lib/students/schemas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminApi(request);
    const input = studentListQuerySchema.parse({
      query: request.nextUrl.searchParams.get("query") ?? undefined,
      status: request.nextUrl.searchParams.get("status") ?? undefined,
      category: request.nextUrl.searchParams.get("category") ?? undefined,
      page: request.nextUrl.searchParams.get("page") ?? undefined,
      pageSize: request.nextUrl.searchParams.get("pageSize") ?? undefined,
    });
    return adminJson(await listStudents(input));
  } catch (error) {
    return adminError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const admin = await requireAdminApi(request);
    const input = studentInputSchema.parse(await request.json());
    const student = await createStudent(input, admin.email);
    return adminJson({ student }, { status: 201 });
  } catch (error) {
    return adminError(error);
  }
}
