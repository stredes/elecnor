export type ProcedureDraft = {
  readonly title: string;
  readonly code: string;
  readonly area: string;
  readonly description: string;
  readonly youtube: string;
  readonly pdfName: string;
};

export type ProcedureFormProps = {
  readonly status?: "idle" | "error" | "success";
  readonly message?: string | null;
  readonly onSubmit?: (draft: ProcedureDraft) => void;
};
