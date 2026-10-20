import type { InspectionFacts } from "./guard-facts-contract";
import type { GuardVerdictResult } from "./guard-contract";
import type { GuardPolicy } from "./guard-policy";
import { guardReason, sortReasons } from "./guard-reason";
import { evaluateInspection } from "./guard-evaluate";

export function evaluateGuardedSet(
  factsList: readonly InspectionFacts[],
  computedAt: string,
  policy: GuardPolicy,
): readonly GuardVerdictResult[] {
  const byId = new Map(factsList.map((facts) => [facts.inspectionId, facts]));
  const losers = resolveLosers(factsList);
  return factsList.map((facts) => {
    const verdict = evaluateInspection(facts, computedAt, policy);
    const winnerId = losers.get(facts.inspectionId);
    if (winnerId === undefined) return verdict;
    const winner = byId.get(winnerId);
    return winner === undefined ? verdict : excludedForSameDay(verdict, facts, winner, policy, computedAt);
  });
}

export function resolveLosers(factsList: readonly InspectionFacts[]): Map<string, string> {
  const groups = new Map<string, InspectionFacts[]>();
  for (const facts of factsList) {
    const key = uniquenessKey(facts);
    if (key === null) continue;
    const group = groups.get(key);
    if (group) group.push(facts);
    else groups.set(key, [facts]);
  }
  const losers = new Map<string, string>();
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const ordered = [...group].sort(compareWinner);
    const winner = ordered[0];
    for (const loser of ordered.slice(1)) losers.set(loser.inspectionId, winner.inspectionId);
  }
  return losers;
}

export function uniquenessKey(facts: InspectionFacts): string | null {
  if (facts.documentKind !== null && facts.documentKind !== "INSPECTION") return null;
  if (facts.exactCopyOf !== null) return null;
  const technician = facts.technicianNormalized?.trim();
  const day = facts.localInspectionDate?.trim();
  if (!technician || !day) return null;
  return `${technician}\u0000${day}`;
}

export function compareWinner(left: InspectionFacts, right: InspectionFacts): number {
  const completeness = rank(left) - rank(right);
  if (completeness !== 0) return -completeness;
  const metrics = metricCount(left) - metricCount(right);
  if (metrics !== 0) return -metrics;
  const time = timeKey(left.localInspectionAt).localeCompare(timeKey(right.localInspectionAt));
  if (time !== 0) return -time;
  const document = (left.documentId ?? "").localeCompare(right.documentId ?? "");
  if (document !== 0) return document;
  return left.inspectionId.localeCompare(right.inspectionId);
}

function excludedForSameDay(
  verdict: GuardVerdictResult,
  facts: InspectionFacts,
  winner: InspectionFacts,
  policy: GuardPolicy,
  computedAt: string,
): GuardVerdictResult {
  if (verdict.verdict === "EXCLUDED") return verdict;
  const reason = guardReason(
    "DUPLICATE_SAME_TECHNICIAN_DAY",
    "INFO",
    "uniqueness",
    `ganador=${winner.documentId ?? winner.inspectionId}; sha256=${facts.provenance.sha256 ?? "null"}; tecnico=${facts.technicianNormalized ?? "null"}; dia=${facts.localInspectionDate ?? "null"}; completo=${facts.importStatus ?? "null"}; metricas=${metricCount(facts)}; hora=${facts.localInspectionAt ?? "null"}`,
    policy,
    computedAt,
  );
  return {
    ...verdict,
    verdict: "EXCLUDED",
    tray: "EXCLUDED",
    official: false,
    officialWithWarning: false,
    reasons: sortReasons([...verdict.reasons, reason]),
  };
}

function rank(facts: InspectionFacts): number {
  return facts.importStatus === "COMPLETA" ? 1 : 0;
}

function metricCount(facts: InspectionFacts): number {
  return facts.metricCount ?? facts.metrics.length;
}

function timeKey(value: string | null): string {
  return typeof value === "string" ? value : "";
}
