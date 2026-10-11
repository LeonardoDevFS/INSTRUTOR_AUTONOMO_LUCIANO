import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const migration = readFileSync(resolve("database/students.sql"), "utf8");
const verifier = readFileSync(resolve("scripts/verify-students-database.ts"), "utf8");

test("migracao de alunos e aditiva e nao contem comandos destrutivos", () => {
  assert.equal(/\b(DROP|TRUNCATE|DELETE\s+FROM)\b/i.test(migration), false);
  assert.match(migration, /ADD COLUMN IF NOT EXISTS student_id uuid/i);
  assert.match(migration, /booking_reservations_student_id_fkey[\s\S]*ON DELETE SET NULL/i);
});

test("migracao cria todas as entidades planejadas", () => {
  for (const table of [
    "students", "lessons", "student_skill_assessments", "license_processes",
    "contracts", "payments", "student_notes", "student_audit_log",
  ]) {
    assert.match(migration, new RegExp(`CREATE TABLE IF NOT EXISTS public\\.${table}\\b`, "i"));
  }
});

test("migracao protege tabelas com RLS e revoga acesso publico", () => {
  for (const table of [
    "students", "lessons", "student_skill_assessments", "license_processes",
    "contracts", "payments", "student_notes", "student_audit_log",
  ]) {
    assert.match(migration, new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY`, "i"));
    assert.match(migration, new RegExp(`REVOKE ALL ON TABLE public\\.${table} FROM anon, authenticated`, "i"));
  }
});

test("pagamento aceita contrato nulo e exige contrato do mesmo aluno", () => {
  assert.match(migration, /contract_id uuid,/i);
  assert.doesNotMatch(migration, /contract_id uuid NOT NULL/i);
  assert.match(migration, /CONSTRAINT contracts_id_student_unique UNIQUE \(id, student_id\)/i);
  assert.match(migration, /payments_contract_student_fkey[\s\S]*FOREIGN KEY \(contract_id, student_id\)[\s\S]*REFERENCES public\.contracts \(id, student_id\)[\s\S]*ON DELETE RESTRICT/i);
});

test("avaliacao so pode apontar para aula do mesmo aluno", () => {
  assert.match(migration, /CONSTRAINT lessons_id_student_unique UNIQUE \(id, student_id\)/i);
  assert.match(migration, /student_skills_lesson_student_fkey[\s\S]*FOREIGN KEY \(lesson_id, student_id\)[\s\S]*REFERENCES public\.lessons \(id, student_id\)[\s\S]*ON DELETE RESTRICT/i);
});

test("aula so pode apontar para reserva vinculada ao mesmo aluno", () => {
  assert.match(migration, /booking_reservations_id_student_unique[\s\S]*UNIQUE \(id, student_id\)/i);
  assert.match(migration, /lessons_booking_student_fkey[\s\S]*FOREIGN KEY \(booking_reservation_id, student_id\)[\s\S]*REFERENCES public\.booking_reservations \(id, student_id\)[\s\S]*ON DELETE RESTRICT/i);
});

test("duplicidade exige confirmacao administrativa sem indice unique impeditivo", () => {
  assert.doesNotMatch(migration, /CREATE UNIQUE INDEX[^;]*students_(?:obvious_)?identity/iu);
  assert.match(migration, /CREATE INDEX IF NOT EXISTS students_identity_lookup_idx/i);
  assert.match(migration, /duplicate_confirmed_at timestamptz/i);
  assert.match(migration, /duplicate_confirmed_by text/i);
  assert.match(migration, /students_duplicate_confirmation_required/i);
  assert.match(migration, /pg_advisory_xact_lock/i);
});

test("updated_at e mantido automaticamente nas tabelas mutaveis", () => {
  assert.match(migration, /CREATE OR REPLACE FUNCTION public\.direcao_segura_touch_updated_at/i);
  for (const table of ["students", "license_processes", "lessons", "contracts", "payments", "booking_reservations"]) {
    assert.match(migration, new RegExp(`'${table}'`, "i"));
  }
});

test("verificador cobre os quatro cenarios relacionais obrigatorios", () => {
  for (const marker of [
    "payment-other-student-contract",
    "assessment-other-student-lesson",
    "lesson-other-student-reservation",
    "confirmed-administrative-duplicate",
  ]) {
    assert.match(verifier, new RegExp(marker));
  }
  assert.match(verifier, /ROLLBACK/);
});
