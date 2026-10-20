import { createHash } from "node:crypto";
import { parseCExtractDocument } from "../../domain/c-extract-contract";
import { DocumentExtractionError } from "../../domain/document-extraction-error";
import type { CExtractReader } from "../../ports/c-extract-reader";
import type { TransientPdf } from "../../ports/document-processing";
import { BackendAdapterError } from "./http-errors";
import { mapFasapiToCExtract } from "./fasapi-c-extract-mapper";
import { parseFasapiResponse } from "./fasapi-response-parser";
import { requestResponse, type HttpClientOptions } from "./http-json";

export class HttpCExtractReader implements CExtractReader {
  private readonly endpoint: string;

  public constructor(
    endpoint: string,
    private readonly fetcher: typeof fetch = fetch,
    private readonly path = "/api/v1/pdf/extract",
    private readonly options: HttpClientOptions = {},
  ) {
    this.endpoint = endpoint.replace(/\/$/, "");
  }

  public async extract(document: TransientPdf) {
    const form = new FormData();
    form.append(
      "file",
      new Blob([document.content as BlobPart], { type: "application/pdf" }),
      document.name,
    );
    const sha256 = createHash("sha256").update(document.content).digest("hex");
    let response: Response;
    try {
      response = await requestResponse(this.fetcher, `${this.endpoint}${this.path}`, {
        method: "POST", body: form,
      }, this.options);
    } catch (error) {
      if (error instanceof BackendAdapterError && error.code === "TIMEOUT") {
        throw new DocumentExtractionError("UPSTREAM_TIMEOUT");
      }
      throw new DocumentExtractionError("UPSTREAM_UNAVAILABLE");
    }
    if (!response.ok) throw this.mapStatus(response.status);
    try {
      const payload: unknown = await response.json();
      const documentResult = isCanonical(payload)
        ? parseCExtractDocument(payload)
        : mapFasapiToCExtract(parseFasapiResponse(payload), { filename: document.name, sha256 });
      return withRequestMetadata(documentResult, document.name, sha256);
    } catch {
      throw new DocumentExtractionError("INVALID_RESPONSE", response.status);
    }
  }

  private mapStatus(status: number): DocumentExtractionError {
    if (status === 413) return new DocumentExtractionError("TOO_LARGE", status);
    if (status === 408 || status === 504) return new DocumentExtractionError("UPSTREAM_TIMEOUT", status);
    return new DocumentExtractionError("UPSTREAM_REJECTED", status);
  }
}

function isCanonical(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && "contract_version" in value;
}

function withRequestMetadata(document: ReturnType<typeof parseCExtractDocument>, filename: string, sha256: string) {
  return {
    ...document,
    source: {
      ...(document.source ?? {}),
      filename: document.source?.filename ?? filename,
      sha256: document.source?.sha256 ?? sha256,
      pages: document.source?.pages ?? null,
    },
  };
}
