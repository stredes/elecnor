import type { ReportSnapshot } from "../../application/reporting/report-snapshot-contract";

export type ReportCell = {
  readonly type: "text" | "number" | "blank";
  readonly value: string | number | null;
};
export type ReportSheet = { readonly name: string; readonly cells: readonly ReportCell[] };
export type ReportRenderResult = { readonly status: "RENDERED"; readonly sheets: readonly ReportSheet[] };

export interface RenderReport {
  render(snapshot: ReportSnapshot): Promise<ReportRenderResult>;
}
