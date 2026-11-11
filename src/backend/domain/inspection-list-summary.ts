import type { InspectionListItem } from "./inspection-list-contract";

export type InspectionListSummary = {
  readonly total: number;
  readonly scored: number;
  readonly average: number | null;
  readonly complete: number;
  readonly attention: number;
  readonly missing: number;
  readonly missingAuditor: number;
  readonly completePercentage: number;
  readonly attentionPercentage: number;
  readonly missingPercentage: number;
};

export function summarizeInspectionList(rows: readonly InspectionListItem[]): InspectionListSummary {
  const scored = rows.flatMap((row) => row.percentage === null ? [] : [row.percentage]);
  const attention = rows.filter(isAttention).length;
  const missing = rows.filter((row) => row.percentage === null && !isAttention(row)).length;
  const missingAuditor = rows.filter((row) => !row.auditor?.trim()).length;
  const complete = Math.max(0, rows.length - attention - missing);
  return {
    total: rows.length,
    scored: scored.length,
    average: scored.length ? Number((scored.reduce((sum, value) => sum + value, 0) / scored.length).toFixed(2)) : null,
    complete,
    attention,
    missing,
    missingAuditor,
    completePercentage: percentage(complete, rows.length),
    attentionPercentage: percentage(attention, rows.length),
    missingPercentage: percentage(missing, rows.length),
  };
}

function isAttention(row: InspectionListItem): boolean {
  return row.status === "PARCIAL" || (row.percentage !== null && row.percentage < 70);
}

function percentage(value: number, total: number): number {
  return total ? Math.round((value / total) * 100) : 0;
}
