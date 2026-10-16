import { ListInspections } from "../application/list-inspections";
import { HttpInspectionReader } from "../adapters/outbound/http-inspection-reader";
import { MemoryInspectionReader } from "../adapters/outbound/memory-inspection-reader";

export function createInspectionQuery() {
  const reader = process.env.BACKEND_API_URL
    ? new HttpInspectionReader(process.env.BACKEND_API_URL)
    : new MemoryInspectionReader();
  return new ListInspections(reader);
}

export const inspectionQuery = createInspectionQuery();
