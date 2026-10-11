import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const migration = readFileSync(resolve("database/students.sql"), "utf8");

test("migração de alunos é aditiva e não contém comandos destrutivos", () => {
  assert.equal(/\b(DROP|TRUNCATE|DELETE\s+FROM)\b/i.test(migration), false);
  assert.match(migration, /ADD COLUMN IF NOT EXISTS student_id uuid/i);
  assert.match(migration, /ON DELETE SET NULL/i);
});

test("migração cria todas as entidades planejadas", () => {
  for (const table of [
    "students",
    "lessons",
    "student_skill_assessments",
    "license_processes",
    "contracts",
    "payments",
    "student_notes",
    "student_audit_log",
  ]) {
    assert.match(migration, new RegExp(`CREATE TABLE IF NOT EXISTS public\\.${table}\\b`, "i"));
  }
});

test("migração protege todas as novas tabelas com RLS e revoga acesso público", () => {
  for (const table of [
    "students",
    "lessons",
    "student_skill_assessments",
    "license_processes",
    "contracts",
    "payments",
    "student_notes",
    "student_audit_log",
  ]) {
    assert.match(migration, new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY`, "i"));
    assert.match(migration, new RegExp(`REVOKE ALL ON TABLE public\\.${table} FROM anon, authenticated`, "i"));
  }
});

test("integridade impede exclusão em cascata do histórico do aluno", () => {
  assert.match(migration, /student_id uuid NOT NULL REFERENCES public\.students\(id\) ON DELETE RESTRICT/i);
  assert.match(migration, /students_obvious_identity_unique_idx/i);
  assert.match(migration, /lessons_booking_reservation_unique_idx/i);
});
