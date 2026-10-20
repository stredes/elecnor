import type { InspectionFacts } from "./guard-facts-contract";
import type { GuardReason } from "./guard-contract";
import type { GuardPolicy } from "./guard-policy";
import { guardReason } from "./guard-reason";

export function identityReasons(
  facts: InspectionFacts,
  policy: GuardPolicy,
  computedAt: string,
): GuardReason[] {
  if (present(facts.technicianNormalized)) return [];
  return [
    guardReason(
      "TECHNICIAN_MISSING",
      "BLOCKED",
      "technicianNormalized",
      `technician_normalized ausente (valor="${facts.technicianNormalized ?? "null"}")`,
      policy,
      computedAt,
    ),
  ];
}

function present(value: string | null): boolean {
  return typeof value === "string" && value.trim().length > 0;
}
