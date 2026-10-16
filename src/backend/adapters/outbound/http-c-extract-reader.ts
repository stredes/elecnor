import { parseCExtractDocument } from "../../domain/c-extract-contract";
import { DocumentExtractionError } from "../../domain/document-extraction-error";
import type { CExtractReader } from "../../ports/c-extract-reader";
import type { TransientPdf } from "../../ports/document-processing";

export class HttpCExtractReader implements CExtractReader {
  private readonly endpoint: string;

  public constructor(
    endpoint: string,
    private readonly fetcher: typeof fetch = fetch,
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
    let response: Response;
    try {
      response = await this.fetcher(`${this.endpoint}/api/v1/pdf/extract`, {
        method: "POST",
        body: form,
      });
    } catch {
      throw new DocumentExtractionError("UPSTREAM_UNAVAILABLE");
    }
    if (!response.ok) throw this.mapStatus(response.status);
    try {
      return parseCExtractDocument(await response.json());
    } catch {
      throw new DocumentExtractionError("INVALID_RESPONSE", response.status);
    }
  }

  private mapStatus(status: number): DocumentExtractionError {
    if (status === 413) return new DocumentExtractionError("TOO_LARGE", status);
    return new DocumentExtractionError("UPSTREAM_REJECTED", status);
  }
}
