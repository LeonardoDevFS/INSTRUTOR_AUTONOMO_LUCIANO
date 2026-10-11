import "server-only";

import { createHash } from "node:crypto";

import { Pool, type PoolClient, type QueryResultRow } from "pg";

import { createBookingDatabasePoolConfig } from "@/lib/booking/postgres-config";

export type BookingRow = {
  id: string;
  status: "holding" | "confirmed" | "failed" | "cancelled";
  google_event_id: string | null;
  starts_at: string;
  ends_at: string;
  calendar_sync_status?: "pending" | "synced" | "cancel_pending" | "error";
};

let bookingPool: Pool | undefined;

function database() {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("BOOKING_DATABASE_NOT_CONFIGURED");
  }

  bookingPool ??= new Pool(createBookingDatabasePoolConfig());
  return bookingPool;
}

async function query<Row extends QueryResultRow>(text: string, values: unknown[] = []) {
  return database().query<Row>(text, values);
}

async function transaction<T>(operation: (client: PoolClient) => Promise<T>) {
  const client = await database().connect();
  try {
    await client.query("BEGIN");
    const result = await operation(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function rateLimitBooking(ip: string) {
  const key = createHash("sha256").update(ip).digest("hex");
  const result = await query<{ request_count: number }>(
    `
      INSERT INTO booking_rate_limits (key_hash, bucket_start, request_count)
      VALUES ($1, date_trunc('hour', now()), 1)
      ON CONFLICT (key_hash, bucket_start)
      DO UPDATE SET request_count = booking_rate_limits.request_count + 1
      RETURNING request_count
    `,
    [key],
  );
  return Number(result.rows[0]?.request_count ?? 0) <= 5;
}

export async function listReservedRanges(from: Date, to: Date) {
  const result = await query<{ starts_at: string; ends_at: string }>(
    `
      SELECT starts_at, ends_at
      FROM booking_reservations
      WHERE status IN ('holding', 'confirmed')
        AND starts_at < $1::timestamptz
        AND ends_at > $2::timestamptz
    `,
    [to.toISOString(), from.toISOString()],
  );
  return result.rows.map((row) => ({
    start: new Date(row.starts_at),
    end: new Date(row.ends_at),
  }));
}

export async function findBookingByIdempotency(idempotencyKey: string) {
  const result = await query<BookingRow>(
    `
      SELECT id, status, google_event_id, starts_at, ends_at, calendar_sync_status
      FROM booking_reservations
      WHERE idempotency_key = $1::uuid
      LIMIT 1
    `,
    [idempotencyKey],
  );
  return result.rows[0] ?? null;
}

export async function listBookingsPendingReconciliation(limit = 10) {
  const result = await query<BookingRow>(
    `
      SELECT id, status, google_event_id, starts_at, ends_at, calendar_sync_status
      FROM booking_reservations
      WHERE (
        status = 'holding'
        AND hold_expires_at <= now()
      ) OR (
        status = 'cancelled'
        AND calendar_sync_status = 'cancel_pending'
      )
      ORDER BY updated_at ASC
      LIMIT $1
    `,
    [limit],
  );
  return result.rows;
}

export async function acquireBooking(input: {
  bookingId: string;
  idempotencyKey: string;
  slotKey: string;
  serviceId: string;
  start: Date;
  end: Date;
}) {
  return transaction(async (client) => {
    const inserted = await client.query<BookingRow>(
      `
        INSERT INTO booking_reservations (
          id, idempotency_key, slot_key, service_id, starts_at, ends_at,
          status, hold_expires_at, calendar_sync_status
        )
        VALUES (
          $1::uuid, $2::uuid, $3, $4, $5::timestamptz,
          $6::timestamptz, 'holding', now() + interval '3 minutes', 'pending'
        )
        ON CONFLICT DO NOTHING
        RETURNING id, status, google_event_id, starts_at, ends_at, calendar_sync_status
      `,
      [
        input.bookingId,
        input.idempotencyKey,
        input.slotKey,
        input.serviceId,
        input.start.toISOString(),
        input.end.toISOString(),
      ],
    );
    if (inserted.rows[0]) {
      return { state: "acquired" as const, row: inserted.rows[0] };
    }

    const existing = await client.query<BookingRow>(
      `
        SELECT id, status, google_event_id, starts_at, ends_at, calendar_sync_status
        FROM booking_reservations
        WHERE idempotency_key = $1::uuid
        LIMIT 1
      `,
      [input.idempotencyKey],
    );
    if (existing.rows[0]) {
      return { state: "idempotent" as const, row: existing.rows[0] };
    }
    return { state: "conflict" as const };
  });
}

export async function confirmBooking(bookingId: string, googleEventId: string) {
  await query(
    `
      UPDATE booking_reservations
      SET status = 'confirmed', google_event_id = $2,
          hold_expires_at = NULL, calendar_sync_status = 'synced',
          last_sync_error = NULL, sync_attempts = sync_attempts + 1,
          updated_at = now()
      WHERE id = $1::uuid
    `,
    [bookingId, googleEventId],
  );
}

export async function failBooking(bookingId: string, syncError?: string) {
  await query(
    `
      UPDATE booking_reservations
      SET status = 'failed', slot_key = NULL,
          calendar_sync_status = 'error', last_sync_error = $2,
          sync_attempts = sync_attempts + 1, updated_at = now()
      WHERE id = $1::uuid AND status = 'holding'
    `,
    [bookingId, syncError?.slice(0, 160) ?? null],
  );
}

export async function recordBookingSyncError(bookingId: string, message: string) {
  await query(
    `
      UPDATE booking_reservations
      SET last_sync_error = $2, sync_attempts = sync_attempts + 1,
          updated_at = now()
      WHERE id = $1::uuid
    `,
    [bookingId, message.slice(0, 160)],
  );
}

export async function beginCancelBookingByGoogleEventId(eventId: string) {
  await query(
    `
      UPDATE booking_reservations
      SET status = 'cancelled', slot_key = NULL,
          calendar_sync_status = 'cancel_pending', updated_at = now()
      WHERE google_event_id = $1 AND status IN ('confirmed', 'cancelled')
    `,
    [eventId],
  );
}

export async function completeCancelBookingByGoogleEventId(eventId: string) {
  await query(
    `
      UPDATE booking_reservations
      SET calendar_sync_status = 'synced', last_sync_error = NULL,
          sync_attempts = sync_attempts + 1, updated_at = now()
      WHERE google_event_id = $1 AND status = 'cancelled'
    `,
    [eventId],
  );
}
