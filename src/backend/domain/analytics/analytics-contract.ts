import type { MonthlySeriesPoint, WeeklySeriesPoint } from "./series";

export type EvolutionData = {
  readonly semanas: readonly WeeklySeriesPoint[];
  readonly total: number;
};
export type RankingItem = {
  readonly nombre: string;
  readonly inspecciones: number;
  readonly promedio: number;
  readonly bajo70: number;
};
export type RankingData = {
  readonly promedio_global: number | null;
  readonly minimo: number;
  readonly limite: number;
  readonly tecnicos: readonly RankingItem[];
  readonly auditores: readonly RankingItem[];
};
export type TraceabilityData = {
  readonly total: number;
  readonly con_acciones: number;
  readonly sin_acciones: number;
  readonly porcentaje_sin_acciones: number;
};
export type GeolocationData = {
  readonly total: number;
  readonly con_geolocalizacion: number;
  readonly sin_geolocalizacion: number;
  readonly porcentaje_con_geolocalizacion: number;
  readonly direcciones_clasificadas: number;
  readonly direcciones_pendientes: number;
  readonly porcentaje_direcciones_clasificadas: number;
  readonly por_region: readonly { readonly region: string; readonly total: number }[];
};
export type ReportingAnalytics = {
  readonly progress: readonly MonthlySeriesPoint[];
  readonly evolution: EvolutionData;
  readonly ranking: RankingData;
  readonly traceability: TraceabilityData;
  readonly geolocation: GeolocationData;
};
