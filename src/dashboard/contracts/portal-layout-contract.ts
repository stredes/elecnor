import type { ReportRoute } from "./report-layout-contract";

export type PortalSidebarProps = { readonly homeHref?: string; readonly activeRoute?: ReportRoute; readonly mode?: "executive" | "legacy" };
