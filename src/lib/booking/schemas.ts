import { z } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const availabilityQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  serviceId: z.string().trim().min(1).max(80),
});

export const publicBookingSchema = z.object({
  serviceId: z.string().trim().min(1).max(80),
  date: z.string().regex(datePattern),
  time: z.string().regex(timePattern),
  name: z.string().trim().min(3, "Informe o nome completo.").max(120),
  email: z.email("Informe um e-mail válido.").max(160),
  phone: z
    .string()
    .trim()
    .min(10, "Informe um telefone válido.")
    .max(24)
    .regex(/^[+\d\s().-]+$/, "Informe um telefone válido."),
  notes: z.string().trim().max(600).optional().default(""),
  privacyAccepted: z.literal(true),
  idempotencyKey: z.uuid(),
  website: z.string().max(0).optional().default(""),
}).superRefine((value, context) => {
  const parsed = new Date(`${value.date}T12:00:00Z`);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value.date
  ) {
    context.addIssue({
      code: "custom",
      message: "A data informada não existe.",
      path: ["date"],
    });
  }
});

export type PublicBookingInput = z.infer<typeof publicBookingSchema>;
