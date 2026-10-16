export type ReportingKpis = {
  readonly "PDF recibidos": number;
  readonly "Inspecciones únicas": number;
  readonly "Puntajes válidos": number;
  readonly "Promedio global": string;
  readonly "Bajo 70%": number;
  readonly "Puntaje perfecto": number;
  readonly Hallazgos: number;
  readonly Acciones: number;
};

export type ReportingPercentiles = {
  readonly media: number | null;
  readonly mediana: number | null;
  readonly p25: number | null;
  readonly p75: number | null;
};

export type ScoreBandLabel = "0-49" | "50-59" | "60-69" | "70-79" | "80-89" | "90-99" | "100";
export type ScoreBand = { readonly label: ScoreBandLabel; readonly count: number };

export type ReportingOverview = {
  readonly kpis: ReportingKpis;
  readonly panorama: ReportingPercentiles & { readonly "Puntaje perfecto": number };
  readonly distribution: readonly ScoreBand[];
};
