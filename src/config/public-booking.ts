import { siteConfig } from "@/config/site";

export type BookingService = {
  id: string;
  name: string;
  description: string;
  icon: "car" | "bike" | "badge" | "route" | "file" | "shield";
  durationMinutes?: number;
  active: boolean;
  notice?: string;
};

const practicalDuration = siteConfig.lesson.durationMinutes;

export const bookingServices: BookingService[] = [
  {
    id: "carro-categoria-b",
    name: "Aula prática de carro — Categoria B",
    description: "Treinamento prático individual com o veículo utilizado nas aulas.",
    icon: "car",
    durationMinutes: practicalDuration,
    active: true,
  },
  {
    id: "moto-categoria-a",
    name: "Aula prática de moto — Categoria A",
    description: "Treinamento de equilíbrio, comandos e condução segura.",
    icon: "bike",
    durationMinutes: practicalDuration,
    active: true,
  },
  {
    id: "preparacao-prova-pratica",
    name: "Preparação para prova prática",
    description: "Aula direcionada aos pontos que exigem mais segurança para a prova.",
    icon: "badge",
    durationMinutes: practicalDuration,
    active: true,
  },
  {
    id: "primeira-habilitacao-orientacoes",
    name: "Primeira habilitação — Orientações",
    description: "Conversa para entender etapas e próximos passos da primeira CNH.",
    icon: "route",
    active: false,
  },
  {
    id: "adicao-categoria-a",
    name: "Adição de categoria A",
    description: "Treinamento prático de moto para quem vai adicionar a categoria A.",
    icon: "bike",
    durationMinutes: practicalDuration,
    active: true,
  },
  {
    id: "adicao-categoria-b",
    name: "Adição de categoria B",
    description: "Treinamento prático de carro para quem vai adicionar a categoria B.",
    icon: "car",
    durationMinutes: practicalDuration,
    active: true,
  },
  {
    id: "orientacao-exames-taxas",
    name: "Orientação sobre exames e taxas",
    description: "Orientação do instrutor sobre procedimentos e canais oficiais.",
    icon: "file",
    active: false,
    notice:
      "Este agendamento é destinado a receber orientação do instrutor Luciano. A reserva não corresponde ao agendamento oficial de exame no Detran-MG.",
  },
  {
    id: "orientacao-documentacao-cnh",
    name: "Orientação sobre documentação da CNH",
    description: "Ajuda para compreender documentos e etapas, sem envio de dados sensíveis.",
    icon: "file",
    active: false,
  },
  {
    id: "treinamento-habilitados",
    name: "Treinamento para pessoas habilitadas",
    description: "Prática personalizada para retomar confiança e desenvolver autonomia.",
    icon: "shield",
    durationMinutes: practicalDuration,
    active: true,
  },
  {
    id: "medo-de-dirigir",
    name: "Apoio para quem tem medo de dirigir",
    description: "Treinamento prático gradual, respeitando o ritmo de cada pessoa.",
    icon: "shield",
    durationMinutes: practicalDuration,
    active: true,
  },
];

export function getBookingService(serviceId: string) {
  return bookingServices.find((service) => service.id === serviceId);
}

function positiveInteger(value: string | undefined) {
  if (!value || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return parsed > 0 ? parsed : null;
}

function nonNegativeInteger(value: string | undefined, fallback?: number) {
  if (value === undefined || value === "") return fallback ?? null;
  if (!/^\d+$/.test(value)) return null;
  return Number(value);
}

export type PublicBookingRuntimeConfig = {
  enabled: boolean;
  ready: boolean;
  reason?: "disabled" | "database" | "google" | "rules";
  minAdvanceMinutes?: number;
  maxAdvanceDays?: number;
  bufferMinutes?: number;
  closedDates: string[];
};

export function getPublicBookingRuntimeConfig(): PublicBookingRuntimeConfig {
  const enabled = process.env.CUSTOM_BOOKING_ENABLED === "true";
  const minAdvanceMinutes = nonNegativeInteger(
    process.env.BOOKING_MIN_ADVANCE_MINUTES,
  );
  const maxAdvanceDays = positiveInteger(process.env.BOOKING_MAX_ADVANCE_DAYS);
  const bufferMinutes = nonNegativeInteger(process.env.BOOKING_BUFFER_MINUTES);
  const closedDates = (process.env.BOOKING_CLOSED_DATES ?? "")
    .split(",")
    .map((date) => date.trim())
    .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date));

  if (!enabled) return { enabled, ready: false, reason: "disabled", closedDates };
  if (!process.env.DATABASE_URL?.trim()) {
    return { enabled, ready: false, reason: "database", closedDates };
  }
  if (
    !process.env.GOOGLE_CALENDAR_REFRESH_TOKEN?.trim() ||
    !process.env.AUTH_GOOGLE_ID?.trim() ||
    !process.env.AUTH_GOOGLE_SECRET?.trim() ||
    !process.env.GOOGLE_CALENDAR_ID?.trim()
  ) {
    return { enabled, ready: false, reason: "google", closedDates };
  }
  if (
    minAdvanceMinutes === null ||
    maxAdvanceDays === null ||
    bufferMinutes === null
  ) {
    return { enabled, ready: false, reason: "rules", closedDates };
  }

  return {
    enabled,
    ready: true,
    minAdvanceMinutes,
    maxAdvanceDays,
    bufferMinutes,
    closedDates,
  };
}
