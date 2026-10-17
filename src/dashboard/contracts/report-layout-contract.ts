import type { ReactNode } from "react";

export type ReportLayoutProps = {
  readonly children: ReactNode;
  readonly activeRoute: "dashboard" | "metrics" | "inspections";
};
