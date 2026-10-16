import { DocumentExtractionError } from "../../domain/document-extraction-error";
import type { CExtractReader } from "../../ports/c-extract-reader";
import type { TransientPdf } from "../../ports/document-processing";

export class DisabledCExtractReader implements CExtractReader {
  public async extract(request: TransientPdf) {
    void request;
    throw new DocumentExtractionError("UPSTREAM_UNAVAILABLE");
  }
}
