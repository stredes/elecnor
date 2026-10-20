import type { BackendProvenance } from "./backend-contract";

export const NORMALIZED_DOCUMENT_VERSION = "c-import.document.v1";

export type DocumentFormat = "flask-mitti" | "fasapi-mitti";

export type DocumentPerson = {
  readonly name: string | null;
  readonly role: string | null;
};

export type DocumentScore = {
  readonly obtained: number | null;
  readonly maximum: number | null;
  readonly percentage: number | null;
  readonly percentageScale: "fraction" | "percent" | null;
};

export type DocumentLocation = {
  readonly address: string | null;
  readonly city: string | null;
  readonly region: string | null;
  readonly latitude: number | null;
  readonly longitude: number | null;
};

export type DocumentSource = {
  readonly format: DocumentFormat;
  readonly filename: string | null;
  readonly sha256: string | null;
  readonly importedAt: string | null;
  readonly status: string | null;
  readonly rubricVersion: string | null;
  readonly legacyId: string | null;
  readonly sourceSystem: string | null;
  readonly provenance: BackendProvenance;
};

export type DocumentItem = {
  readonly number: number | null;
  readonly section: string | null;
  readonly label: string | null;
  readonly rawLabel: string | null;
  readonly response: string | null;
  readonly state: string | null;
  readonly applicable: number | null;
  readonly conforming: number | null;
  readonly nonConforming: number | null;
  readonly notApplicable: number | null;
  readonly observation: string | null;
  readonly page: number | null;
  readonly code: string | null;
};

export type DocumentSection = {
  readonly name: string | null;
  readonly rawName: string | null;
  readonly order: number | null;
  readonly items: readonly DocumentItem[];
};

export type DocumentAudit = {
  readonly title: string | null;
  readonly status: string | null;
  readonly auditor: DocumentPerson | null;
  readonly technician: DocumentPerson | null;
  readonly date: string | null;
  readonly partialDate: string | null;
  readonly time: string | null;
  readonly timezone: string | null;
  readonly location: DocumentLocation;
  readonly score: DocumentScore | null;
  readonly flaggedItems: number | null;
  readonly actions: number | null;
};

export type NormalizedDocument = {
  readonly schemaVersion: typeof NORMALIZED_DOCUMENT_VERSION;
  readonly source: DocumentSource;
  readonly audit: DocumentAudit;
  readonly sections: readonly DocumentSection[];
  readonly findings: readonly DocumentItem[];
  readonly generalObservations: readonly string[];
  readonly warnings: readonly string[];
};
