import type { ReportingDetailsResult } from "@/backend/application/reporting/get-reporting-details";

type ReportingInsightsProps = { readonly report: ReportingDetailsResult };

export function ReportingInsights({ report }: ReportingInsightsProps) {
  return (
    <section aria-label="Síntesis de reporting">
      <h2>Secciones</h2>
      <ul>{report.sections.map((section) => <li key={section.name}>{section.name}: {section.compliance}%</li>)}</ul>
      <h2>Métricas débiles</h2>
      <ul>{report.rankings.weak.map((metric) => <li key={metric.code}>{metric.metric}: {metric.compliance}%</li>)}</ul>
      <p>Sección más débil: {report.narrative.sectionGap.weakest?.name ?? "Sin datos"}</p>
      <p>Promedio EPP: {report.narrative.epp.directAverage ?? "Sin datos"}</p>
    </section>
  );
}
