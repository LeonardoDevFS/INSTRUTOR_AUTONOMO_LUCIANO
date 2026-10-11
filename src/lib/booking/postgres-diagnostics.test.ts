import assert from "node:assert/strict";
import test from "node:test";

import { createSafePostgresDiagnostic } from "./postgres-diagnostics";
import { PostgresConfigError } from "./postgres-config";

const productionEnvironment = {
  DATABASE_URL: "configured-but-never-logged",
  SUPABASE_CA_CERT_PEM: "configured-but-never-logged",
  NODE_ENV: "production",
};

test("classifica códigos técnicos permitidos sem copiar detalhes do erro", () => {
  const cases = [
    ["28P01", "authentication"],
    ["42501", "permission"],
    ["42P01", "schema"],
    ["42703", "schema"],
    ["SELF_SIGNED_CERT_IN_CHAIN", "tls"],
    ["UNABLE_TO_VERIFY_LEAF_SIGNATURE", "tls"],
    ["ERR_TLS_CERT_ALTNAME_INVALID", "tls"],
    ["ENOTFOUND", "dns"],
    ["ECONNREFUSED", "network"],
    ["ETIMEDOUT", "network"],
  ] as const;

  for (const [code, category] of cases) {
    const error = Object.assign(new Error("sensitive-message"), {
      code,
      stack: "sensitive-stack",
    });
    const diagnostic = createSafePostgresDiagnostic(
      error,
      "query",
      productionEnvironment,
    );

    assert.deepEqual(diagnostic, {
      category,
      technicalCode: code,
      databaseUrlPresent: true,
      supabaseCaCertPemPresent: true,
      production: true,
    });
    assert.doesNotMatch(JSON.stringify(diagnostic), /sensitive/);
  }
});

test("não registra código fora da allowlist", () => {
  const diagnostic = createSafePostgresDiagnostic(
    { code: "PRIVATE_INTERNAL_CODE", message: "secret" },
    "query",
    {},
  );

  assert.deepEqual(diagnostic, {
    category: "query",
    databaseUrlPresent: false,
    supabaseCaCertPemPresent: false,
    production: false,
  });
});

test("classifica falhas tipadas de configuração", () => {
  const diagnostic = createSafePostgresDiagnostic(
    new PostgresConfigError("DATABASE_CA_INVALID", "private detail"),
    "connection",
    productionEnvironment,
  );

  assert.equal(diagnostic.category, "configuration");
  assert.equal(diagnostic.technicalCode, "DATABASE_CA_INVALID");
});

test("encontra código seguro em erros de conexão agregados", () => {
  const diagnostic = createSafePostgresDiagnostic(
    { errors: [{ code: "ECONNREFUSED", message: "private endpoint" }] },
    "connection",
    productionEnvironment,
  );

  assert.equal(diagnostic.category, "network");
  assert.equal(diagnostic.technicalCode, "ECONNREFUSED");
});
