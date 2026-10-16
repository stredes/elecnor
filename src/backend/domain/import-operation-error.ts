import type { ImportSummary } from "./import-summary";

export type ImportOperationErrorCode = "CANCELLED";

export class ImportOperationError extends Error {
  public constructor(
    public readonly code: ImportOperationErrorCode,
    public readonly summary: ImportSummary,
  ) {
    super("La importación fue cancelada antes de persistir el documento.");
    this.name = "ImportOperationError";
  }
}
