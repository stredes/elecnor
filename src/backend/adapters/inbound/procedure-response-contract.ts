export type PublicProcedure = {
  readonly id: string;
  readonly title: string;
  readonly code: string | null;
  readonly area: string | null;
  readonly description: string | null;
  readonly youtube_video_id: string | null;
  readonly pdf_url: string | null;
  readonly filename: string;
  readonly created_at: string;
  readonly updated_at: string;
};

export type PublicProcedureList = { readonly total: number; readonly data: readonly PublicProcedure[] };
export type ProcedureErrorResponse = { readonly error: string };
