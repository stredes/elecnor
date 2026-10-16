import type { ReportingFacts } from "./reporting-facts-contract";
import type { ReportingKpis } from "./reporting-overview-contract";
import { roundSql } from "./reporting-rounding";

export function calculateKpis(facts: ReportingFacts): ReportingKpis {
  const validScores = facts.inspections.filter((item) => item.percentage !== null);
  const average = validScores.length
    ? roundSql(sumScores(validScores) / validScores.length * 100)
    : 0;
  return {
    "PDF recibidos": facts.importLogs.length,
    "Inspecciones únicas": facts.inspections.length,
    "Puntajes válidos": validScores.length,
    "Promedio global": `${average.toFixed(2)}%`,
    "Bajo 70%": validScores.filter((item) => item.percentage! < 0.7).length,
    "Puntaje perfecto": validScores.filter((item) => item.percentage === 1).length,
    Hallazgos: facts.metrics.filter((item) => item.state === "NO_CONFORME").length,
    Acciones: facts.inspections.reduce((total, item) => total + (item.actions ?? 0), 0),
  };
}

function sumScores(items: readonly { percentage: number | null }[]): number {
  return items.reduce((total, item) => total + (item.percentage ?? 0), 0);
}
