import type { NextRequest } from "next/server";

import { adminError, adminJson } from "@/lib/api/admin-response";
import { assertSameOrigin, requireAdminApi } from "@/lib/auth/require-admin";
import { archiveStudent, getStudentWorkspace, updateStudent } from "@/lib/students/database";
import { archiveStudentSchema, studentIdSchema, studentInputSchema } from "@/lib/students/schemas";

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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ studentId: string }> },
) {
  try {
    assertSameOrigin(request);
    const admin = await requireAdminApi(request);
    const { studentId: rawStudentId } = await context.params;
    const studentId = studentIdSchema.parse(rawStudentId);
    const input = studentInputSchema.parse(await request.json());
    const student = await updateStudent(studentId, input, admin.email);
    return adminJson({ student });
  } catch (error) {
    return adminError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ studentId: string }> },
) {
  try {
    assertSameOrigin(request);
    const admin = await requireAdminApi(request);
    const { studentId: rawStudentId } = await context.params;
    const studentId = studentIdSchema.parse(rawStudentId);
    const confirmation = archiveStudentSchema.parse(await request.json());
    if (confirmation.confirmStudentId !== studentId) {
      return adminJson(
        { error: "A confirmação não corresponde ao aluno selecionado.", code: "INVALID_CONFIRMATION" },
        { status: 403 },
      );
    }
    await archiveStudent(studentId, admin.email);
    return adminJson({ archived: true, studentId });
  } catch (error) {
    return adminError(error);
  }
}
