import { buildInspectionMetadataUpdate } from "./update-policy";
import type { InspectionMetadataUpdate } from "./update-policy";

export type MutationDecision =
  | { readonly ok: true; readonly id: string; readonly update: InspectionMetadataUpdate }
  | { readonly ok: false; readonly code: "INVALID_INPUT" };

export function guardInspectionMutation(id: unknown, payload: unknown): MutationDecision {
  if (!validId(id)) return { ok: false, code: "INVALID_INPUT" };
  try {
    return { ok: true, id, update: buildInspectionMetadataUpdate(payload) };
  } catch {
    return { ok: false, code: "INVALID_INPUT" };
  }
}

function validId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 64
    && !/[\u0000-\u001f\u007f]/.test(value);
}
