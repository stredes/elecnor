import type { ProcedureCreationErrorCode } from "./contracts/procedure-creation-error-contract";

export class ProcedureCreationError extends Error {
  public constructor(public readonly code: ProcedureCreationErrorCode, message: string = code) {
    super(message);
    this.name = "ProcedureCreationError";
  }
}
