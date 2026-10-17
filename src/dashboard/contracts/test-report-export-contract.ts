import type { ReportCell } from "@/backend/ports/reporting/render-report";

export type TestReportExportProps = { readonly cells: readonly ReportCell[] };
