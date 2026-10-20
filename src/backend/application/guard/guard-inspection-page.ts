import { evaluateGuardedSet } from "../../domain/guard/guard-uniqueness";
import { factsFromListItem } from "../../domain/guard/guard-facts-mapper";
import { DEFAULT_GUARD_POLICY } from "../../domain/guard/guard-policy";
import type { GuardGating, GuardPageRequest } from "./guard-gating-contract";
import { buildGuardGating } from "./guard-gating";

export function guardInspectionPage(request: GuardPageRequest): GuardGating {
  const policy = request.policy ?? DEFAULT_GUARD_POLICY;
  const factsList = request.list.data.map((item) =>
    factsFromListItem(item, request.patches?.[item.id] ?? {}),
  );
  const verdicts = evaluateGuardedSet(factsList, request.computedAt, policy);
  return {
    scope: "page",
    ruleVersion: policy.ruleVersion,
    uniquenessScope: policy.uniquenessScope,
    computedAt: request.computedAt,
    ...buildGuardGating(verdicts),
    verdicts,
  };
}
