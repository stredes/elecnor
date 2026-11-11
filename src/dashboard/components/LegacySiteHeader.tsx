import type { ReportRoute } from "../contracts/report-layout-contract";
import { PortalSidebar } from "./PortalSidebar";

export function LegacySiteHeader({ homeHref = "/", activeRoute }: { readonly homeHref?: string; readonly activeRoute?: ReportRoute }) {
  return <PortalSidebar homeHref={homeHref} activeRoute={activeRoute} mode="legacy" />;
}
