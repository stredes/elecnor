import type { ImportStatus } from "./import-draft-contract";
import type { ExtractedInspectionFacts } from "./import-facts-contract";

export function determineImportStatus(facts: ExtractedInspectionFacts): ImportStatus {
  return facts.technician && facts.inspectionDate && facts.metrics.length
    ? "COMPLETA"
    : "PARCIAL";
}
