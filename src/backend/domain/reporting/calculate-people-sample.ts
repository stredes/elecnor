import { classifyExigencyPercentage, type ExigencyBandLabel, type ExigencyLevel } from "./exigency-scale";
import type { ReportingInspectionFact } from "./reporting-facts-contract";
import type { ElecnorWorker } from "../elecnor-contract";

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

  return buildPeopleSample(scoresByTechnician);
}

export function calculatePeopleSampleFromComparison(workers: readonly ElecnorWorker[], inspections: readonly ReportingInspectionFact[] = []): PeopleSample {
  const comparisonPeople = new Map<string, string>();
  const comparisonInspectionOwners = new Map<string, string>();
  const directScoresByTechnician = new Map<string, number[]>();

  for (const worker of workers) {
    const technician = normalizeTechnician(worker.name);
    if (!technician) continue;
    addComparisonAlias(comparisonPeople, worker.name, technician);
    addComparisonAlias(comparisonPeople, worker.name_detected, technician, true);
    const directScores: number[] = [];
    for (const inspection of worker.inspections) {
      if (inspection.audit_id) comparisonInspectionOwners.set(inspection.audit_id, technician);
      addComparisonAlias(comparisonPeople, inspection.technician_detected, technician);
      addComparisonAlias(comparisonPeople, inspection.technician_normalized, technician);
      addComparisonAlias(comparisonPeople, inspection.technician_canonical, technician);
      const percentage = comparisonPercentage(inspection.percentage);
      if (percentage !== null) directScores.push(percentage);
    }
    if (directScores.length) directScoresByTechnician.set(technician, directScores);
  }

  const scoresByTechnician = new Map<string, number[]>();
  for (const inspection of inspections) {
    const technician = inspection.id
      ? comparisonInspectionOwners.get(inspection.id)
      : undefined;
    const matchedTechnician = technician ?? comparisonPeople.get(normalizeTechnician(inspection.technician));
    const percentage = inspection.percentage;
    if (!matchedTechnician || percentage === null || !Number.isFinite(percentage)) continue;
    const scores = scoresByTechnician.get(matchedTechnician) ?? [];
    scores.push(percentage * 100);
    scoresByTechnician.set(matchedTechnician, scores);
  }
  for (const [technician, scores] of directScoresByTechnician) {
    if (!scoresByTechnician.has(technician)) scoresByTechnician.set(technician, scores);
  }

  return buildPeopleSample(scoresByTechnician);
}

function addComparisonAlias(aliases: Map<string, string>, value: string | null, technician: string, split = false): void {
  for (const candidate of split ? value?.split(",") ?? [] : [value]) {
    const alias = normalizeTechnician(candidate);
    if (alias) aliases.set(alias, technician);
  }
}

function buildPeopleSample(scoresByTechnician: Map<string, number[]>): PeopleSample {
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

function comparisonPercentage(value: number | null): number | null {
  if (value === null || !Number.isFinite(value)) return null;
  return value <= 1 ? value * 100 : value;
}

function normalizeTechnician(value: string | null): string {
  return value?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim().toLocaleLowerCase("es-CL") ?? "";
}

function labelFor(level: ExigencyLevel): ExigencyBandLabel {
  if (level === 5) return "Nivel 5 · Buen estado";
  if (level === 4) return "Nivel 4 · Aceptable";
  if (level === 3) return "Nivel 3 · Mejorable";
  return "Nivel 2 · Deficiente";
}
