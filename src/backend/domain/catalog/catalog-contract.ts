export type MetricDefinition = {
  readonly code: string;
  readonly name: string;
  readonly section: string | null;
  readonly keywords: readonly string[];
  readonly variants?: readonly string[];
};

export type CatalogMatch = {
  readonly code: string;
  readonly name: string;
  readonly section: string | null;
  readonly confidence: number;
};
