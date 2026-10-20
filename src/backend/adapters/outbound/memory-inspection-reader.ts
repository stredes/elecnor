import type {
  InspectionListItem,
  InspectionListQuery,
} from "../../domain/inspection-list-contract";
import { selectInspectionList } from "../../domain/inspection-list-selection";
import type { InspectionReader } from "../../ports/inspection-reader";

const rows: readonly InspectionListItem[] = [
  syntheticRow("synthetic-inspection-1", "2026-01-10", "09:00", "Técnico A", "Auditor A", "Norte", "COMPLETA", 80, 0),
  syntheticRow("synthetic-inspection-2", "2026-02-15", "10:00", "Técnico B", "Auditor B", "Sur", "PARCIAL", 65, 1),
  syntheticRow("synthetic-inspection-3", "2026-03-01", "11:00", "Técnico C", null, "Norte", "COMPLETA", null, null),
];

function syntheticRow(id: string, date: string, time: string, technician: string, auditor: string | null, region: string, status: "COMPLETA" | "PARCIAL", percentage: number | null, actions: number | null): InspectionListItem {
  const filename = `${id}.pdf`;
  const documentId = `DOC-${id}`;
  const sha256 = id === "synthetic-inspection-1" ? "a".repeat(64) : id === "synthetic-inspection-2" ? "b".repeat(64) : "c".repeat(64);
  return { id, date, time, technician, auditor, address: "Calle 1", city: "Ciudad", region, percentage, score: percentage === null ? null : percentage / 10, maxScore: 10, actions, rubric: "SYN", status, filename,
    provenance: { documentId, filename, sha256, origin: "SYNTHETIC", receivedAt: null, date, time },
    uniqueness: { sha256, technicianNormalized: technician, localInspectionDate: date, localInspectionAt: time, completeness: status, metricCount: 1, modifiedTime: `${date}T${time}:00Z`, documentKind: "INSPECTION", exactCopyOf: null, inspectionTime: time, timezone: "UTC", timePrecision: "minute", datePrecision: "day", provenance: { filename, sha256 } } };
}

export class MemoryInspectionReader implements InspectionReader {
  public list(query: InspectionListQuery) {
    return Promise.resolve(selectInspectionList(rows, query));
  }
}
