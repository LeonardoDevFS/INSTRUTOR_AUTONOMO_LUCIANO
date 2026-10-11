import type { NextRequest } from "next/server";

import { adminError, adminJson } from "@/lib/api/admin-response";
import { assertSameOrigin, requireAdminApi } from "@/lib/auth/require-admin";
import { createStudentRecord, getStudentWorkspace } from "@/lib/students/database";
import { studentIdSchema, studentRecordActionSchema } from "@/lib/students/schemas";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ studentId: string }> },
) {
  try {
    await requireAdminApi(request);
    const { studentId: rawStudentId } = await context.params;
    const studentId = studentIdSchema.parse(rawStudentId);
    return adminJson({ workspace: await getStudentWorkspace(studentId) });
  } catch (error) {
    return adminError(error);
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ studentId: string }> },
) {
  try {
    assertSameOrigin(request);
    const admin = await requireAdminApi(request);
    const { studentId: rawStudentId } = await context.params;
    const studentId = studentIdSchema.parse(rawStudentId);
    const input = studentRecordActionSchema.parse(await request.json());
    const record = await createStudentRecord(studentId, input, admin.email);
    return adminJson({ record }, { status: input.action.endsWith(".create") ? 201 : 200 });
  } catch (error) {
    return adminError(error);
  }
}
