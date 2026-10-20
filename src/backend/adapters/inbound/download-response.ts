import { Readable } from "node:stream";
import type { NextApiResponse } from "next";
import type { DocumentDownload } from "../../ports/document-download-reader";
import type { DownloadFile } from "../../ports/download-file-contract";

export function streamPdf(response: NextApiResponse, file: DocumentDownload): Promise<void> {
  return streamFile(response, file);
}

export function streamFile(response: NextApiResponse, file: DownloadFile): Promise<void> {
  response.setHeader("Content-Type", file.contentType);
  response.setHeader("Content-Disposition", disposition(file.filename));
  response.setHeader("Cache-Control", "private, no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  if (file.contentLength) response.setHeader("Content-Length", file.contentLength);
  const stream = Readable.fromWeb(file.body as import("node:stream/web").ReadableStream);
  return new Promise((resolve) => {
    stream.once("error", () => { response.destroy(); resolve(); });
    response.once("finish", () => resolve());
    stream.pipe(response);
  });
}

function disposition(filename: string): string {
  const safe = filename.replace(/["\\\r\n\u0000-\u001f]/gu, "").trim() || "documento.pdf";
  const fallback = safe.replace(/[^\x20-\x7e]/gu, "_");
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(safe)}`;
}
