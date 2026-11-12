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
const PLACEHOLDER_NAMES = new Set(["na", "n a", "no informado", "no registrado", "sin nombre", "sin tecnico", "sin puntaje", "sin dato", "desconocido"]);

export function calculatePeopleSample(inspections: readonly ReportingInspectionFact[]): PeopleSample {
  const people: PersonScoreGroup[] = [];
  for (const inspection of inspections) {
    const person = normalizeTechnician(inspection.technician);
    const percentage = toPercentage(inspection.percentage);
    if (!person || percentage === null) continue;
    addScore(people, person, percentage);
  }

  const counts = new Map<ExigencyLevel, number>(BAND_ORDER.map((level) => [level, 0]));
  for (const person of people) {
    const average = person.scores.reduce((total, score) => total + score, 0) / person.scores.length;
    const level = classifyExigencyPercentage(average);
    if (level !== null) counts.set(level, (counts.get(level) ?? 0) + 1);
  }

  const total = people.length;
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

type NormalizedPerson = { readonly key: string; readonly tokens: readonly string[] };
type PersonScoreGroup = { key: string; tokens: readonly string[]; scores: number[] };

function normalizeTechnician(value: string | null): NormalizedPerson | null {
  if (!value) return null;
  const withBoundaries = value.replace(/([a-záéíóúñü])([A-ZÁÉÍÓÚÑÜ])/g, "$1 $2");
  const normalized = withBoundaries
    .replace(/\([^)]*\)/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-CL")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
  if (!normalized || isPlaceholderName(normalized)) return null;
  const tokens = [...new Set(collapseRepeatedNameParts(normalized).split(" ").filter(Boolean))];
  return tokens.length ? { key: [...tokens].sort().join(" "), tokens } : null;
}

function addScore(people: PersonScoreGroup[], person: NormalizedPerson, score: number): void {
  const matches = people.filter((candidate) => candidate.key === person.key || equivalentTokens(candidate.tokens, person.tokens));
  if (!matches.length) {
    people.push({ key: person.key, tokens: person.tokens, scores: [score] });
    return;
  }
  const primary = matches[0];
  primary.scores.push(score);
  for (const duplicate of matches.slice(1)) {
    primary.scores.push(...duplicate.scores);
    people.splice(people.indexOf(duplicate), 1);
  }
}

function equivalentTokens(left: readonly string[], right: readonly string[]): boolean {
  if (left.join(" ") === right.join(" ")) return true;
  const shared = left.filter((token) => right.some((candidate) => equivalentToken(token, candidate))).length;
  return Math.min(left.length, right.length) >= 2 && shared >= 2;
}

function equivalentToken(left: string, right: string): boolean {
  if (left === right) return true;
  if (left.length < 4 || right.length < 4) return false;
  return levenshtein(left, right) <= 1;
}

function levenshtein(left: string, right: string): number {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex++) {
    let diagonal = row[0];
    row[0] = leftIndex;
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex++) {
      const previous = row[rightIndex];
      row[rightIndex] = Math.min(row[rightIndex] + 1, row[rightIndex - 1] + 1, diagonal + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1));
      diagonal = previous;
    }
  }
  return row[right.length];
}

function collapseRepeatedNameParts(value: string): string {
  const tokens = value.split(" ");
  for (let size = Math.floor(tokens.length / 2); size >= 1; size--) {
    for (let start = 0; start + size * 2 <= tokens.length; start++) {
      if (tokens.slice(start, start + size).join(" ") === tokens.slice(start + size, start + size * 2).join(" ")) {
        tokens.splice(start + size, size);
        return collapseRepeatedNameParts(tokens.join(" "));
      }
    }
  }
  return tokens.join(" ");
}

function isPlaceholderName(value: string): boolean {
  return PLACEHOLDER_NAMES.has(value)
    || value.includes("sin nombre") || value.includes("sin tecnico");
}

function toPercentage(value: number | null): number | null {
  if (value === null || !Number.isFinite(value)) return null;
  return value <= 1 ? value * 100 : value;
}

function labelFor(level: ExigencyLevel): ExigencyBandLabel {
  if (level === 5) return "Nivel 5 · Buen estado";
  if (level === 4) return "Nivel 4 · Aceptable";
  if (level === 3) return "Nivel 3 · Mejorable";
  return "Nivel 2 · Deficiente";
}
