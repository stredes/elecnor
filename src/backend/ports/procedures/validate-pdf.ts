import type { ProcedureUpload } from "../../domain/procedures/create-procedure-contract";

export type PdfValidationCode = "INVALID_PDF" | "TOO_LARGE" | "UNAVAILABLE";
export type PdfValidation =
  | { readonly valid: true; readonly pages: number }
  | { readonly valid: false; readonly code: PdfValidationCode };

export interface ValidateProcedurePdf {
  validate(upload: ProcedureUpload): Promise<PdfValidation>;
}
