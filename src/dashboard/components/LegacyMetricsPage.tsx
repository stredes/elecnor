import Link from "next/link";
import type { LegacyDashboardModel } from "../contracts/legacy-dashboard-contract";
import { LegacyMetricsVisualizations } from "./LegacyMetricsVisualizations";
import { LegacyPreventiveNarrative } from "./LegacyPreventiveNarrative";

export function LegacyMetricsPage({ model }: { readonly model: LegacyDashboardModel }) {
  return <><nav className="legacy-breadcrumb" aria-label="Breadcrumb"><Link href="/">Inicio</Link><span>/</span><span aria-current="page">Métricas preventivas</span></nav><header className="legacy-metrics-header"><p>HC Soluciones</p><h1 aria-label="Métricas">Métricas y progreso preventivo</h1><span>Transformamos los hallazgos de las inspecciones en medidas concretas y evidencia del avance alcanzado por la empresa en la protección de sus trabajadores.</span></header><LegacyPreventiveNarrative model={model} /><LegacyMetricsVisualizations model={model} /></>;
}
