import { classifyExigencyPercentage, type ExigencyBandLabel, type ExigencyLevel } from "./exigency-scale";
import type { ReportingInspectionFact } from "./reporting-facts-contract";

export type PeopleSampleBand = {
  readonly level: ExigencyLevel;
  readonly label: ExigencyBandLabel;
  readonly people: number;
  readonly percentage: number;
};

export type PeopleSample = {
  readonly total: number;
  readonly bands: readonly PeopleSampleBand[];
};

const BAND_ORDER: readonly ExigencyLevel[] = [5, 4, 3, 2];

export function calculatePeopleSample(inspections: readonly ReportingInspectionFact[]): PeopleSample {
  const scoresByTechnician = new Map<string, number[]>();
  for (const inspection of inspections) {
    const technician = normalizeTechnician(inspection.technician);
    const percentage = inspection.percentage;
    if (!technician || percentage === null || !Number.isFinite(percentage)) continue;
    const scores = scoresByTechnician.get(technician) ?? [];
    scores.push(percentage * 100);
    scoresByTechnician.set(technician, scores);
  }

  const counts = new Map<ExigencyLevel, number>(BAND_ORDER.map((level) => [level, 0]));
  for (const scores of scoresByTechnician.values()) {
    const average = scores.reduce((total, score) => total + score, 0) / scores.length;
    const level = classifyExigencyPercentage(average);
    if (level !== null) counts.set(level, (counts.get(level) ?? 0) + 1);
  }

  const total = scoresByTechnician.size;
  return {
    total,
    bands: BAND_ORDER.map((level) => ({
      level,
      label: labelFor(level),
      people: counts.get(level) ?? 0,
      percentage: total ? (counts.get(level) ?? 0) / total * 100 : 0,
    })),
  };
}

function normalizeTechnician(value: string | null): string {
  return value?.trim().toLocaleLowerCase("es-CL") ?? "";
}

function labelFor(level: ExigencyLevel): ExigencyBandLabel {
  if (level === 5) return "Nivel 5 · Buen estado";
  if (level === 4) return "Nivel 4 · Aceptable";
  if (level === 3) return "Nivel 3 · Mejorable";
  return "Nivel 2 · Deficiente";
}
