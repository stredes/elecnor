import type { MetricDefinition } from "./catalog-contract";
import { closingCatalog } from "./catalog-closing";
import { fallsCatalog } from "./catalog-falls";
import { postCatalog } from "./catalog-post";
import { preparationCatalog } from "./catalog-preparation";
import { safetyCatalog } from "./catalog-safety";

export const catalogDefinitions: readonly MetricDefinition[] = [
  ...preparationCatalog,
  ...safetyCatalog,
  ...fallsCatalog,
  ...postCatalog,
  ...closingCatalog,
];
