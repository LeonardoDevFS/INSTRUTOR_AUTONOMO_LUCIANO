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

type BookingEnvironment = Record<string, string | undefined>;

export type BookingConfigurationIssue = {
  variable: string;
  problem: "disabled" | "missing" | "invalid";
};

function positiveInteger(value: string | undefined) {
  const normalized = value?.trim();
  if (!normalized || !/^\d+$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function nonNegativeInteger(value: string | undefined) {
  const normalized = value?.trim();
  if (!normalized || !/^\d+$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isSafeInteger(parsed) ? parsed : null;
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

export type PublicBookingEnvironmentAudit = {
  runtime: PublicBookingRuntimeConfig;
  issues: BookingConfigurationIssue[];
};

export function auditPublicBookingEnvironment(
  environment: BookingEnvironment = process.env,
): PublicBookingEnvironmentAudit {
  const issues: BookingConfigurationIssue[] = [];
  const enabledValue = environment.CUSTOM_BOOKING_ENABLED?.trim();
  const enabled = enabledValue === "true";
  const minAdvanceMinutes = nonNegativeInteger(
    environment.BOOKING_MIN_ADVANCE_MINUTES,
  );
  const maxAdvanceDays = positiveInteger(environment.BOOKING_MAX_ADVANCE_DAYS);
  const bufferMinutes = nonNegativeInteger(environment.BOOKING_BUFFER_MINUTES);
  const closedDateEntries = (environment.BOOKING_CLOSED_DATES ?? "")
    .split(",")
    .map((date) => date.trim())
    .filter(Boolean);
  const closedDates = closedDateEntries.filter((date) =>
    /^\d{4}-\d{2}-\d{2}$/.test(date),
  );

  if (!enabled) {
    issues.push({
      variable: "CUSTOM_BOOKING_ENABLED",
      problem: enabledValue ? "disabled" : "missing",
    });
  }
  if (!environment.DATABASE_URL?.trim()) {
    issues.push({ variable: "DATABASE_URL", problem: "missing" });
  }
  for (const variable of [
    "GOOGLE_CALENDAR_REFRESH_TOKEN",
    "AUTH_GOOGLE_ID",
    "AUTH_GOOGLE_SECRET",
    "GOOGLE_CALENDAR_ID",
  ]) {
    if (!environment[variable]?.trim()) {
      issues.push({ variable, problem: "missing" });
    }
  }
  for (const [variable, value] of [
    ["BOOKING_MIN_ADVANCE_MINUTES", minAdvanceMinutes],
    ["BOOKING_MAX_ADVANCE_DAYS", maxAdvanceDays],
    ["BOOKING_BUFFER_MINUTES", bufferMinutes],
  ] as const) {
    if (value === null) {
      issues.push({
        variable,
        problem: environment[variable]?.trim() ? "invalid" : "missing",
      });
    }
  }
  if (closedDates.length !== closedDateEntries.length) {
    issues.push({ variable: "BOOKING_CLOSED_DATES", problem: "invalid" });
  }

  const reason = !enabled
    ? "disabled"
    : issues.some((issue) => issue.variable === "DATABASE_URL")
      ? "database"
      : issues.some((issue) =>
          [
            "GOOGLE_CALENDAR_REFRESH_TOKEN",
            "AUTH_GOOGLE_ID",
            "AUTH_GOOGLE_SECRET",
            "GOOGLE_CALENDAR_ID",
          ].includes(issue.variable),
        )
        ? "google"
        : issues.length > 0
          ? "rules"
          : undefined;

  return {
    runtime: {
      enabled,
      ready: issues.length === 0,
      reason,
      minAdvanceMinutes: minAdvanceMinutes ?? undefined,
      maxAdvanceDays: maxAdvanceDays ?? undefined,
      bufferMinutes: bufferMinutes ?? undefined,
      closedDates: [...new Set(closedDates)],
    },
    issues,
  };
}

export function getPublicBookingRuntimeConfig(): PublicBookingRuntimeConfig {
  return auditPublicBookingEnvironment().runtime;
}
