export const C_EXTRACT_VERSION = "1.0.0" as const;

export type CExtractStatus = "complete" | "partial";
export type CExtractDate = { readonly year: number | null; readonly month: number | null; readonly day: number | null };
export type CExtractLocation = { readonly city: string | null; readonly region: string | null; readonly latitude: number | null; readonly longitude: number | null; readonly source: string | null };
export type CExtractRubric = { readonly name: string | null; readonly version: string | null; readonly source: string | null };
export type CExtractSource = { readonly filename: string | null; readonly sha256: string | null; readonly pages: number | null };
export type CExtractItem = { readonly index: number; readonly label: string | null; readonly response: string | null; readonly observation: string | null; readonly page: number | null; readonly source_text: string | null };
export type CExtractSection = { readonly index: number; readonly name: string | null; readonly items: readonly CExtractItem[] };

export type CExtractDocument = {
  readonly contract_version: typeof C_EXTRACT_VERSION;
  readonly document_type: string;
  readonly extraction_status: CExtractStatus;
  readonly sections: readonly CExtractSection[];
  readonly document_id?: string | null;
  readonly date?: CExtractDate | null;
  readonly time?: string | null;
  readonly timezone?: string | null;
  readonly location?: CExtractLocation | null;
  readonly rubric?: CExtractRubric | null;
  readonly source?: CExtractSource | null;
  readonly metadata?: Readonly<Record<string, string | null>>;
};
