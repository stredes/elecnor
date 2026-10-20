import type { InspectionFacts } from "./guard-facts-contract";
import type { GuardReason } from "./guard-contract";
import type { GuardPolicy } from "./guard-policy";
import { guardReason } from "./guard-reason";

export function exactCopyReasons(
  facts: InspectionFacts,
  policy: GuardPolicy,
  computedAt: string,
): GuardReason[] {
  if (facts.exactCopyOf === null) return [];
  return [
    guardReason(
      "DUPLICATE_EXACT_COPY",
      "INFO",
      "exactCopyOf",
      `exact_copy_of=${facts.exactCopyOf}; sha256=${facts.provenance.sha256 ?? "null"}`,
      policy,
      computedAt,
    ),
  ];
}

export function hasExactCopy(facts: InspectionFacts): boolean {
  return facts.exactCopyOf !== null;
}
