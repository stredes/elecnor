import { createHash } from "node:crypto";
import { parseImportSummary } from "../inbound/import-summary";
import type { ImportFile } from "../../domain/import-files";
import type { ImportSummary } from "../../domain/import-summary";
import { ImportGatewayError, type ImportGateway } from "../../ports/import-gateway";
import { BackendAdapterError, failureForStatus } from "./http-errors";
import { joinEndpoint, requestResponse, type HttpClientOptions } from "./http-json";

export class HttpImportGateway implements ImportGateway {
  public constructor(
    private readonly endpoint: string,
    private readonly fetcher: typeof fetch = fetch,
    private readonly path = "/api/v1/import",
    private readonly options: HttpClientOptions = {},
  ) {}

  public async execute(files: readonly ImportFile[]): Promise<ImportSummary> {
    const form = new FormData();
    for (const file of files) {
      if (!file.content) throw new ImportGatewayError("REJECTED", "El contenido del PDF no está disponible.");
      form.append("files", new Blob([file.content as BlobPart], { type: "application/pdf" }), file.name);
      form.append("sha256", file.sha256 ?? digest(file.content));
      if (file.legacyId) form.append("legacy_id", file.legacyId);
      if (file.provenance) form.append("provenance", JSON.stringify(file.provenance));
    }
    let response: Response;
    try {
      response = await requestResponse(
        this.fetcher,
        joinEndpoint(this.endpoint, this.path),
        { method: "POST", body: form },
        this.options,
      );
    } catch (error) {
      if (error instanceof BackendAdapterError && error.code === "TIMEOUT") {
        throw new ImportGatewayError("UNAVAILABLE", "Import backend timed out.");
      }
      throw new ImportGatewayError("UNAVAILABLE", "Import backend unavailable.");
    }
    if (!response.ok) throw this.mapStatus(response.status);
    try {
      return parseImportSummary(await response.json());
    } catch {
      throw new ImportGatewayError("REJECTED", "Import backend returned an invalid response.");
    }
  }

  private mapStatus(status: number): ImportGatewayError {
    const code = failureForStatus(status);
    return new ImportGatewayError(code === "UNAVAILABLE" ? "UNAVAILABLE" : "REJECTED", "Import backend request failed.", status);
  }
}

function digest(content: Uint8Array): string {
  return createHash("sha256").update(content).digest("hex");
}
