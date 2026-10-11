import assert from "node:assert/strict";
import test from "node:test";

import {
  createBookingDatabasePoolConfig,
  inspectBookingDatabaseUrl,
} from "./postgres-config";

const secureUrl =
  "postgresql://postgres.project:password@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=verify-full";

test("aceita o Transaction Pooler com sslmode=verify-full", () => {
  const target = inspectBookingDatabaseUrl(secureUrl);

  assert.equal(target.port, "6543");
  assert.equal(target.sslMode, "verify-full");
});

test("rejeita modos TLS que não validam explicitamente certificado e hostname", () => {
  for (const mode of ["require", "verify-ca", "no-verify", "disable"]) {
    assert.throws(
      () => inspectBookingDatabaseUrl(secureUrl.replace("verify-full", mode)),
      /sslmode=verify-full/,
    );
  }
});

test("rejeita conexão fora do Transaction Pooler", () => {
  assert.throws(
    () =>
      inspectBookingDatabaseUrl(
        "postgresql://postgres:password@example.com:6543/postgres?sslmode=verify-full",
      ),
    /Supabase Transaction Pooler/,
  );
});

test("aplica uma CA explícita sem permitir que a URL substitua o objeto SSL", () => {
  const config = createBookingDatabasePoolConfig({
    DATABASE_URL: secureUrl,
    SUPABASE_CA_CERT_PEM:
      "-----BEGIN CERTIFICATE-----\\nTESTE\\n-----END CERTIFICATE-----",
  });
  const ssl = config.ssl as { ca?: string; rejectUnauthorized?: boolean };

  assert.doesNotMatch(config.connectionString ?? "", /sslmode=/);
  assert.equal(ssl.rejectUnauthorized, true);
  assert.match(ssl.ca ?? "", /BEGIN CERTIFICATE/);
});
