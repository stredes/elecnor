import type { ExtractedInspectionFacts } from "./import-facts-contract";
import { normalizeText } from "./import-normalization";

export function buildLogicalKey(
  facts: ExtractedInspectionFacts,
  digest: (value: string) => string,
): string | null {
  const parts = [facts.technician, facts.inspectionDate, facts.inspectionTime, facts.address, facts.auditor];
  if (parts.some((part) => !part)) return null;
  return digest(parts.map((part) => normalizeText(part)).join("|"));
}
