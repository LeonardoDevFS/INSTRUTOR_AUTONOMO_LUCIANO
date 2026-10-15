import assert from "node:assert/strict";
import test from "node:test";

import {
  getCancellationGoogleAction,
  getCancellationPreparation,
} from "./cancellation-policy";
import { hashCancellationToken } from "./cancellation-token";

test("autoriza cancelamento somente para reserva confirmada com evento", () => {
  assert.equal(
    getCancellationPreparation({
      exists: true,
      status: "confirmed",
      googleEventId: "event-1",
      syncStatus: "synced",
    }),
    "ready",
  );
  assert.equal(getCancellationPreparation({ exists: false }), "not_found");
  assert.equal(
    getCancellationPreparation({
      exists: true,
      status: "holding",
      googleEventId: null,
      syncStatus: "pending",
    }),
    "unavailable",
  );
});

test("cancelamento repetido é idempotente e pendência pode ser repetida", () => {
  assert.equal(
    getCancellationPreparation({
      exists: true,
      status: "cancelled",
      googleEventId: "event-1",
      syncStatus: "synced",
    }),
    "completed",
  );
  assert.equal(
    getCancellationPreparation({
      exists: true,
      status: "confirmed",
      googleEventId: "event-1",
      syncStatus: "cancel_pending",
    }),
    "pending",
  );
});

test("falha ou marcador divergente mantém o horário bloqueado", () => {
  assert.equal(
    getCancellationGoogleAction("google-unavailable"),
    "keep-blocked",
  );
  assert.equal(
    getCancellationGoogleAction("marker-mismatch"),
    "keep-blocked",
  );
  assert.equal(
    getCancellationGoogleAction("matching-event"),
    "delete-event",
  );
  assert.equal(
    getCancellationGoogleAction("missing-event"),
    "complete-cancellation",
  );
});

test("banco recebe somente hash do token de cancelamento", () => {
  const token = "a".repeat(43);
  const hash = hashCancellationToken(token);
  assert.equal(hash.length, 64);
  assert.notEqual(hash, token);
  assert.equal(hash, hashCancellationToken(token));
  assert.notEqual(hash, hashCancellationToken("b".repeat(43)));
});
