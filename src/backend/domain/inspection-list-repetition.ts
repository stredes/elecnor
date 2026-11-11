import type { InspectionListItem } from "./inspection-list-contract";

export type RepeatedInspection = { readonly id: string; readonly time: string; readonly technician: string; readonly auditor: string; readonly address: string | null };
export type RepeatedInspectionGroup = { readonly technician: string; readonly date: string; readonly inspections: readonly RepeatedInspection[] };

export function findRepeatedInspectionGroups(items: readonly InspectionListItem[]): readonly RepeatedInspectionGroup[] {
  const groups = new Map<string, { technician: string; date: string; inspections: RepeatedInspection[] }>();
  items.forEach((item) => {
    if (!item.technician || !item.auditor || !item.date || !item.time) return;
    const key = `${item.technician}::${item.date}`;
    const group = groups.get(key) ?? { technician: item.technician, date: item.date, inspections: [] };
    group.inspections.push({ id: item.id, time: item.time, technician: item.technician, auditor: item.auditor, address: item.address });
    groups.set(key, group);
  });
  return [...groups.values()]
    .filter((group) => group.inspections.length > 1 && new Set(group.inspections.map((item) => item.time)).size > 1)
    .map((group) => ({ ...group, inspections: group.inspections.slice().sort((left, right) => left.time.localeCompare(right.time)) }))
    .sort((left, right) => right.date.localeCompare(left.date) || left.technician.localeCompare(right.technician));
}
