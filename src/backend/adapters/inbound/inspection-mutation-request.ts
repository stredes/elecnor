import { guardInspectionMutation } from "../../domain/inspections/mutation-boundaries";
import type { MutationDecision } from "../../domain/inspections/mutation-boundaries";

export function parseInspectionMutationRequest(id: unknown, payload: unknown): MutationDecision {
  return guardInspectionMutation(id, payload);
}
