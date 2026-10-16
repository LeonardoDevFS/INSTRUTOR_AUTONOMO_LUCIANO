export type CancellationPreparation =
  | "not_found"
  | "completed"
  | "unavailable"
  | "pending"
  | "ready";

export function getCancellationPreparation(input: {
  exists: boolean;
  status?: "holding" | "confirmed" | "failed" | "cancelled";
  googleEventId?: string | null;
  syncStatus?: "pending" | "synced" | "cancel_pending" | "error";
}): CancellationPreparation {
  if (!input.exists) return "not_found";
  if (input.status === "cancelled") return "completed";
  if (input.status !== "confirmed" || !input.googleEventId) {
    return "unavailable";
  }
  return input.syncStatus === "cancel_pending" ? "pending" : "ready";
}

export type CancellationGoogleOutcome =
  | "matching-event"
  | "missing-event"
  | "marker-mismatch"
  | "google-unavailable";

export function getCancellationGoogleAction(
  outcome: CancellationGoogleOutcome,
) {
  return {
    "matching-event": "delete-event",
    "missing-event": "complete-cancellation",
    "marker-mismatch": "keep-blocked",
    "google-unavailable": "keep-blocked",
  }[outcome] as
    | "delete-event"
    | "complete-cancellation"
    | "keep-blocked";
}
