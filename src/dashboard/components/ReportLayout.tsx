import Link from "next/link";
import type { ReportLayoutProps } from "../contracts/report-layout-contract";

export function ReportLayout({ children, activeRoute }: ReportLayoutProps) {
  return (
    <>
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <header className="dashboard-nav">
        <Link href="/dashboard" aria-label="Elecnor · Inicio">ELECNOR</Link>
        <nav aria-label="Navegación principal">
          <Link href="/dashboard" aria-current={activeRoute === "dashboard" ? "page" : undefined}>Dashboard</Link>
          <Link href="/metricas" aria-current={activeRoute === "metrics" ? "page" : undefined}>Métricas</Link>
        </nav>
      </header>
      <main id="contenido" className="dashboard-shell">{children}</main>
    </>
  );
}
