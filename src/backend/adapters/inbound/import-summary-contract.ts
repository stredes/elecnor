export const C_IMPORT_VERSION = "1.0.0" as const;

export const IMPORT_SUMMARY_FIELDS = [
  "seleccionados",
  "procesados",
  "duplicados",
  "errores",
  "inspecciones_nuevas",
  "metricas_insertadas",
  "metricas_sin_clasificar",
] as const;

export type ImportSummaryField = (typeof IMPORT_SUMMARY_FIELDS)[number];
