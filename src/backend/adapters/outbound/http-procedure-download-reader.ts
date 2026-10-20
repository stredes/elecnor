import { BackendAdapterError, failureForStatus } from "./http-errors";
import { joinEndpoint, requestResponse, type HttpClientOptions } from "./http-json";
import type { DocumentDownload } from "../../ports/document-download-reader";

export class HttpProcedureDownloadReader {
  public constructor(
    private readonly endpoint: string,
    private readonly fetcher: typeof fetch = fetch,
    private readonly path = "/api/v1/procedures",
    private readonly options: HttpClientOptions = {},
  ) {}

  public async download(id: string): Promise<DocumentDownload> {
    const path = `${this.path.replace(/\/$/u, "")}/${encodeURIComponent(id)}/download`;
    const response = await requestResponse(this.fetcher, joinEndpoint(this.endpoint, path), {
      method: "GET", redirect: "manual", headers: { accept: "application/pdf" },
    }, this.options);
    if (response.status === 404) throw new BackendAdapterError("NOT_FOUND", "PDF not found.", 404);
    if (response.status >= 300 && response.status < 400) throw new BackendAdapterError("REJECTED", "PDF redirects are not allowed.", response.status);
    if (!response.ok) throw new BackendAdapterError(failureForStatus(response.status), "PDF request was rejected.", response.status);
    if (!response.body || !isPdf(response.headers.get("content-type"))) throw new BackendAdapterError("INVALID_RESPONSE", "PDF response is invalid.", response.status);
    return { body: response.body, contentType: "application/pdf", contentLength: contentLength(response.headers.get("content-length")), filename: filename(response.headers.get("content-disposition"), id) };
  }
}

function isPdf(value: string | null): boolean { return (value?.split(";", 1)[0].trim().toLowerCase() ?? "") === "application/pdf"; }
function contentLength(value: string | null): string | null { return value && /^\d+$/u.test(value) ? value : null; }
function filename(header: string | null, id: string): string { return safe(readFilename(header) ?? `procedure-${id}.pdf`); }
function readFilename(header: string | null): string | null {
  const encoded = header?.match(/filename\*=UTF-8''([^;]+)/iu)?.[1];
  if (encoded) try { return decodeURIComponent(encoded); } catch { return null; }
  return header?.match(/filename="?([^";]+)"?/iu)?.[1] ?? null;
}
function safe(value: string): string { const clean = value.replace(/[\\/\r\n\u0000-\u001f]/gu, "").trim().slice(0, 180) || "procedimiento.pdf"; return clean.toLowerCase().endsWith(".pdf") ? clean : `${clean}.pdf`; }
