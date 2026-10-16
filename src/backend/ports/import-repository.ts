import type { ImportDraft } from "../domain/import-draft-contract";
import type { ImportFile } from "../domain/import-files";
import type { ImportExecutionContext } from "./import-operation";

export type ImportDocumentResult = {
  readonly status: "CREATED" | "DUPLICATE";
  readonly metricsInserted: number;
  readonly unknownMetrics: number;
};

export interface ImportRepository {
  persist(
    draft: ImportDraft,
    file: ImportFile,
    context: ImportExecutionContext,
  ): Promise<ImportDocumentResult>;
}
