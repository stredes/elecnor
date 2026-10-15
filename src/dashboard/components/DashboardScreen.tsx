import Link from "next/link";
import { MetricCard } from "./MetricCard";
import type { DashboardScreenProps } from "../contracts/dashboard-screen-contract";

export function DashboardScreen({ snapshot }: DashboardScreenProps) {
  return (
    <main className="dashboard-shell">
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
    </main>
  );
}
