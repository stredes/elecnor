import type { Procedure } from "../../../domain/procedures/procedure-contract";
import type { ValidateProcedurePdf } from "../../../ports/procedures/validate-pdf";
import type { StoreProcedureDocument } from "../../../ports/procedures/store-document";
import type { CommitProcedure } from "../../../ports/procedures/commit-procedure";
import type { RecordProcedureRecovery } from "../../../ports/procedures/record-recovery";

export type CreateProcedureResult = {
  readonly status: "CREATED" | "DUPLICATE";
  readonly procedure: Procedure;
};

export type CreateProcedureDependencies = {
  readonly validator: ValidateProcedurePdf;
  readonly storage: StoreProcedureDocument;
  readonly committer: CommitProcedure;
  readonly recovery: RecordProcedureRecovery;
};
