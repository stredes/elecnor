import type { CatalogReader } from "../ports/catalog-reader";
import type { DocumentProcessor } from "../ports/document-processor";
import type { HashPort } from "../ports/import-dependencies";
import type { ImportRepository } from "../ports/import-repository";

export type ImportInspectionDependencies = {
  readonly processor: DocumentProcessor;
  readonly repository: ImportRepository;
  readonly catalog: CatalogReader;
  readonly hash: HashPort;
};
