import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const migration = readFileSync(resolve("database/booking.sql"), "utf8");

test("migração de cancelamento é aditiva e preserva registros", () => {
  assert.doesNotMatch(migration, /^\s*(DROP|TRUNCATE|DELETE\s+FROM)\b/im);
  assert.match(migration, /ADD COLUMN IF NOT EXISTS cancellation_token_hash text/i);
  assert.match(migration, /ADD COLUMN IF NOT EXISTS cancellation_requested_at timestamptz/i);
  assert.match(migration, /ADD COLUMN IF NOT EXISTS cancelled_at timestamptz/i);
});

test("token é único, validado e o acesso público permanece revogado", () => {
  assert.match(migration, /booking_cancellation_token_hash_unique_idx/i);
  assert.match(migration, /booking_cancellation_token_hash_check/i);
  assert.match(migration, /ALTER TABLE public\.booking_reservations ENABLE ROW LEVEL SECURITY/i);
  assert.match(migration, /REVOKE ALL ON TABLE public\.booking_reservations FROM anon, authenticated/i);
});

test("concorrência continua protegida por exclusão global de intervalos", () => {
  assert.match(migration, /booking_no_overlapping_active/i);
  assert.match(migration, /EXCLUDE USING gist[\s\S]*tstzrange\(starts_at, ends_at, '\[\)'\) WITH &&/i);
  assert.match(migration, /WHERE \(status IN \('holding', 'confirmed'\)\)/i);
});

test("cancelamento pendente permanece elegível para reconciliação", () => {
  assert.match(migration, /status IN \('confirmed', 'cancelled'\)[\s\S]*calendar_sync_status = 'cancel_pending'/i);
});
