import type { DashboardSnapshot } from "@/backend/domain/dashboard";
import type { ReportingAnalytics } from "@/backend/domain/analytics/analytics-contract";
import type { ReportingDetailsResult } from "@/backend/application/reporting/reporting-details-result-contract";
import type { ReportingOverview } from "@/backend/domain/reporting/reporting-overview-contract";

export type LegacyMetric = {
  readonly metric: string; readonly code: string; readonly section: string;
  readonly observations: number; readonly applicable: number; readonly conforming: number;
  readonly nonConforming: number; readonly compliance: number | null;
  readonly technicians: { readonly conforming: readonly string[]; readonly nonConforming: readonly string[] };
};
export type LegacyKpis = { readonly pdfRecibidos: number; readonly inspeccionesUnicas: number; readonly puntajesValidos: number; readonly promedioGlobal: string; readonly bajo70: number; readonly puntajePerfecto: number; readonly hallazgos: number; readonly acciones: number };
export type LegacySection = LegacyMetric & { readonly name: string; readonly metrics: readonly LegacyMetric[] };
export type LegacyDashboardModel = {
  readonly kpis: LegacyKpis;
  readonly panorama: ReportingOverview["panorama"];
  readonly distribution: ReportingOverview["distribution"];
  readonly progress: ReportingAnalytics["progress"];
  readonly sections: readonly LegacySection[];
  readonly sectionInspections: readonly { readonly name: string; readonly total: number; readonly evaluated: number; readonly approved: number; readonly belowThreshold: number; readonly notEvaluated: number; readonly approvalPercentage: number; readonly approvalThreshold: number }[];
  readonly weakMetrics: readonly LegacyMetric[]; readonly strongMetrics: readonly LegacyMetric[];
  readonly scatter: readonly { readonly x: number; readonly y: number; readonly label: string; readonly section: string }[];
  readonly traceability: ReportingAnalytics["traceability"];
  readonly geolocalizacion: ReportingAnalytics["geolocation"];
  readonly narrative: ReportingDetailsResult["narrative"];
};

export type LegacyReportingPayload = { readonly overview: ReportingOverview; readonly details: ReportingDetailsResult; readonly analytics: ReportingAnalytics };

export function toLegacyDashboardModel(payload: LegacyReportingPayload): LegacyDashboardModel {
  const { overview, details, analytics } = payload;
  const sectionOrder = new Map(details.sections.map((section, index) => [section.name, index]));
  const approvals = details.approvals.slice().sort((left, right) => (sectionOrder.get(left.name) ?? Number.MAX_SAFE_INTEGER) - (sectionOrder.get(right.name) ?? Number.MAX_SAFE_INTEGER));
  const mapMetric = (metric: LegacyMetric): LegacyMetric => ({ ...metric });
  return {
    kpis: { pdfRecibidos: overview.kpis["PDF recibidos"], inspeccionesUnicas: overview.kpis["Inspecciones únicas"], puntajesValidos: overview.kpis["Puntajes válidos"], promedioGlobal: overview.kpis["Promedio global"], bajo70: overview.kpis["Bajo 70%"], puntajePerfecto: overview.kpis["Puntaje perfecto"], hallazgos: overview.kpis.Hallazgos, acciones: overview.kpis.Acciones },
    panorama: overview.panorama, distribution: overview.distribution, progress: analytics.progress,
    sections: details.sections.map((section) => ({ ...section, metrics: section.metrics.map(mapMetric) })),
    sectionInspections: approvals.map((item) => ({ name: item.name, total: item.total, evaluated: item.evaluated, approved: item.approved, belowThreshold: item.below, notEvaluated: item.notEvaluated, approvalPercentage: item.percentage, approvalThreshold: 70 })),
    weakMetrics: details.rankings.weak.map(mapMetric), strongMetrics: details.rankings.strong.map(mapMetric), scatter: details.rankings.scatter,
    traceability: analytics.traceability, geolocalizacion: analytics.geolocation, narrative: details.narrative,
  };
}

export function fallbackLegacyDashboard(snapshot: DashboardSnapshot): LegacyDashboardModel {
  const inspections = Number(snapshot.metrics.find((metric) => metric.id === "inspections")?.value ?? 0) || 0;
  return emptyModel(inspections);
}

function emptyModel(inspections = 0): LegacyDashboardModel {
  return { kpis: { pdfRecibidos: 0, inspeccionesUnicas: inspections, puntajesValidos: 0, promedioGlobal: "—", bajo70: 0, puntajePerfecto: 0, hallazgos: 0, acciones: 0 }, panorama: { media: null, mediana: null, p25: null, p75: null, "Puntaje perfecto": 0 }, distribution: [], progress: [], sections: [], sectionInspections: [], weakMetrics: [], strongMetrics: [], scatter: [], traceability: { total: 0, con_acciones: 0, sin_acciones: 0, porcentaje_sin_acciones: 0 }, geolocalizacion: { total: 0, con_geolocalizacion: 0, sin_geolocalizacion: 0, porcentaje_con_geolocalizacion: 0, direcciones_clasificadas: 0, direcciones_pendientes: 0, porcentaje_direcciones_clasificadas: 0, por_region: [] }, narrative: { epp: { directAverage: null, checklist: null }, sectionGap: { weakest: null, restAverage: null }, metricRange: { lowest: null, highest: null }, scatterRisk: { risk: 0, total: 0 }, lowBands: 0, healthy: 0, gap: 0 } };
}
