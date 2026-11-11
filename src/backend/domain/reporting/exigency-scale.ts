import type { ScoreBandLabel } from "./reporting-overview-contract";

export const EXIGENCY_LEVELS = [2, 3, 4, 5] as const;

export type ExigencyLevel = (typeof EXIGENCY_LEVELS)[number];

export type ExigencyBandLabel =
  | "Nivel 2 · Deficiente"
  | "Nivel 3 · Mejorable"
  | "Nivel 4 · Aceptable"
  | "Nivel 5 · Buen estado";

const LABELS: Record<ExigencyLevel, ExigencyBandLabel> = {
  2: "Nivel 2 · Deficiente",
  3: "Nivel 3 · Mejorable",
  4: "Nivel 4 · Aceptable",
  5: "Nivel 5 · Buen estado",
};

export function classifyExigencyPercentage(value: number | null): ExigencyLevel | null {
  if (value === null || !Number.isFinite(value)) return null;
  if (value > 95) return 5;
  if (value >= 90) return 4;
  if (value >= 80) return 3;
  return 2;
}

export function exigencyStateClass(value: number | null): string {
  const level = classifyExigencyPercentage(value);
  return level === null ? "is-empty" : `is-level-${level}`;
}

export function exigencyLevelLabel(value: number | null): string {
  const level = classifyExigencyPercentage(value);
  return level === null ? "Sin puntaje" : LABELS[level];
}

export function scoreBandStateClass(label: ScoreBandLabel): string {
  if (label === "100") return "is-level-5";
  if (label === "90-99") return "is-level-4";
  if (label === "80-89") return "is-level-3";
  return "is-level-2";
}

export function scoreBandLevelLabel(label: ScoreBandLabel): ExigencyBandLabel {
  if (label === "100") return LABELS[5];
  if (label === "90-99") return LABELS[4];
  if (label === "80-89") return LABELS[3];
  return LABELS[2];
}
