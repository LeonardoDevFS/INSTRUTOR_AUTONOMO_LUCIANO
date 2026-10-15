export type ReconciliationOutcome =
  | "matching-event"
  | "missing-event"
  | "marker-mismatch"
  | "google-unavailable";

export type ReconciliationAction =
  | "confirm"
  | "fail"
  | "cancel-event"
  | "complete-cancellation"
  | "retry-later";

export function getReconciliationAction(
  status: "holding" | "confirmed" | "cancelled",
  outcome: ReconciliationOutcome,
): ReconciliationAction {
  if (status === "holding") {
    if (outcome === "matching-event") return "confirm";
    if (outcome === "missing-event") return "fail";
    return "retry-later";
  }

  if (outcome === "matching-event") return "cancel-event";
  if (outcome === "missing-event") return "complete-cancellation";
  return "retry-later";
}
