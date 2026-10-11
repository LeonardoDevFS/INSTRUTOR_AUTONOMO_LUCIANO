import { randomUUID } from "node:crypto";

import { loadEnvConfig } from "@next/env";
import { Pool, type PoolClient } from "pg";

import { createBookingDatabasePoolConfig } from "../src/lib/booking/postgres-config";

loadEnvConfig(process.cwd());

const requiredReservationColumns = [
  "calendar_sync_status",
  "created_at",
  "ends_at",
  "google_event_id",
  "hold_expires_at",
  "id",
  "idempotency_key",
  "last_sync_error",
  "service_id",
  "slot_key",
  "starts_at",
  "status",
  "sync_attempts",
  "updated_at",
];

async function verifyTls(client: PoolClient) {
  type TlsStream = {
    encrypted?: boolean;
    authorized?: boolean;
    authorizationError?: Error | string | null;
  };
  const stream = (
    client as unknown as { connection?: { stream?: TlsStream } }
  ).connection?.stream;

  if (!stream?.encrypted) {
    throw new Error("o socket cliente → Supabase não está criptografado.");
  }
  if (stream.authorized !== true || stream.authorizationError) {
    throw new Error(
      "o certificado ou o hostname do Supabase não foi validado pelo Node.js.",
    );
  }
}

