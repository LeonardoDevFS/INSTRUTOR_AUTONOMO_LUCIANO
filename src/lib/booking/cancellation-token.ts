import { createHash } from "node:crypto";

export const cancellationTokenPattern = /^[A-Za-z0-9_-]{43}$/;

export function hashCancellationToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function buildCancellationPath(token: string) {
  return `/agendamento/cancelar#token=${encodeURIComponent(token)}`;
}
