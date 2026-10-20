import type { BackendProvenance } from "../../domain/backend-contract";

export type ExtractionRequestMetadata = {
  readonly filename: string;
  readonly sha256: string;
  readonly legacyId?: string | null;
  readonly provenance?: BackendProvenance;
};
