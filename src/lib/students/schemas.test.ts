import assert from "node:assert/strict";
import test from "node:test";

import { calculateFinancialBalance } from "./finance";
import { normalizeEmail, normalizePhone, studentInputSchema, studentRecordActionSchema } from "./schemas";

test("normaliza telefone e e-mail sem armazenar formatos auxiliares", () => {
  assert.equal(normalizePhone("(35) 99999-0000"), "35999990000");
  assert.equal(normalizeEmail(" Aluno@Exemplo.COM "), "aluno@exemplo.com");
});

test("rejeita cadastro sem telefone válido e aceita os campos mínimos", () => {
  assert.equal(studentInputSchema.safeParse({ fullName: "A", phone: "123", trainingCategory: "B", serviceType: "Aula" }).success, false);
  assert.equal(studentInputSchema.safeParse({ fullName: "Aluno Teste", phone: "(35) 99999-0000", trainingCategory: "B", serviceType: "Treinamento" }).success, true);
});

test("valida aula, evolução e vínculo de reserva", () => {
  assert.equal(studentRecordActionSchema.safeParse({ action: "lesson.create", data: { modality: "Carro", startsAt: "2026-10-12T10:00:00-03:00", durationMinutes: 50, status: "scheduled" } }).success, true);
  assert.equal(studentRecordActionSchema.safeParse({ action: "skill.create", data: { vehicleCategory: "B", skillCode: "baliza", skillLabel: "Baliza", level: "developing", assessedOn: "2026-10-11" } }).success, true);
  assert.equal(studentRecordActionSchema.safeParse({ action: "reservation.link", data: { reservationId: "não-é-uuid" } }).success, false);
});

test("calcula financeiro em centavos e ignora lançamentos cancelados ou pendentes", () => {
  assert.deepEqual(
    calculateFinancialBalance(
      [{ amount: "500.50", status: "partial" }, { amount: "100.00", status: "cancelled" }],
      [{ amount: "200.25", status: "paid" }, { amount: "50.00", status: "pending" }],
    ),
    { agreed: "500.50", paid: "200.25", balance: "300.25" },
  );
  assert.deepEqual(
    calculateFinancialBalance([], [{ amount: "0.25", status: "paid" }]),
    { agreed: "0.00", paid: "0.25", balance: "-0.25" },
  );
});
