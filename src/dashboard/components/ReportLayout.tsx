import type { ReportLayoutProps } from "../contracts/report-layout-contract";
import { LegacySiteFooter } from "./LegacySiteFooter";
import { LegacySiteHeader } from "./LegacySiteHeader";

export function ReportLayout({ children, activeRoute, homeHref = "/dashboard", showFooter = true }: ReportLayoutProps) {
  return (
    <>
      <a className="legacy-skip-link" href="#contenido">Saltar al contenido</a>
      <LegacySiteHeader homeHref={homeHref} activeRoute={activeRoute} />
      <main id="contenido" className="legacy-page-shell" data-active-route={activeRoute}>{children}</main>
      {showFooter && <LegacySiteFooter />}
    </>
  );
}
