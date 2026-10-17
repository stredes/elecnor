import Link from "next/link";
import { MetricCard } from "../components/MetricCard";
import { ReportLayout } from "../components/ReportLayout";
import type { DashboardViewProps } from "../contracts/dashboard-view-contract";

export function DashboardView({ snapshot }: DashboardViewProps) {
  return (
    <ReportLayout activeRoute="dashboard">
      <header className="dashboard-header">
          <div>
            <p className="eyebrow">ELECNOR · OPERACIONES</p>
            <h1>Panel de inspecciones</h1>
            <p className="subtitle">Una vista sintética para validar la nueva arquitectura.</p>
          </div>
          <span className={`status status-${snapshot.status}`}>{snapshot.status}</span>
      </header>
      <section className="metric-grid" aria-label="Indicadores principales">
        {snapshot.metrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
      </section>
      <footer className="dashboard-footer">
        <span>Datos sintéticos de desarrollo</span>
        <Link href="/api/health">Comprobar API</Link>
      </footer>
    </ReportLayout>
  );
}
