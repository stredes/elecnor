import type { CExtractDocument } from "../domain/c-extract-contract";
import { DocumentExtractionError } from "../domain/document-extraction-error";
import type { CExtractReader } from "../ports/c-extract-reader";
import type { TransientPdf } from "../ports/document-processing";
import type { ExtractionLimits } from "./extraction-contract";

export class ExtractDocument {
  public constructor(
    private readonly reader: CExtractReader,
    private readonly limits: ExtractionLimits,
  ) {}

  public async execute(document: TransientPdf): Promise<CExtractDocument> {
    validateInput(document, this.limits);
    return this.reader.extract(document);
  }
}

function validateInput(document: TransientPdf, limits: ExtractionLimits): void {
  if (!Number.isInteger(limits.maxBytes) || limits.maxBytes < 1) {
    throw new DocumentExtractionError("INVALID_LIMIT");
  }
  if (document.content.byteLength === 0) {
    throw new DocumentExtractionError("EMPTY");
  }
  if (!/^\s*[^/\\]+\.pdf$/iu.test(document.name)) {
    throw new DocumentExtractionError("INVALID_FILENAME");
  }
  if (document.content.byteLength > limits.maxBytes) {
    throw new DocumentExtractionError("TOO_LARGE");
  }
}
