import type { ExtractedInspectionFacts } from "../domain/import-facts-contract";
import type { ImportFile } from "../domain/import-files";
import type { ImportExecutionContext } from "./import-operation";

export interface DocumentProcessor {
  process(
    file: ImportFile,
    context: ImportExecutionContext,
  ): Promise<ExtractedInspectionFacts>;
}
