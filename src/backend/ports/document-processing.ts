import type {
  DocumentFormat,
  NormalizedDocument,
} from "../domain/normalized-document";

export type TransientPdf = {
  readonly name: string;
  readonly content: Uint8Array;
};

export interface DocumentExtractor {
  extract(document: TransientPdf): Promise<NormalizedDocument>;
}

export interface NormalizedDocumentWriter {
  append(document: NormalizedDocument): Promise<void>;
}

export interface DocumentFormatMapper<TSource> {
  readonly format: DocumentFormat;
  map(source: TSource): NormalizedDocument;
}