async function verifySchema(client: PoolClient) {
  const tables = await client.query<{
    reservations: string | null;
    rate_limits: string | null;
  }>(`
    SELECT
      to_regclass('public.booking_reservations')::text AS reservations,
      to_regclass('public.booking_rate_limits')::text AS rate_limits
  `);
  if (!tables.rows[0]?.reservations || !tables.rows[0]?.rate_limits) {
    throw new Error("execute database/booking.sql antes da verificação.");
  }

  const columns = await client.query<{ column_name: string }>(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'booking_reservations'
    ORDER BY column_name
  `);
  const existingColumns = new Set(columns.rows.map((row) => row.column_name));
  const missingColumns = requiredReservationColumns.filter(
    (column) => !existingColumns.has(column),
  );
  if (missingColumns.length > 0) {
    throw new Error(`faltam colunas obrigatórias: ${missingColumns.join(", ")}.`);
  }

  const constraints = await client.query<{ conname: string }>(`
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.booking_reservations'::regclass
      AND conname IN (
        'booking_no_overlapping_active',
        'booking_calendar_sync_status_check',
        'booking_sync_attempts_check'
      )
  `);
  if (constraints.rows.length !== 3) {
    throw new Error("as restrições esperadas não estão completas.");
  }
}

async function verifyPermissions(client: PoolClient) {
  const security = await client.query<{
    relname: string;
    relrowsecurity: boolean;
    anon_access: boolean;
    authenticated_access: boolean;
    backend_access: boolean;
  }>(`
    SELECT
      c.relname,
      c.relrowsecurity,
      (
        has_table_privilege('anon', c.oid, 'SELECT') OR
        has_table_privilege('anon', c.oid, 'INSERT') OR
        has_table_privilege('anon', c.oid, 'UPDATE') OR
        has_table_privilege('anon', c.oid, 'DELETE')
      ) AS anon_access,
      (
        has_table_privilege('authenticated', c.oid, 'SELECT') OR
        has_table_privilege('authenticated', c.oid, 'INSERT') OR
        has_table_privilege('authenticated', c.oid, 'UPDATE') OR
        has_table_privilege('authenticated', c.oid, 'DELETE')
      ) AS authenticated_access,
      (
        has_table_privilege(current_user, c.oid, 'SELECT') AND
        has_table_privilege(current_user, c.oid, 'INSERT') AND
        has_table_privilege(current_user, c.oid, 'UPDATE') AND
        has_table_privilege(current_user, c.oid, 'DELETE')
      ) AS backend_access
    FROM pg_class c
    WHERE c.oid IN (
      'public.booking_reservations'::regclass,
      'public.booking_rate_limits'::regclass
    )
    ORDER BY c.relname
  `);

  if (
    security.rows.length !== 2 ||
    security.rows.some(
      (row) =>
        !row.relrowsecurity ||
        row.anon_access ||
        row.authenticated_access ||
        !row.backend_access,
    )
  ) {
    throw new Error(
      "RLS, acesso público ou privilégios do backend não estão seguros.",
    );
  }

  const policies = await client.query<{ policy_count: string }>(`
    SELECT count(*)::text AS policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('booking_reservations', 'booking_rate_limits')
  `);
  if (Number(policies.rows[0]?.policy_count ?? -1) !== 0) {
    throw new Error("as tabelas técnicas não devem possuir políticas públicas.");
  }
}

async function verifyTransactionalRules(client: PoolClient) {
  await client.query("BEGIN");

  const firstId = randomUUID();
  const firstIdempotencyKey = randomUUID();
  await client.query(
    `
      INSERT INTO public.booking_reservations (
        id, idempotency_key, slot_key, service_id, starts_at, ends_at,
        status, hold_expires_at
      ) VALUES (
        $1::uuid, $2::uuid, $3, 'database-verification',
        '2200-01-01T10:00:00Z'::timestamptz,
        '2200-01-01T10:50:00Z'::timestamptz,
        'holding', now() + interval '3 minutes'
      )
    `,
    [firstId, firstIdempotencyKey, `verify-${firstId}`],
  );

  await client.query("SAVEPOINT overlap_test");
  let overlapBlocked = false;
  try {
    const secondId = randomUUID();
    await client.query(
      `
        INSERT INTO public.booking_reservations (
          id, idempotency_key, slot_key, service_id, starts_at, ends_at,
          status, hold_expires_at
        ) VALUES (
          $1::uuid, $2::uuid, $3, 'database-verification',
          '2200-01-01T10:25:00Z'::timestamptz,
          '2200-01-01T11:15:00Z'::timestamptz,
          'holding', now() + interval '3 minutes'
        )
      `,
      [secondId, randomUUID(), `verify-${secondId}`],
    );
  } catch (error) {
    overlapBlocked =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23P01";
    await client.query("ROLLBACK TO SAVEPOINT overlap_test");
  }
  if (!overlapBlocked) {
    throw new Error("a restrição de sobreposição aceitou intervalos conflitantes.");
  }

  await client.query("SAVEPOINT idempotency_test");
  let duplicateBlocked = false;
  try {
    const duplicateId = randomUUID();
    await client.query(
      `
        INSERT INTO public.booking_reservations (
          id, idempotency_key, slot_key, service_id, starts_at, ends_at,
          status, hold_expires_at
        ) VALUES (
          $1::uuid, $2::uuid, $3, 'database-verification',
          '2200-01-01T12:00:00Z'::timestamptz,
          '2200-01-01T12:50:00Z'::timestamptz,
          'holding', now() + interval '3 minutes'
        )
      `,
      [duplicateId, firstIdempotencyKey, `verify-${duplicateId}`],
    );
  } catch (error) {
    duplicateBlocked =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505";
    await client.query("ROLLBACK TO SAVEPOINT idempotency_test");
  }
  if (!duplicateBlocked) {
    throw new Error("a idempotência aceitou uma chave duplicada.");
  }

  const firstRateLimit = await client.query<{ request_count: number }>(`
    INSERT INTO public.booking_rate_limits (key_hash, bucket_start, request_count)
    VALUES ('database-verification', date_trunc('hour', now()), 1)
    ON CONFLICT (key_hash, bucket_start)
    DO UPDATE SET request_count = public.booking_rate_limits.request_count + 1
    RETURNING request_count
  `);
  const secondRateLimit = await client.query<{ request_count: number }>(`
    INSERT INTO public.booking_rate_limits (key_hash, bucket_start, request_count)
    VALUES ('database-verification', date_trunc('hour', now()), 1)
    ON CONFLICT (key_hash, bucket_start)
    DO UPDATE SET request_count = public.booking_rate_limits.request_count + 1
    RETURNING request_count
  `);
  if (
    Number(firstRateLimit.rows[0]?.request_count) !== 1 ||
    Number(secondRateLimit.rows[0]?.request_count) !== 2
  ) {
    throw new Error("o contador de rate limit não foi incrementado corretamente.");
  }

  await client.query("ROLLBACK");
}

async function runCheck(label: string, check: () => Promise<void>) {
  try {
    await check();
    console.log(`✓ ${label}`);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "falha desconhecida";
    throw new Error(`${label}: ${detail}`);
  }
}

async function main() {
  const pool = new Pool(createBookingDatabasePoolConfig());
  const client = await pool.connect();

  try {
    await runCheck("TLS, certificado e hostname", () => verifyTls(client));
    await runCheck("Schema e restrições", () => verifySchema(client));
    await runCheck("RLS e permissões", () => verifyPermissions(client));
    await runCheck("Transação, sobreposição, idempotência e rate limit", () =>
      verifyTransactionalRules(client),
    );
    console.log(
      "Supabase validado com TLS verify-full; todos os registros de teste foram revertidos.",
    );
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // A conexão pode ter falhado antes de abrir uma transação.
    }
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error
      ? `Falha na verificação do banco: ${error.message}`
      : "Falha desconhecida na verificação do banco.",
  );
  process.exitCode = 1;
});
