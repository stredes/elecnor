import type { ExtractedInspectionFacts } from "../domain/import-facts-contract";
import type { ImportDraft } from "../domain/import-draft-contract";

export interface ImportInterpreter {
  execute(facts: ExtractedInspectionFacts): ImportDraft;
}
