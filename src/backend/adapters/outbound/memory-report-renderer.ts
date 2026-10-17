import type { ReportSnapshot } from "../../application/reporting/report-snapshot-contract";
import type { ReportCell, ReportRenderResult, RenderReport } from "../../ports/reporting/render-report";

export class MemoryReportRenderer implements RenderReport {
  public lastSnapshot: ReportSnapshot | null = null;

  public constructor(private readonly cells: readonly ReportCell[]) {}

  public render(snapshot: ReportSnapshot): Promise<ReportRenderResult> {
    this.lastSnapshot = snapshot;
    return Promise.resolve({ status: "RENDERED", sheets: [{ name: "synthetic", cells: [...this.cells] }] });
  }
}
