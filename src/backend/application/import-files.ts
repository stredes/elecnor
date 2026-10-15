import { validateImportFiles } from "../domain/import-files";
import type { ImportFile } from "../domain/import-files";
import type { ImportSummary } from "../domain/import-summary";
import type { ImportGateway } from "../ports/import-gateway";

export class ImportFiles {
  public constructor(private readonly gateway: ImportGateway) {}

  public async execute(files: readonly ImportFile[]): Promise<ImportSummary> {
    validateImportFiles(files);
    return this.gateway.execute(files);
  }
}
