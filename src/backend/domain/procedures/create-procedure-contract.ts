import type { NormalizedProcedure } from "./validate-procedure";

export type ProcedureUpload = {
  readonly filename: string;
  readonly sizeBytes: number;
  readonly contentType: string;
  readonly open: () => AsyncIterable<Uint8Array>;
};

export type CreateProcedureCommand = {
  readonly idempotencyKey: string;
  readonly payloadFingerprint: string;
  readonly metadata: unknown;
  readonly upload: ProcedureUpload;
};

export type StoredProcedureDocument = { readonly id: string; readonly filename: string };
export type ProcedureWriteDraft = { readonly metadata: NormalizedProcedure; readonly document: StoredProcedureDocument };
