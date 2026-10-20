export type Procedure = {
  readonly id: string;
  readonly title: string;
  readonly code: string | null;
  readonly area: string | null;
  readonly description: string | null;
  readonly youtubeVideoId: string | null;
  readonly pdfUrl: string | null;
  readonly documentId?: string | null;
  readonly filename: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ProcedureFamily = {
  readonly code: string;
  readonly title: string;
  readonly procedures: readonly Procedure[];
  readonly total: number;
  readonly conVideo: number;
};

export type ProcedureVideo = { readonly status: "unavailable" | "pending-policy" };

export type ProcedureDetail = {
  readonly procedure: Procedure;
  readonly pdfUrl: string | null;
  readonly documentId?: string | null;
  readonly video?: ProcedureVideo;
};

export type ProcedureCatalogFilters = {
  readonly q: string;
  readonly area: string;
};

export type ProcedureCatalogQuery = {
  readonly q?: string;
  readonly area?: string;
};

export type ProcedureCatalogResult = {
  readonly families: readonly ProcedureFamily[];
  readonly total: number;
  readonly filters: ProcedureCatalogFilters;
};
