import assert from "node:assert/strict";
import test from "node:test";

import { getReconciliationAction } from "./reconciliation-policy";

test("confirma retenção quando o evento determinístico existe", () => {
  assert.equal(getReconciliationAction("holding", "matching-event"), "confirm");
});

test("libera retenção somente quando o evento não existe no Google", () => {
  assert.equal(getReconciliationAction("holding", "missing-event"), "fail");
  assert.equal(
    getReconciliationAction("holding", "google-unavailable"),
    "retry-later",
  );
  assert.equal(
    getReconciliationAction("holding", "marker-mismatch"),
    "retry-later",
  );
});

test("finaliza ou repete cancelamento conforme o estado do Google", () => {
  assert.equal(
    getReconciliationAction("cancelled", "matching-event"),
    "cancel-event",
  );
  assert.equal(
    getReconciliationAction("cancelled", "missing-event"),
    "complete-cancellation",
  );
  assert.equal(
    getReconciliationAction("cancelled", "google-unavailable"),
    "retry-later",
  );
});
