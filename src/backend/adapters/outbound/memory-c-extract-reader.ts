import type { CExtractDocument } from "../../domain/c-extract-contract";
import type { CExtractReader } from "../../ports/c-extract-reader";
import type { TransientPdf } from "../../ports/document-processing";

export class MemoryCExtractReader implements CExtractReader {
  public constructor(private readonly document: CExtractDocument) {}

  public async extract(request: TransientPdf): Promise<CExtractDocument> {
    void request;
    return this.document;
  }
}
