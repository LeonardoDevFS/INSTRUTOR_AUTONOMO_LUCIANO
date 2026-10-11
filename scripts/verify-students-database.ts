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

const expectedConstraints = [
  "booking_reservations_id_student_unique",
  "contracts_id_student_unique",
  "lessons_id_student_unique",
  "lessons_booking_student_fkey",
  "students_duplicate_confirmation_check",
  "student_skills_lesson_student_fkey",
  "payments_contract_student_fkey",
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

  const constraints = await client.query<{ conname: string }>(
    `SELECT conname FROM pg_constraint
     WHERE connamespace = 'public'::regnamespace
       AND conname = ANY($1::text[])`,
    [[...expectedConstraints]],
  );
  const foundConstraints = new Set(constraints.rows.map((row) => row.conname));
  const missingConstraints = expectedConstraints.filter((name) => !foundConstraints.has(name));
  if (missingConstraints.length > 0) {
    throw new Error(`restrições de integridade ausentes: ${missingConstraints.join(", ")}`);
  }

  const identityIndexes = await client.query<{ name: string; is_unique: boolean }>(
    `SELECT index_relation.relname AS name, index_definition.indisunique AS is_unique
     FROM pg_index index_definition
     JOIN pg_class index_relation ON index_relation.oid = index_definition.indexrelid
     WHERE index_definition.indrelid = 'public.students'::regclass
       AND index_relation.relname = ANY($1::text[])`,
    [["students_identity_lookup_idx", "students_obvious_identity_unique_idx"]],
  );
  const lookupIndex = identityIndexes.rows.find((index) => index.name === "students_identity_lookup_idx");
  const obsoleteUniqueIndex = identityIndexes.rows.find((index) => index.name === "students_obvious_identity_unique_idx");
  if (!lookupIndex || lookupIndex.is_unique || obsoleteUniqueIndex) {
    throw new Error("política de índice para confirmação de duplicidade não corresponde ao esperado");
  }

  const triggers = await client.query<{ count: string }>(
    `SELECT count(*)::text AS count
     FROM pg_trigger trigger_definition
     JOIN pg_class trigger_table ON trigger_table.oid = trigger_definition.tgrelid
     WHERE NOT tgisinternal
       AND trigger_table.relnamespace = 'public'::regnamespace
       AND tgname = ANY($1::text[])`,
    [[
      "students_enforce_duplicate_confirmation",
      "students_touch_updated_at",
      "license_processes_touch_updated_at",
      "lessons_touch_updated_at",
      "contracts_touch_updated_at",
      "payments_touch_updated_at",
      "booking_reservations_touch_updated_at",
    ]],
  );
  if (Number(triggers.rows[0]?.count ?? 0) !== 7) {
    throw new Error("triggers de duplicidade ou updated_at ausentes");
  }
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
  if (
    result.rows.length !== expectedTables.length
    || result.rows.some((row) => !row.relrowsecurity || row.anon_access || row.authenticated_access)
  ) {
    throw new Error("RLS ou permissões privadas não correspondem ao esperado");
  }

  const functionPrivileges = await client.query<{
    anon_duplicate: boolean;
    authenticated_duplicate: boolean;
    anon_updated_at: boolean;
    authenticated_updated_at: boolean;
  }>(
    `SELECT
       has_function_privilege('anon', 'public.direcao_segura_enforce_student_duplicates()', 'EXECUTE') AS anon_duplicate,
       has_function_privilege('authenticated', 'public.direcao_segura_enforce_student_duplicates()', 'EXECUTE') AS authenticated_duplicate,
       has_function_privilege('anon', 'public.direcao_segura_touch_updated_at()', 'EXECUTE') AS anon_updated_at,
       has_function_privilege('authenticated', 'public.direcao_segura_touch_updated_at()', 'EXECUTE') AS authenticated_updated_at`,
  );
  const privileges = functionPrivileges.rows[0];
  if (!privileges || Object.values(privileges).some(Boolean)) {
    throw new Error("funções internas ainda permitem execução por papéis públicos");
  }
}

function postgresCode(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error
    ? String(error.code)
    : "";
}

async function expectBlocked(
  client: PoolClient,
  marker: string,
  operation: () => Promise<unknown>,
  expectedCode: "23503" | "23505",
) {
  await client.query("SAVEPOINT expected_integrity_failure");
  try {
    await operation();
  } catch (error) {
    const code = postgresCode(error);
    await client.query("ROLLBACK TO SAVEPOINT expected_integrity_failure");
    await client.query("RELEASE SAVEPOINT expected_integrity_failure");
    if (code === expectedCode) return;
    throw new Error(`${marker}: bloqueio retornou SQLSTATE inesperado (${code || "ausente"})`);
  }
  await client.query("ROLLBACK TO SAVEPOINT expected_integrity_failure");
  await client.query("RELEASE SAVEPOINT expected_integrity_failure");
  throw new Error(`${marker}: vínculo inválido não foi bloqueado`);
}

