import type { StudentSummary } from "@/lib/students/types";

export function protectSpreadsheetCell(value: string | null) {
  const original = value ?? "";
  const protectedValue = /^[=+\-@]/.test(original.trimStart())
    ? `'${original}`
    : original;
  return `"${protectedValue.replaceAll('"', '""')}"`;
}

export function createStudentsCsv(students: StudentSummary[]) {
  const rows = [
    ["Nome", "Telefone", "E-mail", "Nascimento", "Categoria", "Atendimento", "Situação", "Cadastro"],
    ...students.map((student) => [
      student.fullName,
      student.phone,
      student.email ?? "",
      student.birthDate ?? "",
      student.trainingCategory,
      student.serviceType,
      student.status,
      student.createdAt.slice(0, 10),
    ]),
  ];
  return `\uFEFF${rows.map((row) => row.map(protectSpreadsheetCell).join(";")).join("\r\n")}`;
}
