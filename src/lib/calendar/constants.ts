export const DEFAULT_TIME_ZONE = "America/Sao_Paulo";

export const BLOCK_MARKER_KEY = "direcaoSeguraType";
export const BLOCK_MARKER_VALUE = "managed-block";
export const BLOCK_VERSION_KEY = "direcaoSeguraVersion";
export const BLOCK_REASON_KEY = "direcaoSeguraReason";
export const BLOCK_REASON_CODE_KEY = "direcaoSeguraReasonCode";
export const BLOCK_REQUEST_KEY = "direcaoSeguraRequestId";

export const blockReasons = [
  { value: "buscar-aluno", label: "Buscar aluno" },
  { value: "deslocamento", label: "Deslocamento" },
  { value: "compromisso-pessoal", label: "Compromisso pessoal" },
  { value: "exame", label: "Exame" },
  { value: "almoco", label: "Almoço" },
  { value: "intervalo", label: "Intervalo" },
  { value: "folga", label: "Folga" },
  { value: "manutencao", label: "Manutenção" },
  { value: "outro", label: "Outro" },
] as const;

export type BlockReason = (typeof blockReasons)[number]["value"];

export function isBlockReason(value: string | undefined): value is BlockReason {
  return blockReasons.some((reason) => reason.value === value);
}

export function getBlockReasonLabel(reason: string, customReason?: string) {
  if (reason === "outro" && customReason?.trim()) {
    return customReason.trim();
  }

  return blockReasons.find((item) => item.value === reason)?.label ?? "Bloqueio";
}

export function getBlockEventId(requestId: string) {
  return `ds${requestId.replaceAll("-", "").toLowerCase()}`;
}
