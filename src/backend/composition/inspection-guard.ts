import { guardInspectionPage } from "../application/guard/guard-inspection-page";
import type { GuardPageRequest } from "../application/guard/guard-gating-contract";

export { emptyGating } from "../application/guard/guard-gating";
export type { GuardGating, GuardedInspectionListResult } from "../application/guard/guard-gating-contract";

export function guardPage(request: GuardPageRequest) {
  return guardInspectionPage(request);
}
