import type { ImportSummary } from "../../domain/import-summary";

export type { ImportSummary } from "../../domain/import-summary";

const FIELDS = [
  "seleccionados",
  "procesados",
  "duplicados",
  "errores",
  "inspecciones_nuevas",
  "metricas_insertadas",
  "metricas_sin_clasificar",
] as const;

type ImportSummaryField = (typeof FIELDS)[number];

export class ImportContractError extends Error {
  public constructor() {
    super("Respuesta C-IMPORT inválida.");
    this.name = "ImportContractError";
  }
}

export function parseImportSummary(value: unknown): ImportSummary {
  if (!isRecord(value) || !hasExactFields(value)) {
    throw new ImportContractError();
  }
  const counters = FIELDS.map((field) => readCounter(value, field));
  return {
    seleccionados: counters[0],
    procesados: counters[1],
    duplicados: counters[2],
    errores: counters[3],
    inspecciones_nuevas: counters[4],
    metricas_insertadas: counters[5],
    metricas_sin_clasificar: counters[6],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactFields(value: Record<string, unknown>): boolean {
  const keys = Object.keys(value);
  return keys.length === FIELDS.length && keys.every(isKnownField);
}

function isKnownField(key: string): key is ImportSummaryField {
  return FIELDS.some((field) => field === key);
}

function readCounter(value: Record<string, unknown>, field: ImportSummaryField): number {
  const counter = value[field];
  if (typeof counter !== "number" || !Number.isInteger(counter) || counter < 0) {
    throw new ImportContractError();
  }
  return counter;
}
