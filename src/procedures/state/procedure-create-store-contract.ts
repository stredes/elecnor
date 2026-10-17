import type { ProcedureDraft } from "../contracts/procedure-form-contract";

export type ProcedureCreateState = {
  readonly status: "idle" | "submitting" | "success" | "error";
  readonly draft: ProcedureDraft;
  readonly requestId: number;
  readonly procedureId: string | null;
  readonly errors: readonly string[];
  readonly fileReleased: boolean;
};

export type ProcedureCreateStore = {
  getState(): ProcedureCreateState;
  submit(): number;
  resolve(requestId: number, procedureId: string): void;
  reject(requestId: number, errors: readonly string[]): void;
  subscribe(listener: () => void): () => void;
};
