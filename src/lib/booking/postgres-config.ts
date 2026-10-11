import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import type { PoolConfig } from "pg";

const REQUIRED_SSL_MODE = "verify-full";
const SUPABASE_POOLER_SUFFIX = ".pooler.supabase.com";

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
    throw new Error("o socket cliente → Supabase não está criptografado.");
  }
  if (stream.authorized !== true || stream.authorizationError) {
    throw new Error(
      "o certificado ou o hostname do Supabase não foi validado pelo Node.js.",
    );
  }
}

export function inspectBookingDatabaseUrl(
  connectionString: string | undefined,
): BookingDatabaseTarget {
  if (!connectionString?.trim()) {
    throw new Error("DATABASE_URL não está definida.");
  }

  let url: URL;
  try {
    url = new URL(connectionString.trim());
  } catch {
    throw new Error("DATABASE_URL não é uma URL PostgreSQL válida.");
  }

  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !url.hostname.endsWith(SUPABASE_POOLER_SUFFIX) ||
    url.port !== "6543"
  ) {
    throw new Error(
      "DATABASE_URL deve usar o Supabase Transaction Pooler na porta 6543.",
    );
  }

  const sslMode = url.searchParams.get("sslmode");
  if (sslMode !== REQUIRED_SSL_MODE) {
    throw new Error(
      "DATABASE_URL deve usar sslmode=verify-full para validar TLS, certificado e hostname.",
    );
  }

  if (
    url.searchParams.has("sslcert") ||
    url.searchParams.has("sslkey") ||
    url.searchParams.has("sslrootcert")
  ) {
    throw new Error(
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
  if (
    !certificate.includes("-----BEGIN CERTIFICATE-----") ||
    !certificate.includes("-----END CERTIFICATE-----")
  ) {
    throw new Error(`${source} não contém um certificado PEM válido.`);
  }

  return certificate;
}

function loadAdditionalCa(certificatePath: string) {
  const resolvedPath = resolve(certificatePath);

  try {
    return validateAdditionalCa(
      readFileSync(resolvedPath, "utf8"),
      "SUPABASE_CA_CERT_PATH",
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("certificado PEM")) {
      throw error;
    }
    throw new Error(
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
    throw new Error(
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
        certificatePem!.replaceAll("\\n", "\n"),
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
