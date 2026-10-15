export type ImportSummary = {
  readonly seleccionados: number;
  readonly procesados: number;
  readonly duplicados: number;
  readonly errores: number;
  readonly inspecciones_nuevas: number;
  readonly metricas_insertadas: number;
  readonly metricas_sin_clasificar: number;
};
