import type { ReportLayoutProps } from "../contracts/report-layout-contract";
import { LegacySiteFooter } from "./LegacySiteFooter";
import { PortalSidebar } from "./PortalSidebar";

export function ReportLayout({ children, activeRoute, homeHref = "/dashboard", showFooter = true }: ReportLayoutProps) {
  return (
    <div className="legacy-portal-shell">
      <a className="legacy-skip-link" href="#contenido">Saltar al contenido</a>
      <PortalSidebar homeHref={homeHref} activeRoute={activeRoute} mode="legacy" />
      <div className="legacy-portal-workspace">
        <main id="contenido" className="legacy-page-shell" data-active-route={activeRoute}>{children}</main>
        {showFooter && <LegacySiteFooter />}
      </div>
    </div>
  );
}
