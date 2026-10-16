import type { CExtractDocument } from "../domain/c-extract-contract";
import type { TransientPdf } from "./document-processing";

export interface CExtractReader {
  extract(document: TransientPdf): Promise<CExtractDocument>;
}
