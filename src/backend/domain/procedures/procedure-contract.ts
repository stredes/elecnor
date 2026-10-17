export type Procedure = {
  readonly id: string;
  readonly title: string;
  readonly code: string | null;
  readonly area: string | null;
  readonly description: string | null;
  readonly youtubeVideoId: string | null;
  readonly pdfUrl: string | null;
  readonly filename: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ProcedureQuery = { readonly q: string; readonly area: string };
export type ProcedureList = { readonly total: number; readonly data: readonly Procedure[] };

export type ProcedureFamily = {
  readonly code: string;
  readonly title: string;
  readonly procedures: readonly Procedure[];
  readonly total: number;
  readonly conVideo: number;
};
