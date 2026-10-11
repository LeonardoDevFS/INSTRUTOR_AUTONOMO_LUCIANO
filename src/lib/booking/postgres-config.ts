import { X509Certificate } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import type { PoolConfig } from "pg";

const REQUIRED_SSL_MODE = "verify-full";
const SUPABASE_POOLER_SUFFIX = ".pooler.supabase.com";

export type PostgresConfigTechnicalCode =
  | "DATABASE_URL_MISSING"
  | "DATABASE_URL_INVALID"
  | "DATABASE_TARGET_INVALID"
  | "DATABASE_SSLMODE_INVALID"
  | "DATABASE_SSL_PARAMETERS_INVALID"
  | "DATABASE_CA_CONFLICT"
  | "DATABASE_CA_INVALID"
  | "DATABASE_CA_READ_FAILED"
  | "DATABASE_TLS_NOT_ENCRYPTED"
  | "DATABASE_TLS_UNAUTHORIZED";

export class PostgresConfigError extends Error {
  constructor(
    public readonly technicalCode: PostgresConfigTechnicalCode,
    message: string,
  ) {
    super(message);
    this.name = "PostgresConfigError";
  }
}

type DatabaseEnvironment = {
  [key: string]: string | undefined;
  DATABASE_URL?: string;
  SUPABASE_CA_CERT_PEM?: string;
  SUPABASE_CA_CERT_PATH?: string;
};

export type BookingDatabaseTarget = {
  connectionString: string;
  hostname: string;
  port: string;
  sslMode: typeof REQUIRED_SSL_MODE;
};

type TlsClient = {
  connection?: {
    stream?: {
      encrypted?: boolean;
      authorized?: boolean;
      authorizationError?: Error | string | null;
    };
  };
};

export function assertAuthorizedPostgresTls(client: unknown) {
  const stream = (client as TlsClient).connection?.stream;
  if (!stream?.encrypted) {
    throw new PostgresConfigError(
      "DATABASE_TLS_NOT_ENCRYPTED",
      "o socket cliente → Supabase não está criptografado.",
    );
  }
  if (stream.authorized !== true || stream.authorizationError) {
    throw new PostgresConfigError(
      "DATABASE_TLS_UNAUTHORIZED",
      "o certificado ou o hostname do Supabase não foi validado pelo Node.js.",
    );
  }
}

export function inspectBookingDatabaseUrl(
  connectionString: string | undefined,
): BookingDatabaseTarget {
  if (!connectionString?.trim()) {
    throw new PostgresConfigError(
      "DATABASE_URL_MISSING",
      "DATABASE_URL não está definida.",
    );
  }

  let url: URL;
  try {
    url = new URL(connectionString.trim());
  } catch {
    throw new PostgresConfigError(
      "DATABASE_URL_INVALID",
      "DATABASE_URL não é uma URL PostgreSQL válida.",
    );
  }

  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !url.hostname.endsWith(SUPABASE_POOLER_SUFFIX) ||
    url.port !== "6543"
  ) {
    throw new PostgresConfigError(
      "DATABASE_TARGET_INVALID",
      "DATABASE_URL deve usar o Supabase Transaction Pooler na porta 6543.",
    );
  }

  const sslMode = url.searchParams.get("sslmode");
  if (sslMode !== REQUIRED_SSL_MODE) {
    throw new PostgresConfigError(
      "DATABASE_SSLMODE_INVALID",
      "DATABASE_URL deve usar sslmode=verify-full para validar TLS, certificado e hostname.",
    );
  }

  if (
    url.searchParams.has("sslcert") ||
    url.searchParams.has("sslkey") ||
    url.searchParams.has("sslrootcert")
  ) {
    throw new PostgresConfigError(
      "DATABASE_SSL_PARAMETERS_INVALID",
      "Configure a CA adicional com SUPABASE_CA_CERT_PATH, não por parâmetros SSL na DATABASE_URL.",
    );
  }

  return {
    connectionString: connectionString.trim(),
    hostname: url.hostname,
    port: url.port,
    sslMode: REQUIRED_SSL_MODE,
  };
}

function validateAdditionalCa(certificate: string, source: string) {
  const normalizedCertificate = certificate
    .replaceAll("\\r\\n", "\n")
    .replaceAll("\\n", "\n")
    .replaceAll("\r\n", "\n")
    .trim();

  if (
    !normalizedCertificate.startsWith("-----BEGIN CERTIFICATE-----") ||
    !normalizedCertificate.endsWith("-----END CERTIFICATE-----")
  ) {
    throw new PostgresConfigError(
      "DATABASE_CA_INVALID",
      `${source} não contém um certificado PEM válido.`,
    );
  }

  try {
    new X509Certificate(normalizedCertificate);
  } catch {
    throw new PostgresConfigError(
      "DATABASE_CA_INVALID",
      `${source} não contém um certificado X.509 válido.`,
    );
  }

  return normalizedCertificate;
}

function loadAdditionalCa(certificatePath: string) {
  const resolvedPath = resolve(certificatePath);

  try {
    return validateAdditionalCa(
      readFileSync(resolvedPath, "utf8"),
      "SUPABASE_CA_CERT_PATH",
    );
  } catch (error) {
    if (error instanceof PostgresConfigError) throw error;
    throw new PostgresConfigError(
      "DATABASE_CA_READ_FAILED",
      "Não foi possível ler o certificado definido em SUPABASE_CA_CERT_PATH.",
    );
  }
}

export function createBookingDatabasePoolConfig(
  environment: DatabaseEnvironment = process.env,
): PoolConfig {
  const target = inspectBookingDatabaseUrl(environment.DATABASE_URL);
  const certificatePath = environment.SUPABASE_CA_CERT_PATH?.trim();
  const certificatePem = environment.SUPABASE_CA_CERT_PEM?.trim();
  const commonConfig = {
    max: 1,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    allowExitOnIdle: true,
  } satisfies PoolConfig;

  if (certificatePath && certificatePem) {
    throw new PostgresConfigError(
      "DATABASE_CA_CONFLICT",
      "Use somente SUPABASE_CA_CERT_PATH ou SUPABASE_CA_CERT_PEM, nunca as duas.",
    );
  }

  if (!certificatePath && !certificatePem) {
    return {
      ...commonConfig,
      connectionString: target.connectionString,
    };
  }

  // O node-postgres substitui o objeto `ssl` quando a URL contém parâmetros
  // SSL. Removemos somente o modo da cópia usada pelo driver e aplicamos a
  // configuração equivalente, com a CA explícita e validação obrigatória.
  const driverUrl = new URL(target.connectionString);
  driverUrl.searchParams.delete("sslmode");
  const certificate = certificatePath
    ? loadAdditionalCa(certificatePath)
    : validateAdditionalCa(
        certificatePem!,
        "SUPABASE_CA_CERT_PEM",
      );

  return {
    ...commonConfig,
    connectionString: driverUrl.toString(),
    ssl: {
      ca: certificate,
      rejectUnauthorized: true,
    },
  };
}
