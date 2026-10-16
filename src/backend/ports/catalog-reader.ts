import type { MetricDefinition } from "../domain/catalog/catalog-contract";

export interface CatalogReader {
  list(): readonly MetricDefinition[];
}
