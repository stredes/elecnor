import type {
  InspectionListItem,
  InspectionListQuery,
} from "../../domain/inspection-list-contract";
import { selectInspectionList } from "../../domain/inspection-list-selection";
import type { InspectionReader } from "../../ports/inspection-reader";

const rows: readonly InspectionListItem[] = [
  { id: "synthetic-inspection-1", date: "2026-01-10", time: "09:00", technician: "Técnico A", auditor: "Auditor A", address: "Calle 1", city: "Ciudad", region: "Norte", percentage: 80, score: 8, maxScore: 10, actions: 0, rubric: "SYN", status: "COMPLETA", filename: "synthetic-1.pdf" },
  { id: "synthetic-inspection-2", date: "2026-02-15", time: "10:00", technician: "Técnico B", auditor: "Auditor B", address: "Calle 2", city: "Ciudad", region: "Sur", percentage: 65, score: 6.5, maxScore: 10, actions: 1, rubric: "SYN", status: "PARCIAL", filename: "synthetic-2.pdf" },
  { id: "synthetic-inspection-3", date: "2026-03-01", time: "11:00", technician: "Técnico C", auditor: null, address: "Calle 3", city: "Ciudad", region: "Norte", percentage: null, score: null, maxScore: null, actions: null, rubric: "SYN", status: "COMPLETA", filename: "synthetic-3.pdf" },
];

export class MemoryInspectionReader implements InspectionReader {
  public list(query: InspectionListQuery) {
    return Promise.resolve(selectInspectionList(rows, query));
  }
}
