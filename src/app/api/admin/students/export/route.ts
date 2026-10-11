import type { NextRequest } from "next/server";

import { adminError } from "@/lib/api/admin-response";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { createStudentsCsv } from "@/lib/students/csv";
import { listStudentsForExport } from "@/lib/students/database";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdminApi(request);
    const students = await listStudentsForExport();
    const csv = createStudentsCsv(students);
    return new Response(csv, {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "Content-Disposition": `attachment; filename="alunos-direcao-segura-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Content-Type": "text/csv; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch (error) {
    return adminError(error);
  }
}
