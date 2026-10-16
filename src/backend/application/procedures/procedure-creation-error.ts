export type ProcedureCreationErrorCode =
  | "INVALID_METADATA" | "INVALID_PDF" | "TOO_LARGE" | "VALIDATOR_UNAVAILABLE"
  | "STORAGE_UNAVAILABLE" | "CONFLICT";

export class ProcedureCreationError extends Error {
  public constructor(public readonly code: ProcedureCreationErrorCode, message: string = code) {
    super(message);
    this.name = "ProcedureCreationError";
  }
}
