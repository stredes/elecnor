import type { ImportSummary } from "../../domain/import-summary";

export type ImportErrorBody = { readonly error: string };

export type ImportResponse = ImportSummary | ImportErrorBody;
