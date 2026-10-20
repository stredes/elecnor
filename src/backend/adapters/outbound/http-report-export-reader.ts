import { BackendAdapterError, failureForStatus } from "./http-errors";
import { joinEndpoint, requestResponse, type HttpClientOptions, withDefaultScope } from "./http-json";
import type { ReportExport, ReportExportReader } from "../../ports/report-export-reader";

const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export class HttpReportExportReader implements ReportExportReader {
  public constructor(private readonly endpoint: string, private readonly fetcher: typeof fetch = fetch,
    private readonly path = "/api/v1/export/excel", private readonly options: HttpClientOptions = {}) {}

  public async download(): Promise<ReportExport> {
    const url = `${joinEndpoint(this.endpoint, this.path)}?scope=official`;
    const options = withDefaultScope({ ...this.options, requiredScope: "official" });
    const response = await requestResponse(this.fetcher, url, { method: "GET", headers: { accept: XLSX } }, options);
    if (!response.ok) throw new BackendAdapterError(failureForStatus(response.status), "La exportación fue rechazada.", response.status);
    if (!response.body || !isSpreadsheet(response.headers.get("content-type"))) {
      throw new BackendAdapterError("INVALID_RESPONSE", "La exportación no devolvió un XLSX válido.", response.status);
    }
    return { body: response.body, contentType: XLSX, contentLength: length(response.headers.get("content-length")), filename: filename(response.headers.get("content-disposition")) };
  }
}

function isSpreadsheet(value: string | null): boolean { return (value?.split(";", 1)[0].trim().toLowerCase() ?? "") === XLSX; }
function length(value: string | null): string | null { return value && /^\d+$/u.test(value) ? value : null; }
function filename(header: string | null): string {
  const encoded = header?.match(/filename\*=UTF-8''([^;]+)/iu)?.[1];
  const value = encoded ? decode(encoded) : header?.match(/filename="?([^";]+)"?/iu)?.[1];
  return safeName(value ?? "informe_visual_metricas_inspecciones.xlsx");
}
function decode(value: string): string { try { return decodeURIComponent(value); } catch { return ""; } }
function safeName(value: string): string { return value.replace(/[\\/\r\n\u0000-\u001f]/gu, "").trim().slice(0, 180) || "informe.xlsx"; }
