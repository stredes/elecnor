import type { ImportFile } from "../../domain/import-files";
import type { ImportSummary } from "../../domain/import-summary";
import {
  ImportGatewayError,
  type ImportGateway,
} from "../../ports/import-gateway";

export class DisabledImportGateway implements ImportGateway {
  public async execute(files: readonly ImportFile[]): Promise<ImportSummary> {
    void files;
    throw new ImportGatewayError(
      "UNAVAILABLE",
      "C-IMPORT upstream permanece deshabilitado.",
    );
  }
}
