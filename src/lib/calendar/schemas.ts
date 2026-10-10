import { z } from "zod";

import { blockReasons } from "@/lib/calendar/constants";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const reasonValues = blockReasons.map((item) => item.value) as [
  (typeof blockReasons)[number]["value"],
  ...(typeof blockReasons)[number]["value"][],
];

export const eventRangeSchema = z
  .object({
    from: z.iso.datetime({ offset: true }),
    to: z.iso.datetime({ offset: true }),
  })
  .refine((value) => Date.parse(value.to) > Date.parse(value.from), {
    message: "O fim do período deve ser posterior ao início.",
    path: ["to"],
  })
  .refine(
    (value) => Date.parse(value.to) - Date.parse(value.from) <= 370 * 86_400_000,
    {
      message: "Consulte no máximo 370 dias por vez.",
      path: ["to"],
    },
  );

export const eventIdSchema = z.string().trim().min(1).max(1024);

export const blockInputSchema = z
  .object({
    date: z.string().regex(datePattern, "Informe uma data válida."),
    startTime: z.string().regex(timePattern, "Informe um horário válido."),
    endTime: z.string().regex(timePattern, "Informe um horário válido."),
    allDay: z.boolean().default(false),
    reason: z.enum(reasonValues),
    customReason: z.string().trim().max(80).optional().default(""),
    notes: z.string().trim().max(500).optional().default(""),
    requestId: z.uuid(),
    confirmConflicts: z.boolean().default(false),
  })
  .superRefine((value, context) => {
    if (!value.allDay && value.endTime <= value.startTime) {
      context.addIssue({
        code: "custom",
        message: "O horário final deve ser posterior ao inicial.",
        path: ["endTime"],
      });
    }

    if (value.reason === "outro" && !value.customReason) {
      context.addIssue({
        code: "custom",
        message: "Informe o motivo do bloqueio.",
        path: ["customReason"],
      });
    }

    const parsedDate = new Date(`${value.date}T12:00:00Z`);
    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== value.date
    ) {
      context.addIssue({
        code: "custom",
        message: "A data informada não existe.",
        path: ["date"],
      });
    }
  });

export const deleteBlockSchema = z.object({
  confirmEventId: z.string().min(1),
});

export type BlockInput = z.infer<typeof blockInputSchema>;
