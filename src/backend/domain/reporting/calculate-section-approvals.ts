import { roundPython } from "./reporting-rounding";
import type { ReportingFacts } from "./reporting-facts-contract";
import type {
  SectionApprovalReport,
  SectionInspectionApproval,
} from "./reporting-detail-contract";
import { keyOf, normalizeSection } from "./reporting-detail-utils";

type ApprovalBucket = {
  name: string;
  inspectionId: string;
  applicable: number;
  conforming: number;
};

export function calculateSectionApprovals(facts: ReportingFacts): SectionApprovalReport {
  const groups = new Map<string, ApprovalBucket>();
  for (const item of facts.metrics) {
    if (!item.inspectionId || item.applicable == null || item.conforming == null) continue;
    const name = normalizeSection(item.section);
    const key = keyOf(name, item.inspectionId);
    const bucket = groups.get(key) ?? {
      name,
      inspectionId: item.inspectionId,
      applicable: 0,
      conforming: 0,
    };
    bucket.applicable += item.applicable;
    bucket.conforming += item.conforming;
    groups.set(key, bucket);
  }
  const bySection = new Map<string, ApprovalBucket[]>();
  for (const bucket of groups.values()) {
    const current = bySection.get(bucket.name) ?? [];
    bySection.set(bucket.name, [...current, bucket]);
  }
  const sections = [...bySection]
    .map(([name, items]) => toApproval(name, items, facts.inspections.length))
    .sort(byOrder);
  return {
    sections,
    allApproved: sections.reduce((total, item) => total + item.approved, 0),
  };
}

function toApproval(
  name: string,
  items: readonly ApprovalBucket[],
  total: number,
): SectionInspectionApproval {
  const evaluated = items.filter((item) => item.applicable > 0);
  const approved = evaluated.filter(
    (item) => 100 * item.conforming >= 70 * item.applicable,
  ).length;
  return {
    name,
    total,
    evaluated: evaluated.length,
    approved,
    belowThreshold: evaluated.length - approved,
    notEvaluated: total - evaluated.length,
    approvalPercentage: evaluated.length ? roundPython(100 * approved / evaluated.length) : 0,
    approvalThreshold: 70,
  };
}

function byOrder(left: SectionInspectionApproval, right: SectionInspectionApproval): number {
  return left.approved - right.approved || left.name.localeCompare(right.name);
}
