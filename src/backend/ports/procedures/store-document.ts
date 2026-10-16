import type { ProcedureUpload, StoredProcedureDocument } from "../../domain/procedures/create-procedure-contract";

export type StorageFailureState = "not_written" | "unknown";

export class DocumentStorageError extends Error {
  public constructor(public readonly state: StorageFailureState) {
    super(`El storage terminó en estado ${state}.`);
    this.name = "DocumentStorageError";
  }
}

export interface StoreProcedureDocument {
  put(upload: ProcedureUpload, reservationId: string): Promise<StoredProcedureDocument>;
  remove(document: StoredProcedureDocument): Promise<void>;
}
