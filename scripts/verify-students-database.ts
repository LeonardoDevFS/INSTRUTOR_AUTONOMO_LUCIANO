import { randomUUID } from "node:crypto";

import { loadEnvConfig } from "@next/env";
import { Pool, type PoolClient } from "pg";

import { assertAuthorizedPostgresTls, createBookingDatabasePoolConfig } from "../src/lib/booking/postgres-config";

loadEnvConfig(process.cwd());

const expectedTables = [
  "contracts",
  "lessons",
  "license_processes",
  "payments",
  "student_audit_log",
  "student_notes",
  "student_skill_assessments",
  "students",
] as const;

async function verifySchema(client: PoolClient) {
  const tables = await client.query<{ table_name: string }>(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = ANY($1::text[])
     ORDER BY table_name`,
    [[...expectedTables]],
  );
  const existing = new Set(tables.rows.map((row) => row.table_name));
  const missing = expectedTables.filter((table) => !existing.has(table));
  if (missing.length > 0) {
    throw new Error(`migração pendente; faltam: ${missing.join(", ")}`);
  }
  const studentColumn = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'booking_reservations'
         AND column_name = 'student_id'
     ) AS exists`,
  );
  if (!studentColumn.rows[0]?.exists) throw new Error("booking_reservations.student_id ausente");
}

async function verifyPermissions(client: PoolClient) {
  const result = await client.query<{
    relname: string;
    relrowsecurity: boolean;
    anon_access: boolean;
    authenticated_access: boolean;
  }>(
    `SELECT c.relname, c.relrowsecurity,
       has_table_privilege('anon', c.oid, 'SELECT,INSERT,UPDATE,DELETE') AS anon_access,
       has_table_privilege('authenticated', c.oid, 'SELECT,INSERT,UPDATE,DELETE') AS authenticated_access
     FROM pg_class c
     WHERE c.oid = ANY($1::regclass[])
     ORDER BY c.relname`,
    [expectedTables.map((table) => `public.${table}`)],
  );
  if (result.rows.length !== expectedTables.length || result.rows.some((row) => !row.relrowsecurity || row.anon_access || row.authenticated_access)) {
    throw new Error("RLS ou permissões privadas não correspondem ao esperado");
  }
}

async function verifyRelations(client: PoolClient) {
  await client.query("BEGIN");
  const studentId = randomUUID();
  const lessonId = randomUUID();
  await client.query(
    `INSERT INTO students (id, full_name, phone, phone_normalized, training_category, service_type)
     VALUES ($1::uuid, 'Verificação temporária', '(35) 99999-0000', '35999990000', 'B', 'Verificação')`,
    [studentId],
  );
  await client.query(
    `INSERT INTO lessons (id, student_id, modality, starts_at, duration_minutes)
     VALUES ($1::uuid, $2::uuid, 'Verificação', '2200-01-01T10:00:00Z', 50)`,
    [lessonId, studentId],
  );
  await client.query(
    `INSERT INTO student_skill_assessments
      (student_id, lesson_id, vehicle_category, skill_code, skill_label, level, assessed_on)
     VALUES ($1::uuid, $2::uuid, 'B', 'verificacao', 'Verificação', 'not_assessed', '2200-01-01')`,
    [studentId, lessonId],
  );
  await client.query("ROLLBACK");
}

async function main() {
  const pool = new Pool(createBookingDatabasePoolConfig());
  const client = await pool.connect();
  try {
    assertAuthorizedPostgresTls(client);
    console.log("✓ TLS, certificado e hostname");
    await verifySchema(client);
    console.log("✓ Tabelas e vínculo opcional com reservas");
    await verifyPermissions(client);
    console.log("✓ RLS e revogação de acesso público");
    await verifyRelations(client);
    console.log("✓ Integridade referencial; registros técnicos revertidos");
  } catch (error) {
    try { await client.query("ROLLBACK"); } catch { /* conexão pode estar indisponível */ }
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  const detail = error instanceof Error && error.message.startsWith("migração pendente")
    ? error.message
    : "verificação indisponível; consulte a configuração privada do banco";
  console.error(`Gestão de Alunos: ${detail}.`);
  process.exitCode = 1;
});
