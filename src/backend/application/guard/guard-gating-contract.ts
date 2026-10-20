import type { InspectionFactsPatch as FactsPatch } from "../../domain/guard/guard-facts-contract";
import type { GuardVerdictResult } from "../../domain/guard/guard-contract";
import type { GuardPolicy, GuardUniquenessScope } from "../../domain/guard/guard-policy";
import type { InspectionListResult } from "../../domain/inspection-list-contract";

export type GuardKpi = {
  readonly official: number;
  readonly warningsIncluded: number;
  readonly outOfKpi: number;
};

export type GuardTrays = {
  readonly official: readonly string[];
  readonly pending: readonly string[];
  readonly observations: readonly string[];
  readonly blocked: readonly string[];
  readonly excluded: readonly string[];
};

export type GuardGatingCore = {
  readonly kpi: GuardKpi;
  readonly trays: GuardTrays;
};

export type GuardGating = GuardGatingCore & {
  readonly scope: "page";
  readonly ruleVersion: string;
  readonly uniquenessScope: GuardUniquenessScope;
  readonly computedAt: string;
  readonly verdicts: readonly GuardVerdictResult[];
};

export type GuardPageRequest = {
  readonly list: InspectionListResult;
  readonly computedAt: string;
  readonly policy?: GuardPolicy;
  readonly patches?: Readonly<Record<string, FactsPatch>>;
};

export type GuardedInspectionListResult = InspectionListResult & {
  readonly guard: GuardGating;
};
