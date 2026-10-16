type Metric = { code: string; metric: string; compliance: number | null; applicable: number };
type Section = { name: string; percentage: number | null };
type Point = { x: number; y: number | null; section: string; label: string };
type Input = { sections: readonly Section[]; weak: readonly Metric[]; strong: readonly Metric[]; scatter: readonly Point[]; lowBands: number; global: string; validScores: number; below70: number };

export function calculateReportingNarrative(input: Input) {
  const rated = input.sections.filter((item): item is Section & { percentage: number } => item.percentage !== null);
  let weakest: (Section & { percentage: number }) | null = null;
  for (const section of rated) if (!weakest || section.percentage < weakest.percentage) weakest = section;
  const others = rated.filter((item) => item.name !== weakest?.name);
  const epp = input.scatter.filter((point) => point.section === "inspeccion y uso de epp" && point.y !== null);
  const checklist = input.weak.find((metric) => metric.code === "PREP_EPP_CHECK" ||
    (metric.code.startsWith("PREP") && metric.metric.toLowerCase().includes("check list epp")));
  const points = input.scatter.filter((point) => point.y !== null);
  const threshold = Math.max(1, ...points.map((point) => point.x)) / 2;
  const global = Number.parseFloat(input.global) || 0;
  return {
    epp: { directAverage: epp.length ? Number((epp.reduce((sum, point) => sum + point.y!, 0) / epp.length).toFixed(2)) : null, checklist: checklist?.compliance ?? null },
    sectionGap: { weakest, restAverage: others.length ? Number((others.reduce((sum, item) => sum + item.percentage, 0) / others.length).toFixed(2)) : null },
    metricRange: { lowest: input.weak.find((item) => item.compliance !== null) ?? null, highest: input.strong.find((item) => item.compliance !== null) ?? null },
    scatterRisk: { risk: points.filter((point) => point.y! < 70 && point.x >= threshold).length, total: points.length },
    lowBands: input.lowBands, healthy: Math.max(0, input.validScores - input.below70), gap: Math.max(0, 100 - global),
  };
}
