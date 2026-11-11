import type { ReactNode } from "react";

export type ReportRoute = "dashboard" | "metrics" | "inspections" | "procedures" | "import" | "findings" | "unknowns" | "logs" | "elecnor" | "report";

export type ReportLayoutProps = {
  readonly children: ReactNode;
  readonly activeRoute: ReportRoute;
  readonly homeHref?: string;
  readonly showFooter?: boolean;
};
