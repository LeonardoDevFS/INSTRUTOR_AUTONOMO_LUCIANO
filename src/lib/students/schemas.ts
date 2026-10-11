import { z } from "zod";

import {
  contractStatuses,
  lessonStatuses,
  paymentMethods,
  paymentStatuses,
  processTypes,
  skillLevels,
  studentStatuses,
  trainingCategories,
} from "@/lib/students/types";

const optionalText = (maximum: number) =>
  z.string().trim().max(maximum).optional().transform((value) => value || undefined);
const optionalDate = z.string().date().optional().or(z.literal("")).transform((value) => value || undefined);
const uuid = z.string().uuid();

export function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

export function normalizeEmail(value?: string) {
  return value?.trim().toLowerCase() || undefined;
}

export const studentInputSchema = z.object({
  fullName: z.string().trim().min(3).max(120),
  phone: z.string().trim().min(10).max(24).refine((value) => {
    const digits = normalizePhone(value);
    return digits.length >= 10 && digits.length <= 15;
  }, "Informe um telefone válido."),
  email: z.string().trim().email().max(160).optional().or(z.literal("")).transform((value) => value || undefined),
  birthDate: optionalDate,
  trainingCategory: z.enum(trainingCategories),
  serviceType: z.string().trim().min(3).max(80),
  status: z.enum(studentStatuses).default("active"),
  confirmPossibleDuplicate: z.boolean().optional().default(false),
});

export const studentListQuerySchema = z.object({
  query: z.string().trim().max(100).optional().default(""),
  status: z.enum(studentStatuses).or(z.literal("all")).optional().default("all"),
  category: z.enum(trainingCategories).or(z.literal("all")).optional().default("all"),
  page: z.coerce.number().int().positive().max(100_000).optional().default(1),
  pageSize: z.coerce.number().int().min(5).max(50).optional().default(15),
});

export const studentIdSchema = uuid;
export const archiveStudentSchema = z.object({ confirmStudentId: uuid });

const lessonInput = z.object({
  modality: z.string().trim().min(2).max(80),
  startsAt: z.string().datetime({ offset: true }),
  durationMinutes: z.coerce.number().int().min(10).max(480).default(50),
  status: z.enum(lessonStatuses).default("scheduled"),
  content: optionalText(2000),
  notes: optionalText(3000),
  bookingReservationId: uuid.optional().or(z.literal("")).transform((value) => value || undefined),
  googleEventId: optionalText(255),
});

const skillInput = z.object({
  lessonId: uuid.optional().or(z.literal("")).transform((value) => value || undefined),
  vehicleCategory: z.enum(["A", "B"]),
  skillCode: z.string().trim().regex(/^[a-z0-9_-]{2,60}$/),
  skillLabel: z.string().trim().min(2).max(100),
  level: z.enum(skillLevels),
  comments: optionalText(1500),
  assessedOn: z.string().date(),
});

const processInputBase = z.object({
  processType: z.enum(processTypes),
  category: z.enum(trainingCategories),
  statusLabel: z.string().trim().min(2).max(80),
  steps: z.array(z.string().trim().min(2).max(120)).max(30).default([]),
  notes: optionalText(2000),
  startedOn: optionalDate,
  completedOn: optionalDate,
});

const processInput = processInputBase.refine(
  ({ startedOn, completedOn }) => !startedOn || !completedOn || completedOn >= startedOn,
  { message: "A conclusão não pode ser anterior ao início.", path: ["completedOn"] },
);

const money = z.string().trim().regex(/^\d{1,10}([.,]\d{1,2})?$/).transform((value) => value.replace(",", "."));

const contractInput = z.object({
  description: z.string().trim().min(2).max(160),
  amount: money,
  lessonsCount: z.coerce.number().int().positive().max(1000).optional().or(z.literal("")).transform((value) => value || undefined),
  status: z.enum(contractStatuses).default("pending"),
  agreedOn: z.string().date(),
  notes: optionalText(1500),
});

const paymentInputBase = z.object({
  contractId: uuid.optional().or(z.literal("")).transform((value) => value || undefined),
  amount: money.refine((value) => Number(value) > 0, "O valor deve ser maior que zero."),
  method: z.enum(paymentMethods),
  status: z.enum(paymentStatuses).default("paid"),
  paidOn: optionalDate,
  notes: optionalText(1000),
});

const paymentInput = paymentInputBase.refine(({ status, paidOn }) => status !== "paid" || Boolean(paidOn), {
  message: "Informe a data do pagamento.",
  path: ["paidOn"],
});

export const studentRecordActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("lesson.create"), data: lessonInput }),
  z.object({ action: z.literal("lesson.update"), recordId: uuid, data: lessonInput.partial() }),
  z.object({ action: z.literal("skill.create"), data: skillInput }),
  z.object({ action: z.literal("process.create"), data: processInput }),
  z.object({ action: z.literal("process.update"), recordId: uuid, data: processInputBase.partial() }),
  z.object({ action: z.literal("contract.create"), data: contractInput }),
  z.object({ action: z.literal("contract.update"), recordId: uuid, data: contractInput.partial() }),
  z.object({ action: z.literal("payment.create"), data: paymentInput }),
  z.object({ action: z.literal("payment.update"), recordId: uuid, data: paymentInputBase.partial() }),
  z.object({ action: z.literal("note.create"), data: z.object({ content: z.string().trim().min(2).max(3000) }) }),
  z.object({ action: z.literal("reservation.link"), data: z.object({ reservationId: uuid }) }),
  z.object({ action: z.literal("reservation.unlink"), data: z.object({ reservationId: uuid }) }),
]);

export type StudentInput = z.infer<typeof studentInputSchema>;
export type StudentRecordAction = z.infer<typeof studentRecordActionSchema>;
