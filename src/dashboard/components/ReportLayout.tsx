import Link from "next/link";
import type { ReportLayoutProps } from "../contracts/report-layout-contract";

export function ReportLayout({ children }: ReportLayoutProps) {
  return (
    <>
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <header className="dashboard-nav">
        <Link href="/dashboard" aria-label="Elecnor · Inicio">ELECNOR</Link>
        <nav aria-label="Navegación principal">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/metricas">Métricas</Link>
        </nav>
      </header>
      <main id="contenido" className="dashboard-shell">{children}</main>
    </>
  );
}
