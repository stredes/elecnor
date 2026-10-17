import type { Procedure } from "../../domain/procedures/procedure-contract";
import type { ProcedureWriteDraft } from "../../domain/procedures/create-procedure-contract";

export type ProcedureReservation =
  | { readonly kind: "NEW"; readonly reservationId: string }
  | { readonly kind: "DUPLICATE"; readonly procedure: Procedure }
  | { readonly kind: "CONFLICT" };
export type CommitFailureState = "not_committed" | "unknown";

export class ProcedureCommitError extends Error {
  public constructor(public readonly state: CommitFailureState) {
    super(`El commit terminó en estado ${state}.`);
    this.name = "ProcedureCommitError";
  }
}

export interface CommitProcedure {
  reserve(key: string, fingerprint: string): Promise<ProcedureReservation>;
  commit(reservation: ProcedureReservation & { readonly kind: "NEW" }, draft: ProcedureWriteDraft): Promise<Procedure>;
  cancel(reservation: ProcedureReservation & { readonly kind: "NEW" }): Promise<void>;
}
