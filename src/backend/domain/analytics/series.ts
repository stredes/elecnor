import { roundSql } from "../reporting/reporting-rounding";

export type AnalyticInspection = {
  readonly date?: string | null;
  readonly percentage: number | null;
  readonly actions?: number | null;
};
export type MonthlySeriesPoint = { readonly period: string; readonly inspections: number; readonly compliance: number };
export type WeeklySeriesPoint = {
  readonly inicio: string;
  readonly inspecciones: number;
  readonly promedio: number | null;
  readonly bajo70: number;
};

export function calculateMonthlySeries(items: readonly AnalyticInspection[]): readonly MonthlySeriesPoint[] {
  const groups = new Map<string, number[]>();
  for (const item of items) {
    const date = item.date;
    if (!date || !parseDate(date) || item.percentage === null) continue;
    const values = groups.get(date.slice(0, 7)) ?? [];
    values.push(item.percentage);
    groups.set(date.slice(0, 7), values);
  }
  return [...groups].sort(([left], [right]) => left.localeCompare(right)).map(([period, values]) => ({
    period, inspections: values.length,
    compliance: roundSql(values.reduce((sum, value) => sum + value, 0) / values.length * 100),
  }));
}

export function calculateWeeklySeries(items: readonly AnalyticInspection[]): readonly WeeklySeriesPoint[] {
  const groups = new Map<string, { count: number; scores: number[]; below70: number }>();
  for (const item of items) {
    const start = weekStart(item.date);
    if (!start) continue;
    const group = groups.get(start) ?? { count: 0, scores: [], below70: 0 };
    group.count += 1;
    if (item.percentage !== null) {
      group.scores.push(item.percentage);
      if (item.percentage < 0.7) group.below70 += 1;
    }
    groups.set(start, group);
  }
  return [...groups].sort(([left], [right]) => left.localeCompare(right)).map(([inicio, group]) => ({
    inicio, inspecciones: group.count,
    promedio: group.scores.length ? roundSql(average(group.scores) * 100) : null,
    bajo70: group.below70,
  }));
}

export function completeWeeklySeries(items: readonly WeeklySeriesPoint[]): readonly WeeklySeriesPoint[] {
  if (!items.length) return [];
  const ordered = [...items].sort((left, right) => left.inicio.localeCompare(right.inicio));
  const byStart = new Map(ordered.map((item) => [item.inicio, item]));
  const result: WeeklySeriesPoint[] = [];
  for (let cursor = ordered[0].inicio; cursor <= ordered.at(-1)!.inicio; cursor = addDays(cursor, 7)) {
    result.push(byStart.get(cursor) ?? { inicio: cursor, inspecciones: 0, promedio: null, bajo70: 0 });
  }
  return result;
}

function weekStart(value: string | null | undefined): string | null {
  const date = parseDate(value);
  if (!date) return null;
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/u.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10) === value ? date : null;
}

function addDays(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function average(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
