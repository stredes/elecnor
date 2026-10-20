import { BackendAdapterError, failureForStatus } from "./http-errors";
import { joinEndpoint, requestResponse, type HttpClientOptions } from "./http-json";
import type { DocumentDownload, DocumentDownloadKind, DocumentDownloadReader } from "../../ports/document-download-reader";

export class HttpDocumentDownloadReader implements DocumentDownloadReader {
  public constructor(
    private readonly endpoint: string,
    private readonly fetcher: typeof fetch = fetch,
    private readonly paths: { readonly inspectionDownload: string; readonly documentDownload: string },
    private readonly options: HttpClientOptions = {},
    private readonly documentDownloadEnabled = true,
  ) {}

  public async download(kind: DocumentDownloadKind, id: string): Promise<DocumentDownload> {
    if (kind === "document" && !this.documentDownloadEnabled) throw new BackendAdapterError("FAILED_DEPENDENCY", "FastAPI no publica descarga por document_id.", 424);
    const path = kind === "inspection" ? this.paths.inspectionDownload : this.paths.documentDownload;
    const encoded = encodeURIComponent(id);
    const resolvedPath = path.includes("{id}") ? path.replace("{id}", encoded) : `${path}/${encoded}/download`;
    const url = joinEndpoint(this.endpoint, resolvedPath);
    const response = await requestResponse(this.fetcher, url, {
      method: "GET", redirect: "manual", headers: { accept: "application/pdf" },
    }, this.options);
    if (response.status === 404) throw new BackendAdapterError("NOT_FOUND", "PDF not found.", response.status);
    if (response.status >= 300 && response.status < 400) throw new BackendAdapterError("REJECTED", "PDF redirects are not allowed.", response.status);
    if (!response.ok) throw new BackendAdapterError(failureForStatus(response.status), "PDF request was rejected.", response.status);
    if (!response.body || !isPdf(response.headers.get("content-type"))) throw new BackendAdapterError("INVALID_RESPONSE", "PDF response is invalid.", response.status);
    return {
      body: response.body, contentType: "application/pdf", contentLength: length(response.headers.get("content-length")),
      filename: filename(response.headers.get("content-disposition"), id),
    };
  }
}

function isPdf(value: string | null): boolean { return (value?.split(";", 1)[0].trim().toLowerCase() ?? "") === "application/pdf"; }
function length(value: string | null): string | null { return value && /^\d+$/u.test(value) ? value : null; }
function filename(header: string | null, id: string): string { return safeName(readFilename(header) ?? `document-${id}.pdf`); }
function readFilename(header: string | null): string | null {
  const encoded = header?.match(/filename\*=UTF-8''([^;]+)/iu)?.[1];
  if (encoded) try { return decodeURIComponent(encoded); } catch { return null; }
  return header?.match(/filename="?([^";]+)"?/iu)?.[1] ?? null;
}
function safeName(value: string): string {
  const cleaned = value.replace(/[\\/\r\n\u0000-\u001f]/gu, "").trim().slice(0, 180) || "documento.pdf";
  return cleaned.toLowerCase().endsWith(".pdf") ? cleaned : `${cleaned}.pdf`;
}
