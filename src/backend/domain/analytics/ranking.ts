import { roundSql } from "../reporting/reporting-rounding";
import type { AnalyticInspection } from "./series";
import type { RankingData, RankingItem } from "./analytics-contract";

export function calculateRanking(
  items: readonly AnalyticInspection[], minimo = 3, limite = 10,
): RankingData {
  const valid = items.filter((item) => item.percentage !== null);
  return {
    promedio_global: valid.length ? roundSql(average(valid) * 100) : null,
    minimo,
    limite,
    tecnicos: rankBy(valid, "technician", minimo, limite),
    auditores: rankBy(valid, "auditor", minimo, limite),
  };
}

function rankBy(
  items: readonly AnalyticInspection[], key: "technician" | "auditor", minimo: number, limite: number,
): readonly RankingItem[] {
  const groups = new Map<string, number[]>();
  for (const item of items) {
    const value = item[key]?.trim();
    if (!value) continue;
    const scores = groups.get(value) ?? [];
    scores.push(item.percentage as number);
    groups.set(value, scores);
  }
  return [...groups].map(([nombre, scores]) => ({
    nombre, inspecciones: scores.length, promedio: roundSql(average(scores) * 100),
    bajo70: scores.filter((score) => score < 0.7).length,
  })).filter((item) => item.inspecciones >= minimo)
    .sort((left, right) => right.inspecciones - left.inspecciones || right.promedio - left.promedio)
    .slice(0, limite);
}

function average(values: readonly AnalyticInspection[] | readonly number[]): number {
  const scores = typeof values[0] === "number"
    ? values as readonly number[]
    : (values as readonly AnalyticInspection[]).map((item) => item.percentage as number);
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}
