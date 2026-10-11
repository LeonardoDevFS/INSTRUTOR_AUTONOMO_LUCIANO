import { PostgresConfigError } from "./postgres-config";

export type PostgresFailureCategory =
  | "configuration"
  | "tls"
  | "dns"
  | "network"
  | "authentication"
  | "permission"
  | "schema"
  | "query";

export type PostgresFailurePhase = "configuration" | "connection" | "query";

const allowedTechnicalCodes = [
  "28P01",
  "28000",
  "42501",
  "42P01",
  "42703",
  "SELF_SIGNED_CERT_IN_CHAIN",
  "DEPTH_ZERO_SELF_SIGNED_CERT",
  "UNABLE_TO_GET_ISSUER_CERT",
  "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
  "ERR_TLS_CERT_ALTNAME_INVALID",
  "CERT_UNTRUSTED",
  "CERT_HAS_EXPIRED",
  "ENOTFOUND",
  "EAI_AGAIN",
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "08000",
  "08001",
  "08003",
  "08004",
  "08006",
  "08007",
  "08P01",
  "53300",
  "57P03",
  "3D000",
  "3F000",
  "42601",
  "42804",
  "42883",
  "22P02",
  "22003",
  "57014",
  "DATABASE_URL_MISSING",
  "DATABASE_URL_INVALID",
  "DATABASE_TARGET_INVALID",
  "DATABASE_SSLMODE_INVALID",
  "DATABASE_SSL_PARAMETERS_INVALID",
  "DATABASE_CA_CONFLICT",
  "DATABASE_CA_INVALID",
  "DATABASE_CA_READ_FAILED",
  "DATABASE_TLS_NOT_ENCRYPTED",
  "DATABASE_TLS_UNAUTHORIZED",
] as const;

export type AllowedPostgresTechnicalCode = (typeof allowedTechnicalCodes)[number];

const allowedCodeSet = new Set<string>(allowedTechnicalCodes);

const categoriesByCode: Partial<
  Record<AllowedPostgresTechnicalCode, PostgresFailureCategory>
> = {
  "28P01": "authentication",
  "28000": "authentication",
  "42501": "permission",
  "42P01": "schema",
  "42703": "schema",
  SELF_SIGNED_CERT_IN_CHAIN: "tls",
  DEPTH_ZERO_SELF_SIGNED_CERT: "tls",
  UNABLE_TO_GET_ISSUER_CERT: "tls",
  UNABLE_TO_GET_ISSUER_CERT_LOCALLY: "tls",
  UNABLE_TO_VERIFY_LEAF_SIGNATURE: "tls",
  ERR_TLS_CERT_ALTNAME_INVALID: "tls",
  CERT_UNTRUSTED: "tls",
  CERT_HAS_EXPIRED: "tls",
  ENOTFOUND: "dns",
  EAI_AGAIN: "dns",
  ECONNREFUSED: "network",
  ECONNRESET: "network",
  ETIMEDOUT: "network",
  EHOSTUNREACH: "network",
  ENETUNREACH: "network",
  "08000": "network",
  "08001": "network",
  "08003": "network",
  "08004": "network",
  "08006": "network",
  "08007": "network",
  "08P01": "network",
  "53300": "network",
  "57P03": "network",
  "3D000": "configuration",
  "3F000": "schema",
  DATABASE_URL_MISSING: "configuration",
  DATABASE_URL_INVALID: "configuration",
  DATABASE_TARGET_INVALID: "configuration",
  DATABASE_SSLMODE_INVALID: "configuration",
  DATABASE_SSL_PARAMETERS_INVALID: "configuration",
  DATABASE_CA_CONFLICT: "configuration",
  DATABASE_CA_INVALID: "configuration",
  DATABASE_CA_READ_FAILED: "configuration",
  DATABASE_TLS_NOT_ENCRYPTED: "tls",
  DATABASE_TLS_UNAUTHORIZED: "tls",
};

type DiagnosticEnvironment = {
  DATABASE_URL?: string;
  SUPABASE_CA_CERT_PEM?: string;
  NODE_ENV?: string;
};

export type SafePostgresDiagnostic = {
  category: PostgresFailureCategory;
  technicalCode?: AllowedPostgresTechnicalCode;
  databaseUrlPresent: boolean;
  supabaseCaCertPemPresent: boolean;
  production: boolean;
};

function allowedCode(value: unknown): AllowedPostgresTechnicalCode | undefined {
  return typeof value === "string" && allowedCodeSet.has(value)
    ? (value as AllowedPostgresTechnicalCode)
    : undefined;
}

function findAllowedCode(error: unknown, depth = 0): AllowedPostgresTechnicalCode | undefined {
  if (depth > 2 || typeof error !== "object" || error === null) return undefined;
  if (error instanceof PostgresConfigError) return error.technicalCode;

  if ("code" in error) {
    const code = allowedCode(error.code);
    if (code) return code;
  }

  if ("cause" in error) {
    const causeCode = findAllowedCode(error.cause, depth + 1);
    if (causeCode) return causeCode;
  }

  if ("errors" in error && Array.isArray(error.errors)) {
    for (const nestedError of error.errors) {
      const nestedCode = findAllowedCode(nestedError, depth + 1);
      if (nestedCode) return nestedCode;
    }
  }

  return undefined;
}

export function createSafePostgresDiagnostic(
  error: unknown,
  phase: PostgresFailurePhase,
  environment: DiagnosticEnvironment = process.env,
): SafePostgresDiagnostic {
  const technicalCode = findAllowedCode(error);
  const category = technicalCode
    ? (categoriesByCode[technicalCode] ?? "query")
    : phase === "configuration"
      ? "configuration"
      : phase === "connection"
        ? "network"
        : "query";

  return {
    category,
    ...(technicalCode ? { technicalCode } : {}),
    databaseUrlPresent: Boolean(environment.DATABASE_URL?.trim()),
    supabaseCaCertPemPresent: Boolean(environment.SUPABASE_CA_CERT_PEM?.trim()),
    production: environment.NODE_ENV === "production",
  };
}