async function verifyRelations(client: PoolClient) {
  await client.query("BEGIN");
  try {
    const suffix = randomUUID();
    const studentA = randomUUID();
    const studentB = randomUUID();
    const contractA = randomUUID();
    const lessonA = randomUUID();
    const reservationA = randomUUID();
    const reservationForInvalidCase = randomUUID();
    const unlinkedReservation = randomUUID();

    await client.query(
      `INSERT INTO students
        (id, full_name, phone, phone_normalized, training_category, service_type)
       VALUES
        ($1::uuid, $3, '(35) 99999-0101', '35999990101', 'B', 'Verificação'),
        ($2::uuid, $4, '(35) 99999-0102', '35999990102', 'A', 'Verificação')`,
      [studentA, studentB, `Integridade A ${suffix}`, `Integridade B ${suffix}`],
    );

    await client.query(
      `INSERT INTO contracts (id, student_id, description, amount)
       VALUES ($1::uuid, $2::uuid, 'Contrato técnico', 100)`,
      [contractA, studentA],
    );
    await client.query(
      `INSERT INTO payments (student_id, contract_id, amount, method, paid_on)
       VALUES ($1::uuid, $2::uuid, 50, 'pix', current_date),
              ($1::uuid, NULL, 25, 'cash', current_date)`,
      [studentA, contractA],
    );
    await expectBlocked(
      client,
      "payment-other-student-contract",
      () => client.query(
        `INSERT INTO payments (student_id, contract_id, amount, method, paid_on)
         VALUES ($1::uuid, $2::uuid, 10, 'pix', current_date)`,
        [studentB, contractA],
      ),
      "23503",
    );

    await client.query(
      `INSERT INTO lessons (id, student_id, modality, starts_at, duration_minutes)
       VALUES ($1::uuid, $2::uuid, 'Carro', '2201-01-01T10:00:00Z', 50)`,
      [lessonA, studentA],
    );
    await client.query(
      `INSERT INTO student_skill_assessments
        (student_id, lesson_id, vehicle_category, skill_code, skill_label, level)
       VALUES ($1::uuid, $2::uuid, 'B', 'validacao', 'Validação', 'developing')`,
      [studentA, lessonA],
    );
    await expectBlocked(
      client,
      "assessment-other-student-lesson",
      () => client.query(
        `INSERT INTO student_skill_assessments
          (student_id, lesson_id, vehicle_category, skill_code, skill_label, level)
         VALUES ($1::uuid, $2::uuid, 'A', 'invalida', 'Inválida', 'learning')`,
        [studentB, lessonA],
      ),
      "23503",
    );

    await client.query(
      `INSERT INTO booking_reservations
        (id, idempotency_key, service_id, starts_at, ends_at, status, student_id)
       VALUES
        ($1::uuid, $4::uuid, 'verification', '2201-01-02T10:00:00Z', '2201-01-02T10:50:00Z', 'confirmed', $3::uuid),
        ($2::uuid, $5::uuid, 'verification', '2201-01-03T10:00:00Z', '2201-01-03T10:50:00Z', 'confirmed', $3::uuid),
        ($6::uuid, $7::uuid, 'verification', '2201-01-04T10:00:00Z', '2201-01-04T10:50:00Z', 'confirmed', NULL)`,
      [
        reservationA,
        reservationForInvalidCase,
        studentA,
        randomUUID(),
        randomUUID(),
        unlinkedReservation,
        randomUUID(),
      ],
    );
    await client.query(
      `INSERT INTO lessons
        (student_id, modality, starts_at, duration_minutes, booking_reservation_id)
       VALUES ($1::uuid, 'Carro', '2201-01-02T10:00:00Z', 50, $2::uuid)`,
      [studentA, reservationA],
    );
    await expectBlocked(
      client,
      "lesson-other-student-reservation",
      () => client.query(
        `INSERT INTO lessons
          (student_id, modality, starts_at, duration_minutes, booking_reservation_id)
         VALUES ($1::uuid, 'Moto', '2201-01-03T10:00:00Z', 50, $2::uuid)`,
        [studentB, reservationForInvalidCase],
      ),
      "23503",
    );

    await expectBlocked(
      client,
      "unconfirmed-obvious-duplicate",
      () => client.query(
        `INSERT INTO students
          (full_name, phone, phone_normalized, training_category, service_type)
         VALUES ($1, '(35) 99999-0101', '35999990101', 'B', 'Verificação')`,
        [`Integridade A ${suffix}`],
      ),
      "23505",
    );
    await client.query(
      `INSERT INTO students
        (full_name, phone, phone_normalized, training_category, service_type,
         duplicate_confirmed_at, duplicate_confirmed_by)
       VALUES ($1, '(35) 99999-0101', '35999990101', 'B', 'Verificação', now(), $2)`,
      [`Integridade A ${suffix}`, "verification-admin@example.invalid"],
    );
    // Marker consumed by the static test and documented in the terminal output.
    const confirmedCase = "confirmed-administrative-duplicate";
    if (!confirmedCase) throw new Error("marcador de confirmação ausente");

    const touched = await client.query<{ updated: boolean }>(
      `UPDATE students
       SET service_type = 'Verificação atualizada',
           updated_at = '2000-01-01T00:00:00Z'
       WHERE id = $1::uuid
       RETURNING updated_at > '2000-01-01T00:00:00Z'::timestamptz AS updated`,
      [studentB],
    );
    if (!touched.rows[0]?.updated) throw new Error("trigger de updated_at não atualizou students");
  } finally {
    await client.query("ROLLBACK");
  }
}

async function main() {
  const pool = new Pool(createBookingDatabasePoolConfig());
  const client = await pool.connect();
  try {
    assertAuthorizedPostgresTls(client);
    console.log("✓ TLS, certificado e hostname");
    await verifySchema(client);
    console.log("✓ Tabelas, constraints compostas e triggers");
    await verifyPermissions(client);
    console.log("✓ RLS e revogação de acesso público");
    await verifyRelations(client);
    console.log("✓ Vínculos cruzados bloqueados e casos válidos aceitos; ROLLBACK concluído");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  const detail = error instanceof Error && (
    error.message.startsWith("migração pendente")
    || error.message.startsWith("restrições de integridade ausentes")
    || error.message.includes("ausente")
  )
    ? error.message
    : "verificação indisponível; consulte a configuração privada do banco";
  console.error(`Gestão de Alunos: ${detail}.`);
  process.exitCode = 1;
});
