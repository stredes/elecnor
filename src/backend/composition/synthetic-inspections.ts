import { GetInspectionDetail } from "../application/inspections/get-inspection-detail";
import { ListInspections } from "../application/list-inspections";
import { GetTechnicianProfile } from "../application/technicians/get-technician-profile";
import { MemoryInspectionDetailReader } from "../adapters/outbound/memory-inspection-detail-reader";
import { MemoryInspectionReader } from "../adapters/outbound/memory-inspection-reader";
import { MemoryReportingFactsReader } from "../adapters/outbound/memory-reporting-facts-reader";
import type { InspectionDetail } from "../domain/inspections/detail-contract";
import type { ReportingFacts } from "../domain/reporting/reporting-facts-contract";

const detail: InspectionDetail = {
  inspection: { id: "synthetic-inspection-1", date: "2026-01-10", time: "09:00", technician: "Técnico A", auditor: "Auditor A", address: "Calle 1", city: "Ciudad", region: "Norte", percentage: 80, score: 8, maxScore: 10, actions: 0, rubric: "SYN", status: "COMPLETA", filename: "synthetic-1.pdf", auditorRole: "Auditor", observation: "Sintética" },
  metrics: [{ id: "metric-1", section: "EPP", metric: "Casco", code: "EPP-01", status: "OK", applicable: 1, conforming: 1, nonConforming: 0, notApplicable: 0, observation: null }],
};
const facts: ReportingFacts = { inspections: [{ id: detail.inspection.id, date: detail.inspection.date, technician: detail.inspection.technician, auditor: detail.inspection.auditor, percentage: 0.8, actions: 0 }], importLogs: [], metrics: [] };

export const syntheticInspectionQuery = new ListInspections(new MemoryInspectionReader());
export const syntheticInspectionDetail = new GetInspectionDetail(new MemoryInspectionDetailReader([detail]));

export function syntheticTechnicianProfile(technician: string): GetTechnicianProfile {
  return new GetTechnicianProfile(new MemoryReportingFactsReader(facts), technician);
}
