import type { ImportFile } from "@/backend/domain/import-files";
import type { ImportSummary } from "@/backend/domain/import-summary";

export type ImportGatewayFailureCode = "REJECTED" | "UNAVAILABLE";

export class ImportGatewayError extends Error {
  public constructor(
    public readonly code: ImportGatewayFailureCode,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ImportGatewayError";
  }
}

export interface ImportGateway {
  execute(files: readonly ImportFile[]): Promise<ImportSummary>;
}
