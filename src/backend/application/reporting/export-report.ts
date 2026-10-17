import type { ReadReportSnapshot } from "../../ports/reporting/read-report-snapshot";
import type { ReportRenderResult, RenderReport } from "../../ports/reporting/render-report";

export class ExportReport {
  public constructor(private readonly reader: ReadReportSnapshot, private readonly renderer: RenderReport) {}

  public async execute(): Promise<ReportRenderResult> {
    return this.renderer.render(await this.reader.read());
  }
}
